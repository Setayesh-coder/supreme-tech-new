// src/components/ui/LikeButton.tsx
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { blogAPI } from "../../lib/api/blog";

interface LikeButtonProps {
  postId: string;
  initialLikes?: number;
  onLikeChange?: (liked: boolean, likes: number) => void;
}

export default function LikeButton({
  postId,
  initialLikes = 0,
  onLikeChange,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await blogAPI.getLikeStatus(postId);
        if (response.success) {
          setLiked(response.liked);
        }
      } catch (error) {
        console.error("❌ خطا در بررسی وضعیت لایک:", error);
      }
    };
    checkStatus();
  }, [postId]);

  const handleLike = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("برای لایک کردن باید وارد حساب کاربری خود شوید.");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const response = await blogAPI.toggleLike(postId);
      if (response.success) {
        setLiked(response.liked);
        setLikesCount(response.likes);
        onLikeChange?.(response.liked, response.likes);
      }
    } catch (error) {
      console.error("❌ خطا در لایک کردن:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
        liked
          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
          : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <Heart
        size={18}
        className={`transition-all duration-300 ${
          liked ? "fill-red-400 scale-110" : ""
        } ${loading ? "animate-pulse" : ""}`}
      />
      <span className="text-sm font-medium">
        {likesCount > 0 ? likesCount.toLocaleString() : "لایک"}
      </span>
    </button>
  );
}
