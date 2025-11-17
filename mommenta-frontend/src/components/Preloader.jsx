// src/components/Preloader.jsx
import LogoAnimated from "./Logo";

export default function Preloader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 z-50 animate-fade">
      <div className="flex flex-col items-center gap-4">
        <LogoAnimated
          size={150}
          strokeWidth={35}
          className="w-20 h-20 sm:w-24 sm:h-24"
        />
      </div>
    </div>
  );
}
