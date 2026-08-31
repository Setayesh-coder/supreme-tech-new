// src/pages/admin/Blog/BlogList.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { blogAPI } from "../../../lib/api/blog";
import { showConfirmToast } from "../../../components/ui/confirm-toast";
import type { BlogPost } from "../../../lib/api/blog";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Search,
  Calendar,
  BookOpen,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function BlogListAdmin() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const data = await blogAPI.getAll({ limit: 100, page: 1 });
      setPosts(data.items || []);
    } catch (err) {
      console.error(<X />, " خطا:", err);
      setError("خطا در دریافت پست‌ها");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    showConfirmToast({
      title: "آیا از حذف این پست مطمئن هستید؟",
      description: "این عمل غیرقابل بازگشت است و پست به طور کامل حذف خواهد شد.",
      variant: "danger",
      confirmText: "بله، حذف شود",
      cancelText: "انصراف",
      onConfirm: async () => {
        try {
          await blogAPI.delete(id);
          setPosts(posts.filter((p) => p.id !== id));
          toast.success("✅ پست با موفقیت حذف شد");
        } catch (err) {
          toast.error("❌ خطا در حذف پست");
        }
      },
    });
  };

  // ✅ تغییر: استفاده از summary به جای excerpt
  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.summary?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatDate = (date: string | null) => {
    if (!date) return "نامشخص";
    return new Date(date).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <span className="text-gray-400 mr-3">در حال بارگذاری...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              مدیریت وبلاگ
            </h1>
            <p className="text-gray-400 text-sm mt-1">مدیریت پست‌های وبلاگ</p>
          </div>
          <Link to="/admin/blog/create">
            <GlassButton
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              iconPosition="left"
            >
              پست جدید
            </GlassButton>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="جستجوی پست‌ها..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pr-10 pl-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4">
            ❌ {error}
          </div>
        )}

        {filteredPosts.length === 0 ? (
          <LiquidGlassCard
            className="p-12 text-center"
            borderRadius="16px"
            blurIntensity="sm"
          >
            <div className="text-6xl mb-4">
              {" "}
              <BookOpen />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">پستی یافت نشد</h3>
            <p className="text-gray-400">هنوز پستی ایجاد نشده است</p>
          </LiquidGlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPosts.map((post) => (
              <LiquidGlassCard
                key={post.id}
                className="p-4"
                borderRadius="16px"
                blurIntensity="sm"
                glowIntensity="sm"
              >
                {post.cover_image && (
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                    onError={(e) =>
                      ((e.target as HTMLImageElement).style.display = "none")
                    }
                  />
                )}
                <h3 className="text-lg font-bold text-white line-clamp-2">
                  {post.title}
                </h3>
                {/* ✅ تغییر: summary به جای excerpt */}
                <p className="text-gray-400 text-sm line-clamp-2 mt-1">
                  {post.summary}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(post.created_at)}
                  </span>
                  <span
                    className={
                      post.published ? "text-green-400" : "text-yellow-400"
                    }
                  >
                    {post.published ? " منتشر شده" : " پیش‌نویس"}
                  </span>
                  <span className="text-gray-500"> {post.views_count}</span>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                  <Link to={`/admin/blog/edit/${post.id}`} className="flex-1">
                    <GlassButton
                      variant="secondary"
                      size="sm"
                      fullWidth
                      icon={<Edit className="w-4 h-4" />}
                      iconPosition="left"
                    >
                      ویرایش
                    </GlassButton>
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </LiquidGlassCard>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
