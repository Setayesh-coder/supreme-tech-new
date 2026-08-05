import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { blogAPI } from "../../lib/api/blog";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../components/ui/GlassButton";
import { OptimizedImage } from "../../components/ui/OptimizedImage";
import {
  Calendar,
  Eye,
  Clock,
  ArrowLeft,
  Search,
  ImageOff,
  Loader2,
} from "lucide-react";
import { BlogListSkeleton } from "../../components/skeletons/BlogListSkeleton";
import SectionHeader from "../../components/ui/SectionHeader";
import { getImageUrl } from "../../lib/constants";

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

const PAGE_SIZE = 10;

function BlogCardSkeleton() {
  return (
    <LiquidGlassCard
      className="overflow-hidden h-full"
      borderRadius="16px"
      blurIntensity="sm"
      glowIntensity="sm"
    >
      <div className="h-48 bg-white/5 animate-pulse" />
      <div className="p-6 space-y-3">
        <div className="h-3 w-1/2 bg-white/10 rounded animate-pulse" />
        <div className="h-5 w-3/4 bg-white/10 rounded animate-pulse" />
        <div className="h-3 w-full bg-white/10 rounded animate-pulse" />
        <div className="h-3 w-2/3 bg-white/10 rounded animate-pulse" />
      </div>
    </LiquidGlassCard>
  );
}

export default function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await blogAPI.getAll({ page: 1, limit: PAGE_SIZE });
        const fetched = data.posts || [];
        setPosts(fetched);
        setHasMore(fetched.length === PAGE_SIZE);
      } catch (err) {
        setError("خطا در دریافت پست‌ها");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await blogAPI.getAll({ page: nextPage, limit: PAGE_SIZE });
      const fetched = data.posts || [];
      setPosts((prev) => [...prev, ...fetched]);
      setHasMore(fetched.length === PAGE_SIZE);
      setPage(nextPage);
    } catch (err) {
      setError("خطا در دریافت پست‌های بیشتر");
    } finally {
      setLoadingMore(false);
    }
  };

  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((post) => post.tags.forEach((tag) => set.add(tag.name)));
    return Array.from(set).slice(0, 10);
  }, [posts]);

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      !search ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesTag =
      !activeTag || post.tags.some((tag) => tag.name === activeTag);
    return matchesSearch && matchesTag;
  });

  if (loading) {
    return <BlogListSkeleton />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 px-4">
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
        <SectionHeader
          badge="وبلاگ Supreme Tech"
          badgeIcon={<Calendar className="w-4 h-4 text-blue-400" />}
          title="آخرین مطالب"
          subtitle="جدیدترین مقالات و مطالب آموزشی"
          description="در حوزه هوش مصنوعی، طراحی وب و توسعه نرم‌افزار"
        />

        <div className="flex flex-col md:flex-row items-center gap-4 mb-10">
          <div className="relative w-full md:w-80">
            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در مطالب..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pr-10 pl-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-400/40 transition-colors"
            />
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setActiveTag(null)}
                className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                  !activeTag
                    ? "bg-blue-500/20 text-blue-400 border border-blue-400/30"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
                }`}
              >
                همه
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                    activeTag === tag
                      ? "bg-blue-500/20 text-blue-400 border border-blue-400/30"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <LiquidGlassCard
              className="p-12 text-center max-w-md"
              borderRadius="24px"
              blurIntensity="lg"
              glowIntensity="md"
            >
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {posts.length === 0
                  ? "هنوز پستی وجود ندارد"
                  : "نتیجه‌ای پیدا نشد"}
              </h3>
              <p className="text-gray-400">
                {posts.length === 0
                  ? "به زودی اولین پست وبلاگ منتشر خواهد شد"
                  : "عبارت یا تگ دیگری را امتحان کنید"}
              </p>
            </LiquidGlassCard>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Link to={`/blog/${post.slug}`} key={post.id}>
                <LiquidGlassCard
                  className="overflow-hidden h-full group flex flex-col"
                  borderRadius="16px"
                  blurIntensity="sm"
                  glowIntensity="sm"
                  hoverScale={1.03}
                >
                  <div className="overflow-hidden h-48 relative">
                    {post.coverImage ? (
                      <OptimizedImage
                        src={getImageUrl(post.coverImage) || post.coverImage}
                        alt={post.title}
                        className="w-full h-full transition-transform duration-500 group-hover:scale-110"
                        objectFit="cover"
                        quality={80}
                        loading="lazy"
                        fallback="/placeholder-image.jpg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex flex-col items-center justify-center gap-2">
                        <ImageOff className="w-12 h-12 text-white/20" />
                        <span className="text-white/30 text-sm">
                          بدون تصویر
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {!post.published && (
                      <span className="absolute top-3 right-3 px-3 py-1 bg-yellow-500/80 text-white text-xs rounded-full backdrop-blur-sm">
                        پیش‌نویس
                      </span>
                    )}
                  </div>

                  <div className="p-6 space-y-3 flex flex-col flex-1">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(post.createdAt).toLocaleDateString("fa-IR")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={14} />
                        {(post.views || 0).toLocaleString()}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h2>

                    <p className="text-gray-400 text-sm line-clamp-2">
                      {post.excerpt}
                    </p>

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

                    <div className="pt-4 mt-auto flex items-center justify-between border-t border-white/5">
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
        )}

        {!loading && hasMore && !search && !activeTag && posts.length > 0 && (
          <div className="text-center mt-12">
            <GlassButton
              variant="primary"
              size="md"
              onClick={loadMore}
              disabled={loadingMore}
              icon={
                loadingMore ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Clock size={18} />
                )
              }
              iconPosition="left"
              className="!rounded-full !px-8"
            >
              {loadingMore ? "در حال بارگذاری..." : "بارگذاری بیشتر"}
            </GlassButton>
          </div>
        )}
      </div>
    </section>
  );
}
