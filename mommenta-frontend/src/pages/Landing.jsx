import { Link } from "react-router-dom";
import LogoAnimated from "../components/Logo";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center 
      bg-gradient-to-br from-brand-gradientStart  
      text-white px-6 py-10">

      {/* Logo + Title */}
      <div className="flex flex-col sm:flex-row items-center sm:space-x-3 mb-8 text-center sm:text-left">
        <LogoAnimated 
          size={120} 
          strokeWidth={30} 
          className="w-20 h-20 sm:w-24 sm:h-24"
        />

        <h1 className="text-4xl sm:text-5xl font-heading font-bold mt-4 sm:mt-0">
          Mommenta
        </h1>
      </div>

      {/* Tagline */}
      <p className="text-base sm:text-lg max-w-md text-center mb-10 leading-relaxed">
        Capture your <span className="font-semibold">moments</span>, 
        connect with <span className="font-semibold">friends</span>, 
        and share your <span className="font-semibold">stories</span>.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Link 
          to="/signup" 
          className="btn-gradient text-center py-3 px-8 rounded-xl text-lg font-medium"
        >
          Get Started
        </Link>

        <Link 
          to="/login" 
          className="btn-primary bg-white text-brand hover:bg-gray-100 
          text-center py-3 px-8 rounded-xl text-lg font-medium"
        >
          Log In
        </Link>
      </div>

      {/* Footer */}
      <footer className="mt-14 text-sm text-white/80 text-center">
        © {new Date().getFullYear()} Mommenta. All rights reserved.
      </footer>
    </div>
  );
}
