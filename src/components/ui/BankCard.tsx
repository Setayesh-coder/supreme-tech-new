// src/components/ui/BankCard.tsx
import { useState } from "react";
import { Copy, Check, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BankCardProps {
  cardNumber: string;
  cardHolderName: string;
  className?: string;
}

export function BankCard({
  cardNumber,
  cardHolderName,
  className = "",
}: BankCardProps) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatCardNumber = (number: string) => {
    const cleaned = number.replace(/\s/g, "");
    const parts = cleaned.match(/.{1,4}/g);
    if (!parts) return number;

    // ✅ معکوس کردن ترتیب گروه‌ها (برای نمایش صحیح)
    const reversed = [...parts].reverse();
    return reversed.join(" ");
  };

  const displayNumber = formatCardNumber(cardNumber) || "**** **** **** ****";

  const handleCopy = async () => {
    const cleanNumber = cardNumber.replace(/\s/g, "");
    await navigator.clipboard.writeText(cleanNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className={`relative w-full max-w-md aspect-[1.586/1] rounded-2xl overflow-hidden shadow-2xl cursor-pointer ${className}`}
      whileHover={{ scale: 1.02, rotateZ: 0.5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCopy}
    >
      {/* پس‌زمینه */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400">
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10" />

        <div className="absolute inset-0 opacity-10">
          <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 320">
            <path
              fill="white"
              fillOpacity="0.3"
              d="M0,160L48,149.3C96,139,192,117,288,122.7C384,128,480,160,576,181.3C672,203,768,213,864,197.3C960,181,1056,139,1152,117.3C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
        </div>
      </div>

      <div className="absolute inset-0 opacity-[0.06]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, white 1.5px, transparent 1.5px),
              radial-gradient(circle at 80% 50%, white 1.5px, transparent 1.5px)
            `,
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full border-2 border-white/10" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full border-2 border-white/10" />

      {/* محتوای کارت */}
      <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-between text-white">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] opacity-60 font-medium tracking-wider">
              بلو بانک
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2">
            <CreditCard className="w-5 h-5 text-white/80" />
          </div>
        </div>

        {/* ✅ شماره کارت با ترتیب صحیح */}
        <div className="text-center">
          <p className="text-[10px] opacity-40 font-medium tracking-[0.2em] mb-1.5">
            شماره کارت
          </p>
          <div className="flex items-center justify-center gap-2 px-2">
            <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold tracking-[0.1em] font-mono whitespace-nowrap overflow-hidden text-ellipsis dir-ltr">
              {displayNumber}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm border border-white/10 flex-shrink-0"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                  >
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                  >
                    <Copy className="w-3.5 h-3.5 text-white/60 hover:text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
          {copied && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] text-green-400 mt-1 font-medium"
            >
              ✅ کپی شد!
            </motion.p>
          )}
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] opacity-40 font-medium tracking-[0.15em]">
              نام دارنده
            </p>
            <p className="text-xs md:text-sm font-bold tracking-wide uppercase truncate max-w-[120px]">
              {cardHolderName || "نام نامشخص"}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-[8px] opacity-20 font-mono tracking-widest">
              BLUE BANK
            </div>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <span className="text-[10px] md:text-xs font-bold text-white/60">
                BB
              </span>
            </div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-16 right-6 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-300 via-blue-200 to-blue-300 shadow-lg"
          animate={{
            rotate: isHovered ? 360 : 0,
          }}
          transition={{ duration: 2, repeat: isHovered ? Infinity : 0 }}
        >
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-transparent to-white/20" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none"
          />
        )}
      </AnimatePresence>

      <motion.div
        className="absolute -inset-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
        animate={{
          x: isHovered ? ["100%", "200%"] : "100%",
        }}
        transition={{
          duration: 1.5,
          repeat: isHovered ? Infinity : 0,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}
