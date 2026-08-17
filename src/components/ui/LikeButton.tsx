import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { blogAPI } from "../../lib/api/blog";

interface LikeButtonProps {
  postId: string;
  initialLikes?: number;
  size?: "sm" | "md" | "lg";
}

export default function LikeButton({
  postId,
  initialLikes = 0,
  size = "md",
}: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkLikeStatus();
  }, [postId]);

  const checkLikeStatus = async () => {
    try {
      const response = await blogAPI.getLikeStatus(postId);
      setIsLiked(response.is_liked || false);
      if (response.likes_count !== undefined) {
        setLikes(response.likes_count);
      }
    } catch (error) {
      console.error("خطا در بررسی وضعیت لایک:", error);
    }
  };

  const toggleLike = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await blogAPI.toggleLike(postId);
      setIsLiked(response.is_liked || !isLiked);
      setLikes(response.likes_count || likes + (isLiked ? -1 : 1));
    } catch (error) {
      console.error("خطا در لایک:", error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className="flex items-center gap-1.5 transition-colors hover:text-red-500 group"
    >
      <Heart
        className={`${sizeClasses[size]} transition-all ${isLiked ? "fill-red-500 text-red-500" : "text-gray-400 group-hover:text-red-400"}`}
      />
      <span className={`text-sm ${isLiked ? "text-red-500" : "text-gray-400"}`}>
        {likes}
      </span>
    </button>
  );
}
