"use client";

import { ZapIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ThemeAwareLogo } from "./ThemeAwareLogo";
import { DERRIMUT_BRAND } from "@/constants/branding";

const Footer = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getCurrentYear = () => {
    if (!mounted) return '2025'; // fallback year for SSR
    return new Date().getFullYear().toString();
  };
  return (
    <footer className="border-t border-white/10 bg-neutral-950/80 backdrop-blur-sm">
      {/* Top border gradient */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo and Copyright */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center">
                <ThemeAwareLogo 
                  width={40} 
                  height={40} 
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-semibold text-white tracking-tight">
                {DERRIMUT_BRAND.nameShort.toUpperCase()}
              </span>
            </Link>
            <p className="text-sm text-white/60">
              © {getCurrentYear()} {DERRIMUT_BRAND.nameShort} - All rights reserved
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-2 text-sm">
            <Link
              href="/about"
              className="text-white/60 hover:text-white transition-colors"
            >
              About
            </Link>
            <Link
              href="/terms"
              className="text-white/60 hover:text-white transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-white/60 hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/contact"
              className="text-white/60 hover:text-white transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/blog"
              className="text-white/60 hover:text-white transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/help"
              className="text-white/60 hover:text-white transition-colors"
            >
              Help
            </Link>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 px-3 py-2 border border-white/10 rounded-lg bg-white/5 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-xs font-mono text-white/70">SYSTEM OPERATIONAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
