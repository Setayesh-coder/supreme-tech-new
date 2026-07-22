// src/pages/admin/BlogList.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { blogAPI } from "../../lib/api/blog";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { Calendar, Eye, Clock, ArrowLeft } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await blogAPI.getAll({
          page: 1,
          limit: 10,
        });
        setPosts(data.posts || []);
      } catch (err) {
        setError("خطا در دریافت پست‌ها");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <LiquidGlassCard
          className="p-6 text-center"
          borderRadius="16px"
          blurIntensity="sm"
          glowIntensity="md"
        >
          <p className="text-red-400">{error}</p>
        </LiquidGlassCard>
      </div>
    );
  }

  return (
    <section className="py-12 px-4 md:px-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <LiquidGlassCard
              blurIntensity="md"
              borderRadius="100px"
              glowIntensity="sm"
              className="inline-flex px-4 py-2"
            >
              <span className="text-sm font-medium text-gray-300">
                📝 وبلاگ Supreme Tech
              </span>
            </LiquidGlassCard>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              آخرین مطالب
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            جدیدترین مقالات و مطالب آموزشی در حوزه هوش مصنوعی، طراحی وب و توسعه
            نرم‌افزار
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link to={`/blog/${post.slug}`} key={post.id}>
              <LiquidGlassCard
                className="overflow-hidden h-full group"
                borderRadius="16px"
                blurIntensity="sm"
                glowIntensity="sm"
                hoverScale={1.03}
              >
                {/* Cover Image */}
                {post.coverImage && (
                  <div className="overflow-hidden h-48 relative">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {/* Status Badge */}
                    {!post.published && (
                      <span className="absolute top-3 right-3 px-3 py-1 bg-yellow-500/80 text-white text-xs rounded-full backdrop-blur-sm">
                        پیش‌نویس
                      </span>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-6 space-y-3">
                  {/* Meta */}
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(post.createdAt).toLocaleDateString("fa-IR")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {post.views.toLocaleString()}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {post.excerpt}
                  </p>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.name}
                          className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400"
                        >
                          #{tag.name}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="px-3 py-1 text-xs text-gray-500">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Read More */}
                  <div className="pt-4 flex items-center justify-between border-t border-white/5">
                    <span className="text-sm text-blue-400 group-hover:text-blue-300 transition-colors flex items-center gap-1">
                      مطالعه بیشتر
                      <ArrowLeft
                        size={16}
                        className="group-hover:-translate-x-1 transition-transform"
                      />
                    </span>
                    {post.author && (
                      <span className="text-sm text-gray-500">
                        {post.author.name}
                      </span>
                    )}
                  </div>
                </div>
              </LiquidGlassCard>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {posts.length === 0 && (
          <div className="flex justify-center items-center py-20">
            <LiquidGlassCard
              className="p-12 text-center max-w-md"
              borderRadius="24px"
              blurIntensity="lg"
              glowIntensity="md"
            >
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                هنوز پستی وجود ندارد
              </h3>
              <p className="text-gray-400">
                به زودی اولین پست وبلاگ منتشر خواهد شد
              </p>
            </LiquidGlassCard>
          </div>
        )}

        {/* Load More (اگر API پشتیبانی کنه) */}
        {posts.length > 0 && (
          <div className="text-center mt-12">
            <LiquidGlassCard
              className="inline-block px-8 py-3 cursor-pointer"
              borderRadius="100px"
              blurIntensity="sm"
              glowIntensity="sm"
              hoverScale={1.05}
              onClick={() => console.log("بارگذاری بیشتر...")}
            >
              <span className="text-blue-400 font-medium flex items-center gap-2">
                <Clock size={18} />
                بارگذاری بیشتر
              </span>
            </LiquidGlassCard>
          </div>
        )}
      </div>
    </section>
  );
}
