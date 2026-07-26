// src/components/ui/ShareButton.tsx
import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { LiquidGlassCard } from "./LiquidGlassCard";

interface ShareButtonProps {
  title: string;
  excerpt?: string;
  url?: string;
  className?: string;
}

export default function ShareButton({
  title,
  excerpt = "",
  url = window.location.href,
  className = "",
}: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setTimeout(() => setShowMenu(false), 500);
    } catch (err) {
      console.error("خطا در کپی کردن", err);
    }
  };

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    // const encodedExcerpt = encodeURIComponent(excerpt);

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    };

    if (shareUrls[platform]) {
      window.open(
        shareUrls[platform],
        "_blank",
        "noopener,noreferrer,width=600,height=500",
      );
      setShowMenu(false);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: excerpt || title,
          url,
        });
      } catch (err) {
        console.error("خطا در اشتراک‌گذاری:", err);
      }
    } else {
      setShowMenu(!showMenu);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* دکمه اصلی */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleNativeShare}
          aria-label="اشتراک‌گذاری"
          className="p-2 rounded-full bg-blue-500/20 hover:bg-blue-500/30 transition-colors group"
        >
          <Share2
            size={18}
            className="text-blue-400 group-hover:text-blue-300 transition-colors"
          />
        </button>
        <button
          onClick={copyToClipboard}
          aria-label="کپی لینک"
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors group"
        >
          {copied ? (
            <Check size={18} className="text-green-400" />
          ) : (
            <Copy
              size={18}
              className="text-gray-400 group-hover:text-white transition-colors"
            />
          )}
        </button>
      </div>

      {/* منوی شبکه‌های اجتماعی */}
      {showMenu && (
        <div className="absolute top-full left-0 mt-2 z-50 min-w-[200px]">
          <LiquidGlassCard
            className="p-3"
            borderRadius="16px"
            blurIntensity="lg"
            glowIntensity="sm"
          >
            <div className="space-y-2">
              <button
                onClick={() => handleShare("twitter")}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-gray-300 hover:text-white"
              >
                <span className="text-[#1DA1F2]">🐦</span>
                توییتر
              </button>
              <button
                onClick={() => handleShare("linkedin")}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-gray-300 hover:text-white"
              >
                <span className="text-[#0A66C2]">💼</span>
                لینکدین
              </button>
              <button
                onClick={() => handleShare("telegram")}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-gray-300 hover:text-white"
              >
                <span className="text-[#26A5E4]">✈️</span>
                تلگرام
              </button>
              <button
                onClick={() => handleShare("whatsapp")}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-gray-300 hover:text-white"
              >
                <span className="text-[#25D366]">💬</span>
                واتساپ
              </button>
              <button
                onClick={() => handleShare("facebook")}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-gray-300 hover:text-white"
              >
                <span className="text-[#1877F2]">👍</span>
                فیسبوک
              </button>
            </div>
          </LiquidGlassCard>
        </div>
      )}
    </div>
  );
}
