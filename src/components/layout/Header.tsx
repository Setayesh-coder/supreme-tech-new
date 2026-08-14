import { useState, useEffect } from "react";
import { Menu, User, X } from "lucide-react";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { useSettings } from "../../contexts/SettingsContext";
import { Link } from "react-router-dom";

export default function Header() {
  const [, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings, loading } = useSettings();

  const navItems = [
    { name: "خانه", href: "/" },
    { name: "خدمات", href: "/services" },
    { name: "رویداد", href: "/events" },
    { name: "وبلاگ", href: "/blog" },
    // { name: "رویکرد ما", href: "/approach" },
    { name: "درباره ما", href: "/about" },
    { name: "تماس با ما", href: "/contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
      <div className="max-w-7xl mx-auto">
        <LiquidGlassCard
          blurIntensity="lg"
          borderRadius="100px"
          glowIntensity="sm"
          className="px-4 py-2"
        >
          <div className="flex items-center justify-between">
            {/* Logo - 🔥 مسیر مطلق */}
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/favicon/favicon-96x96.png"
                alt="لوگو Supreme Tech"
                className="w-8 h-8"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/favicon.ico";
                }}
              />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {loading ? "..." : settings?.site_title || "Supreme Tech"}
              </span>
            </Link>

            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Desktop Button */}
            <div className="hidden md:block">
              <LiquidGlassCard
                blurIntensity="lg"
                borderRadius="16px"
                glowIntensity="sm"
                className="overflow-hidden group cursor-pointer hover:scale-105 transition-all duration-300"
              >
                <Link to="/profile">
                  <button
                    className="px-6 py-2 text-white font-bold flex items-center gap-2 justify-center 
                    bg-gradient-to-r from-blue-500/80 to-blue-600/80 
                    backdrop-blur-sm border border-blue-400/30 text-sm"
                  >
                    <User className="w-5 h-5" />
                  </button>
                </Link>
              </LiquidGlassCard>
            </div>

            {/* Mobile Menu Button */}
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4">
          <LiquidGlassCard
            blurIntensity="lg"
            borderRadius="24px"
            className="p-4"
          >
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <LiquidGlassCard
                blurIntensity="lg"
                borderRadius="16px"
                glowIntensity="sm"
                className="overflow-hidden group cursor-pointer hover:scale-105 transition-all duration-300 mt-2"
              >
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                  <button
                    className="w-full py-3 text-white font-bold flex items-center gap-2 justify-center 
                    bg-gradient-to-r from-blue-500/80 to-blue-600/80 
                    backdrop-blur-sm border border-blue-400/30 text-sm"
                  >
                    <User className="w-5 h-5" />
                    پروفایل
                  </button>
                </Link>
              </LiquidGlassCard>
            </nav>
          </LiquidGlassCard>
        </div>
      )}
    </header>
  );
}
