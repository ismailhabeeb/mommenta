import { Link } from "react-router-dom";
import LogoAnimated from "../components/Logo";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 relative overflow-hidden px-6 py-10">

      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Dark mode dot grid */}
      <div
        className="absolute inset-0 pointer-events-none hidden dark:block"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full">

        {/* Live badge */}
        <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full px-4 py-1.5 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400 font-light">
            Now live - share your world
          </span>
        </div>

        {/* Logo + Brand */}
        <div className="flex flex-col items-center mb-8">
          <LogoAnimated size={80} strokeWidth={16} />
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mt-4 tracking-tight">
            Mommenta
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-base text-gray-400 dark:text-gray-500 max-w-sm leading-relaxed mb-10 font-light">
          Capture your <span className="font-medium text-gray-600 dark:text-gray-300">moments</span>,
          connect with <span className="font-medium text-gray-600 dark:text-gray-300">friends</span>,
          and share your <span className="font-medium text-gray-600 dark:text-gray-300">stories</span>.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            to="/signup"
            className="w-full sm:w-auto px-10 py-3.5 rounded-full text-sm font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:opacity-80 transition-opacity text-center"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-10 py-3.5 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-center"
          >
            Log In
          </Link>
        </div>

        {/* Social proof */}
        <div className="flex items-center gap-3 mt-10">
          <div className="flex">
            {[
              { initials: "AK", bg: "#534AB7" },
              { initials: "TJ", bg: "#1D9E75" },
              { initials: "MR", bg: "#D85A30" },
              { initials: "+", bg: "#D4537E" },
            ].map((av, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-xs font-medium -ml-2 first:ml-0"
                style={{ background: av.bg }}
              >
                {av.initials}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-light">
            <span className="text-gray-700 dark:text-gray-300 font-semibold">12,000+</span> people sharing moments
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-5 mt-12">
          {["Share photos & stories", "Connect with friends", "Relive your memories"].map((f) => (
            <div key={f} className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 font-light">
              <span className="text-gray-300 dark:text-gray-600">✦</span>
              {f}
            </div>
          ))}
        </div>

      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-16 text-xs text-gray-300 dark:text-gray-600 font-light text-center">
        © {new Date().getFullYear()} Mommenta. All rights reserved.
      </footer>

    </div>
  );
}