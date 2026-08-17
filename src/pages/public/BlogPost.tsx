// src/pages/public/BlogPost.tsx

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { blogAPI } from "../../lib/api/blog";
import type { BlogPost } from "../../lib/api/blog";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { OptimizedImage } from "../../components/ui/OptimizedImage";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
// @ts-ignore
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// @ts-ignore
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
  List as ListIcon,
  Send,
} from "lucide-react";
import { BlogPostSkeleton } from "../../components/skeletons/BlogPostSkeleton";
import { getImageUrl } from "../../lib/constants";

// آیکون‌ها
const TwitterIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

interface Heading {
  level: number;
  text: string;
  id: string;
}

const slugify = (text: string) =>
  text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, "");

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedBlock, setCopiedBlock] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // ✅ تابع getNodeText به عنوان یک تابع کمکی داخل کامپوننت
  const getNodeText = (node: unknown): string => {
    if (typeof node === "string" || typeof node === "number")
      return String(node);
    if (Array.isArray(node)) return node.map(getNodeText).join("");
    if (node && typeof node === "object" && "props" in (node as any)) {
      return getNodeText((node as any).props?.children);
    }
    return "";
  };

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      try {
        const data = await blogAPI.getBySlug(slug);
        setPost(data);
        setLikesCount(data.likes_count || 0);
        await checkLikeStatus(data.id);
      } catch (err) {
        setError("پست مورد نظر پیدا نشد");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  const checkLikeStatus = async (postId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await blogAPI.getLikeStatus(postId);
      setLiked(response.is_liked);
      setLikesCount(response.likes_count);
    } catch (error) {
      console.error("❌ خطا در بررسی وضعیت لایک:", error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const el = contentRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [post]);

  const headings = useMemo<Heading[]>(() => {
    if (!post) return [];
    return post.content
      .split("\n")
      .filter((line) => /^#{2,3}\s/.test(line))
      .map((line) => {
        const level = line.match(/^#+/)![0].length;
        const text = line.replace(/^#+\s*/, "").trim();
        return { level, text, id: slugify(text) };
      });
  }, [post]);

  const readingMinutes = post
    ? Math.max(1, Math.ceil(post.content.split(" ").length / 200))
    : 0;

  const handleLike = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("برای لایک کردن باید وارد حساب کاربری خود شوید.");
      return;
    }

    if (likeLoading || !post) return;
    setLikeLoading(true);

    try {
      const response = await blogAPI.toggleLike(post.id);
      setLiked(response.is_liked);
      setLikesCount(response.likes_count);
    } catch (error) {
      console.error("❌ خطا در لایک کردن:", error);
    } finally {
      setLikeLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("خطا در کپی کردن", err);
    }
  };

  const copyCodeBlock = async (value: string, index: number) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedBlock(index);
      setTimeout(
        () => setCopiedBlock((cur) => (cur === index ? null : cur)),
        2000,
      );
    } catch (err) {
      console.error("خطا در کپی کردن کد", err);
    }
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(post?.title || "");

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${title}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${title}`,
    };

    if (shareUrls[platform]) {
      window.open(
        shareUrls[platform],
        "_blank",
        "noopener,noreferrer,width=600,height=500",
      );
      setShowShareMenu(false);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.summary || post?.title,
          url: window.location.href,
        });
      } catch (err) {
        console.error("خطا در اشتراک‌گذاری:", err);
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  if (loading) {
    return <BlogPostSkeleton />;
  }

  if (error || !post) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4 mt-4">
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

  let codeBlockIndex = -1;

  const markdownComponents: Components = {
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

      codeBlockIndex += 1;
      const thisIndex = codeBlockIndex;

      return match ? (
        <div className="relative rounded-lg overflow-hidden my-4">
          <div className="flex items-center justify-between px-4 py-2 bg-black/40 text-xs text-gray-400">
            <span>{match[1]}</span>
            <button
              onClick={() => copyCodeBlock(value, thisIndex)}
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              {copiedBlock === thisIndex ? (
                <>
                  <Check size={14} className="text-green-400" />
                  کپی شد
                </>
              ) : (
                <>
                  <Copy size={14} />
                  کپی
                </>
              )}
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

    p({ children, node }) {
      let hasBlockElement = false;
      if (node?.children) {
        const checkBlockElements = (nodes: any[]): boolean => {
          for (const child of nodes) {
            if (
              child.tagName === "img" ||
              child.tagName === "table" ||
              child.tagName === "figure"
            ) {
              return true;
            }
            if (child.children) {
              return checkBlockElements(child.children);
            }
          }
          return false;
        };
        hasBlockElement = checkBlockElements(node.children);
      }

      if (hasBlockElement) {
        return <>{children}</>;
      }

      return <p className="text-gray-300 leading-relaxed mb-4">{children}</p>;
    },

    // ✅ استفاده از getNodeText در h1
    h1({ children }) {
      const id = slugify(getNodeText(children));
      return (
        <h1
          id={id}
          className="text-3xl font-bold text-white mt-8 mb-4 scroll-mt-24"
        >
          {children}
        </h1>
      );
    },
    // ✅ استفاده از getNodeText در h2
    h2({ children }) {
      const id = slugify(getNodeText(children));
      return (
        <h2
          id={id}
          className="text-2xl font-bold text-white mt-8 mb-4 scroll-mt-24"
        >
          {children}
        </h2>
      );
    },
    // ✅ استفاده از getNodeText در h3
    h3({ children }) {
      const id = slugify(getNodeText(children));
      return (
        <h3
          id={id}
          className="text-xl font-bold text-white mt-6 mb-3 scroll-mt-24"
        >
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
        <figure className="my-6">
          <OptimizedImage
            src={getImageUrl(src) || src || ""}
            alt={alt || "تصویر"}
            className="rounded-lg w-full shadow-lg"
            objectFit="cover"
            quality={85}
            loading="lazy"
            fallback="/placeholder-image.jpg"
          />
          {alt && (
            <figcaption className="text-center text-sm text-gray-400 mt-3">
              {alt}
            </figcaption>
          )}
        </figure>
      );
    },
    table({ children }) {
      return (
        <div className="overflow-x-auto my-6 rounded-lg border border-white/10">
          <table className="min-w-full border-collapse">{children}</table>
        </div>
      );
    },
    thead({ children }) {
      return <thead className="bg-white/5">{children}</thead>;
    },
    tbody({ children }) {
      return <tbody>{children}</tbody>;
    },
    tr({ children }) {
      return (
        <tr className="border-b border-white/10 last:border-0">{children}</tr>
      );
    },
    th({ children }) {
      return (
        <th className="px-4 py-3 text-right text-white font-semibold">
          {children}
        </th>
      );
    },
    td({ children }) {
      return <td className="px-4 py-3 text-right text-gray-300">{children}</td>;
    },
    hr() {
      return <hr className="my-8 border-white/10" />;
    },
  };

  return (
    <section className="py-12 px-4 md:px-6 relative overflow-hidden min-h-screen">
      {/* Progress Bar */}
      <div className="fixed top-0 right-0 left-0 h-1 bg-white/5 z-50">
        <div
          className="h-full bg-gradient-to-l from-blue-400 to-cyan-400 transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-transparent" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Back Button */}
        <Link to="/blog" className="inline-block mb-6 mt-10">
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

        {/* Cover Image */}
        <LiquidGlassCard
          className="overflow-hidden mb-6 "
          borderRadius="24px"
          blurIntensity="lg"
          glowIntensity="md"
          shadowIntensity="lg"
        >
          {post.cover_image && (
            <div className="relative overflow-hidden h-64 md:h-96">
              <OptimizedImage
                src={getImageUrl(post.cover_image) || post.cover_image}
                alt={post.title}
                className="w-full h-full"
                objectFit="cover"
                quality={90}
                priority={true}
                loading="eager"
                fallback="/placeholder-image.jpg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            </div>
          )}

          <div className="p-6 md:p-8 lg:p-10 pb-6">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6 pb-6 border-b border-white/10">
              <span className="flex items-center gap-1.5">
                <Calendar size={16} />
                {post.created_at
                  ? new Date(post.created_at).toLocaleDateString("fa-IR")
                  : "نامشخص"}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye size={16} />
                {(post.views_count || 0).toLocaleString()} بازدید
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <User size={16} />
                {post.author_name}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <Clock size={16} />
                {readingMinutes} دقیقه مطالعه
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </LiquidGlassCard>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2" ref={contentRef}>
            <LiquidGlassCard
              className="p-6 md:p-8 lg:p-10"
              borderRadius="24px"
              blurIntensity="lg"
              glowIntensity="md"
            >
              <div className="prose prose-invert prose-blue max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  components={markdownComponents}
                >
                  {post.content}
                </ReactMarkdown>
              </div>
            </LiquidGlassCard>
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-6 space-y-6">
            {/* Table of Contents */}
            {headings.length > 0 && (
              <LiquidGlassCard
                className="p-5"
                borderRadius="20px"
                blurIntensity="lg"
                glowIntensity="sm"
              >
                <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                  <ListIcon size={16} />
                  فهرست مطالب
                </h3>
                <nav className="space-y-2">
                  {headings.map((h) => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      className={`block text-sm text-gray-400 hover:text-blue-400 transition-colors ${
                        h.level === 3 ? "pr-4" : ""
                      }`}
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>
              </LiquidGlassCard>
            )}

            {/* Like & Share */}
            <LiquidGlassCard
              className="p-5"
              borderRadius="20px"
              blurIntensity="lg"
              glowIntensity="sm"
            >
              <span className="text-sm text-gray-400 block mb-3">
                اشتراک‌گذاری این مطلب
              </span>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleLike}
                  disabled={likeLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    liked
                      ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Heart
                    size={18}
                    className={`transition-all duration-300 ${
                      liked ? "fill-red-400 scale-110" : ""
                    } ${likeLoading ? "animate-pulse" : ""}`}
                  />
                  <span className="text-sm font-medium">
                    {likesCount > 0 ? likesCount.toLocaleString() : "لایک"}
                  </span>
                </button>

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

              {showShareMenu && (
                <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleShare("twitter")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 text-[#1DA1F2] rounded-lg transition-colors text-xs"
                  >
                    <TwitterIcon />
                    توییتر
                  </button>
                  <button
                    onClick={() => handleShare("linkedin")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A66C2]/20 hover:bg-[#0A66C2]/30 text-[#0A66C2] rounded-lg transition-colors text-xs"
                  >
                    <LinkedinIcon />
                    لینکدین
                  </button>
                  <button
                    onClick={() => handleShare("telegram")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#26A5E4]/20 hover:bg-[#26A5E4]/30 text-[#26A5E4] rounded-lg transition-colors text-xs"
                  >
                    <Send size={14} />
                    تلگرام
                  </button>
                </div>
              )}
            </LiquidGlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}
