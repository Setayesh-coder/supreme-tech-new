import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { blogAPI } from "../../../lib/api/blog";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { Plus, Edit, Trash2, Eye } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  views: number;
  createdAt: string;
  author?: { name: string };
  tags: { name: string }[];
}

export default function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // ❌ خط token رو حذف کنید چون interceptor خودش مدیریت میکنه
  // const token = localStorage.getItem("token") || "";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // ✅ بدون ارسال توکن - interceptor خودش اضافه میکنه
        const data = await blogAPI.getAll({ limit: 100 });
        setPosts(data.posts || []);
      } catch (err) {
        setError("خطا در دریافت پست‌ها");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این پست مطمئن هستید؟")) return;

    try {
      // ✅ بدون ارسال توکن - interceptor خودش اضافه میکنه
      await blogAPI.delete(id);
      setPosts(posts.filter((p) => p.id !== id));
    } catch (err) {
      alert("خطا در حذف پست");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">📝 مدیریت بلاگ</h1>
            <p className="text-white/60 mt-1">مدیریت پست‌های وبلاگ</p>
          </div>
          <Link
            to="/admin/blog/create"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 flex items-center gap-2"
          >
            <Plus size={18} />
            پست جدید
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl">
            {error}
          </div>
        )}

        <LiquidGlassCard
          className="overflow-hidden"
          borderRadius="16px"
          blurIntensity="sm"
          glowIntensity="sm"
          shadowIntensity="md"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-medium text-white/60">
                    عنوان
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-white/60">
                    وضعیت
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-white/60">
                    بازدید
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-white/60">
                    تاریخ
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-white/60">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-white font-medium">
                          {post.title}
                        </div>
                        <div className="text-white/40 text-sm">
                          {post.tags.map((t) => t.name).join("، ")}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          post.published
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {post.published ? "منتشر شده" : "پیش‌نویس"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/60">
                      <div className="flex items-center gap-1">
                        <Eye size={14} />
                        {post.views}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/40 text-sm">
                      {new Date(post.createdAt).toLocaleDateString("fa-IR")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/admin/blog/edit/${post.id}`}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all duration-200"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </LiquidGlassCard>

        {posts.length === 0 && (
          <div className="text-center py-12 text-white/40">
            <p className="text-2xl mb-2">📭</p>
            <p>هنوز پستی ایجاد نشده است</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
