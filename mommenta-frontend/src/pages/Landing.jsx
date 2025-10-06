import { Link } from "react-router-dom";
import logo from "../assets/images/logo.png"; // ✅ replace with your logo

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-gradientStart to-brand-gradientEnd text-white">
      
      {/* Logo */}
      <div className="flex items-center space-x-3 mb-6">
        <img src={logo} alt="Mommenta Logo" className="w-12 h-12" />
        <h1 className="text-4xl font-heading font-bold">Mommenta</h1>
      </div>

      {/* Tagline */}
      <p className="text-lg max-w-md text-center mb-8">
        Capture your <span className="font-semibold">moments</span>, 
        connect with <span className="font-semibold">friends</span>, 
        and share your <span className="font-semibold">stories</span>.
      </p>

      {/* CTA Buttons */}
      <div className="flex space-x-4">
        <Link to="/signup" className="btn-gradient">
          Get Started
        </Link>
        <Link to="/login" className="btn-primary bg-white text-brand hover:bg-gray-100">
          Log In
        </Link>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-sm text-white/80">
        © {new Date().getFullYear()} Mommenta. All rights reserved.
      </footer>
    </div>
  );
}
