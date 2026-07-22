// src/pages/public/BlogPost.tsx
// @ts-nocheck  // ← غیرفعال کردن TypeScript برای این فایل
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { blogAPI } from "../../lib/api/blog";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Calendar,
  Eye,
  User,
  ArrowLeft,
  Clock,
  Share2,
  Heart,
  Copy,
  Check,
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  views: number;
  createdAt: string;
  author?: { name: string };
  tags: { name: string }[];
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      try {
        const data = await blogAPI.getBySlug(slug);
        setPost(data);
      } catch (err) {
        setError("پست مورد نظر پیدا نشد");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("خطا در کپی کردن", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <LiquidGlassCard
          className="p-8 text-center max-w-md"
          borderRadius="24px"
          blurIntensity="lg"
          glowIntensity="md"
        >
          <div className="text-6xl mb-4">😕</div>
          <h3 className="text-xl font-bold text-white mb-2">{error}</h3>
          <p className="text-gray-400 mb-6">مطلب مورد نظر شما یافت نشد</p>
          <Link to="/blog">
            <LiquidGlassCard
              className="inline-block px-6 py-2"
              borderRadius="100px"
              blurIntensity="sm"
              glowIntensity="sm"
              hoverScale={1.05}
            >
              <span className="text-blue-400 font-medium flex items-center gap-2">
                <ArrowLeft size={18} />
                بازگشت به بلاگ
              </span>
            </LiquidGlassCard>
          </Link>
        </LiquidGlassCard>
      </div>
    );
  }

  return (
    <section className="py-12 px-4 md:px-6 relative overflow-hidden min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-transparent" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="container mx-auto max-w-4xl relative z-10">
        <Link to="/blog" className="inline-block mb-6">
          <LiquidGlassCard
            className="px-4 py-2"
            borderRadius="100px"
            blurIntensity="sm"
            glowIntensity="sm"
            hoverScale={1.05}
          >
            <span className="text-gray-300 flex items-center gap-2 text-sm group">
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />
              بازگشت به بلاگ
            </span>
          </LiquidGlassCard>
        </Link>

        <LiquidGlassCard
          className="overflow-hidden"
          borderRadius="24px"
          blurIntensity="lg"
          glowIntensity="md"
          shadowIntensity="lg"
        >
          {post.coverImage && (
            <div className="relative overflow-hidden h-64 md:h-96">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          )}

          <div className="p-6 md:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6 pb-6 border-b border-white/10">
              <span className="flex items-center gap-1.5">
                <Calendar size={16} />
                {new Date(post.createdAt).toLocaleDateString("fa-IR")}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye size={16} />
                {post.views.toLocaleString()} بازدید
              </span>
              {post.author && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-1.5">
                    <User size={16} />
                    {post.author.name}
                  </span>
                </>
              )}
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <Clock size={16} />
                {Math.ceil(post.content.split(" ").length / 200)} دقیقه مطالعه
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <span
                    key={tag.name}
                    className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Markdown Content */}
            <div className="prose prose-invert prose-blue max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const value = String(children).replace(/\n$/, "");
                    const isInline = !className;

                    if (isInline) {
                      return (
                        <code
                          className="px-1.5 py-0.5 bg-white/10 rounded text-sm text-cyan-300 font-mono"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }

                    return match ? (
                      <div className="relative rounded-lg overflow-hidden my-4">
                        <div className="flex items-center justify-between px-4 py-2 bg-black/40 text-xs text-gray-400">
                          <span>{match[1]}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(value);
                            }}
                            className="hover:text-white transition-colors flex items-center gap-1"
                          >
                            <Copy size={14} />
                            کپی
                          </button>
                        </div>
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          className="!m-0 !bg-black/40"
                        >
                          {value}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  p({ children }) {
                    return (
                      <p className="text-gray-300 leading-relaxed mb-4">
                        {children}
                      </p>
                    );
                  },
                  h1({ children }) {
                    return (
                      <h1 className="text-3xl font-bold text-white mt-8 mb-4">
                        {children}
                      </h1>
                    );
                  },
                  h2({ children }) {
                    return (
                      <h2 className="text-2xl font-bold text-white mt-8 mb-4">
                        {children}
                      </h2>
                    );
                  },
                  h3({ children }) {
                    return (
                      <h3 className="text-xl font-bold text-white mt-6 mb-3">
                        {children}
                      </h3>
                    );
                  },
                  ul({ children }) {
                    return (
                      <ul className="list-disc list-inside space-y-2 text-gray-300 my-4">
                        {children}
                      </ul>
                    );
                  },
                  ol({ children }) {
                    return (
                      <ol className="list-decimal list-inside space-y-2 text-gray-300 my-4">
                        {children}
                      </ol>
                    );
                  },
                  li({ children }) {
                    return <li className="text-gray-300">{children}</li>;
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote className="border-r-4 border-blue-500 pr-4 my-4 text-gray-400 italic">
                        {children}
                      </blockquote>
                    );
                  },
                  a({ href, children }) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline transition-colors"
                      >
                        {children}
                      </a>
                    );
                  },
                  img({ src, alt }) {
                    return (
                      <img
                        src={src}
                        alt={alt}
                        className="rounded-lg my-4 w-full"
                      />
                    );
                  },
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto my-4">
                        <table className="min-w-full border border-white/10 rounded-lg">
                          {children}
                        </table>
                      </div>
                    );
                  },
                  th({ children }) {
                    return (
                      <th className="px-4 py-2 bg-white/5 border border-white/10 text-white font-semibold">
                        {children}
                      </th>
                    );
                  },
                  td({ children }) {
                    return (
                      <td className="px-4 py-2 border border-white/10 text-gray-300">
                        {children}
                      </td>
                    );
                  },
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">اشتراک‌گذاری:</span>
                <button
                  onClick={copyToClipboard}
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
                <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors group">
                  <Share2
                    size={18}
                    className="text-gray-400 group-hover:text-white transition-colors"
                  />
                </button>
                <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors group">
                  <Heart
                    size={18}
                    className="text-gray-400 group-hover:text-red-400 transition-colors"
                  />
                </button>
              </div>
            </div>
          </div>
        </LiquidGlassCard>
      </div>
    </section>
  );
}
