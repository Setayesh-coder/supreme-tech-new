// src/components/layout/Header.tsx
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { LiquidGlassCard } from "../ui/LiquidGlassCard"; // فایل اصلی بدون تغییر

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: "خانه", href: "/" },
    { name: "خدمات", href: "/services" },
    { name: "درباره ما", href: "/about" },
    { name: "تماس با ما", href: "/contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
      <div className="max-w-7xl mx-auto">
        <LiquidGlassCard
          draggable={false}
          expandable={false}
          blurIntensity="lg"
          borderRadius="100px"
          className="px-4 py-2"
        >
          <div className=" z-30 flex items-center  text-white  justify-between">
            <a href="/">
              {/* <img
                src=""
                alt="SUPREME TECH"
                className="w-8 h-8 text-blue-400"
              /> */}
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Supreme Tech
              </span>
            </a>
            <nav className="hidden md:flex items-center gap-1">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </nav>
            <div className="hidden md:block">
              <a href="/signup">
                <button className="bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-2 rounded-full text-white text-sm font-medium">
                  شروع رایگان
                </button>
              </a>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-full bg-white/10"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </LiquidGlassCard>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4">
          <LiquidGlassCard
            draggable={false}
            expandable={false}
            blurIntensity="lg"
            borderRadius="24px"
            className="p-4"
          >
            <nav className="flex flex-col gap-2">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <a href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="mt-2 w-full bg-gradient-to-r from-blue-600 to-cyan-600 py-3 rounded-full text-white text-sm font-medium">
                  شروع رایگان
                </button>
              </a>
            </nav>
          </LiquidGlassCard>
        </div>
      )}
    </header>
  );
}
