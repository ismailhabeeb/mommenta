import { useEffect, useRef, useState } from "react";
import Icon from "@mdi/react";
import { mdiClose, mdiImagePlus, mdiVideo } from "@mdi/js";
import toast from "react-hot-toast";
import { createStory } from "../services";

const MAX_SIZE = 50 * 1024 * 1024;
const imageExtensions = /\.(jpe?g|png|webp|gif|avif)$/i;
const videoExtensions = /\.(mp4|mov|webm|m4v)$/i;

export default function StoryComposer({ onClose, onCreated }) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !uploading) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, uploading]);

  const selectFile = (event) => {
    const selected = event.target.files?.[0];
    event.target.value = "";
    if (!selected) return;
    const validImage = selected.type.startsWith("image/") && imageExtensions.test(selected.name);
    const validVideo = selected.type.startsWith("video/") && videoExtensions.test(selected.name);
    if (!validImage && !validVideo) {
      toast.error("Choose a supported image or video file.");
      return;
    }
    if (selected.size > MAX_SIZE) {
      toast.error("Stories must be 50 MB or smaller.");
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file || uploading) return;
    const formData = new FormData();
    formData.append("media", file);
    formData.append("caption", caption.trim());
    setUploading(true);
    setProgress(0);
    try {
      await createStory(formData, {
        onUploadProgress: (event) => {
          if (event.total) setProgress(Math.round((event.loaded / event.total) * 100));
        },
      });
      toast.success("Your story is live for 24 hours.");
      await onCreated();
    } catch (error) {
      console.error("Story upload failed:", error);
      toast.error(error.response?.data?.msg || "Unable to upload your story.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !uploading) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="story-create-title"
        className="flex max-h-[94dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
      >
        <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <h2 id="story-create-title" className="font-heading text-lg font-semibold text-gray-900 dark:text-white">
            Create a story
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            aria-label="Close story creator"
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-50 dark:hover:bg-gray-800"
          >
            <Icon path={mdiClose} size={1} aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-56 flex-1 items-center justify-center overflow-auto bg-gray-950 p-4">
            {file && previewUrl ? (
              file.type.startsWith("video/") ? (
                <video
                  src={previewUrl}
                  controls
                  playsInline
                  className="max-h-[55dvh] max-w-full rounded-lg"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Preview of your story"
                  className="max-h-[55dvh] max-w-full rounded-lg object-contain"
                />
              )
            ) : (
              <div className="text-center text-gray-300">
                <Icon path={mdiImagePlus} size={2.25} className="mx-auto mb-3 text-purple-300" aria-hidden="true" />
                <p className="font-medium">Choose one photo or video</p>
                <p className="mt-1 text-sm text-gray-400">Up to 50 MB · visible for 24 hours</p>
              </div>
            )}
          </div>

          <div className="space-y-3 p-4">
            <label className="sr-only" htmlFor="story-caption">Optional caption</label>
            <textarea
              id="story-caption"
              value={caption}
              onChange={(event) => setCaption(event.target.value.slice(0, 500))}
              placeholder="Add a caption..."
              maxLength={500}
              rows={2}
              disabled={uploading}
              className="input resize-none"
            />
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <Icon path={mdiImagePlus} size={0.85} aria-hidden="true" />
                  {file ? "Change media" : "Choose media"}
                </button>
                {file && (
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    disabled={uploading}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 disabled:opacity-50 dark:hover:bg-red-950/30"
                  >
                    Remove
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/quicktime,video/webm,video/x-m4v"
                  onChange={selectFile}
                  className="sr-only"
                  tabIndex={-1}
                  aria-label="Choose story photo or video"
                />
              </div>
              <span className="text-xs text-gray-500">{caption.length}/500</span>
            </div>

            {uploading && (
              <div aria-live="polite">
                <div className="mb-1 flex justify-between text-xs text-gray-500">
                  <span>Uploading story</span>
                  <span>{progress}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-label="Story upload progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                  className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
                >
                  <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!file || uploading}
              className="btn-primary flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {file?.type.startsWith("video/") && <Icon path={mdiVideo} size={0.9} aria-hidden="true" />}
              {uploading ? "Uploading..." : "Share story"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
