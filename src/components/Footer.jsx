import React from 'react';
import { Github, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left side - App info */}
          <div className="text-sm text-gray-600">
            <p className="flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-red-500 fill-current" /> for jump rope enthusiasts
            </p>
          </div>

          {/* Center - Copyright */}
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Jump Rope Manager
          </div>

          {/* Right side - GitHub link */}
          <div>
            <a
              href="https://github.com/whoaducks26/sg-jumprope-app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
            >
              <Github className="w-5 h-5" />
              <span>View on GitHub</span>
            </a>
          </div>
        </div>

        {/* Optional: Additional info */}
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Built with React, Supabase, and Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}