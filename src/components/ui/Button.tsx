// import { ButtonHTMLAttributes } from "react";

// interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
//   variant?: "primary" | "secondary" | "danger" | "success" | "glass";
//   size?: "sm" | "md" | "lg";
//   loading?: boolean;
//   fullWidth?: boolean;
// }

// export function Button({
//   children,
//   variant = "primary",
//   size = "md",
//   loading = false,
//   fullWidth = false,
//   className = "",
//   disabled,
//   ...props
// }: ButtonProps) {
//   const variants = {
//     primary:
//       "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white",
//     secondary:
//       "bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white",
//     danger:
//       "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white",
//     success:
//       "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white",
//     glass:
//       "bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white",
//   };

//   const sizes = {
//     sm: "px-4 py-2 text-sm",
//     md: "px-6 py-3 text-base",
//     lg: "px-8 py-4 text-lg",
//   };

//   return (
//     <button
//       className={`
//         ${variants[variant]}
//         ${sizes[size]}
//         ${fullWidth ? "w-full" : ""}
//         rounded-xl font-medium
//         transition-all duration-200
//         disabled:opacity-50 disabled:cursor-not-allowed
//         hover:scale-[1.02] active:scale-[0.98]
//         ${className}
//       `}
//       disabled={disabled || loading}
//       {...props}
//     >
//       {loading ? (
//         <div className="flex items-center justify-center gap-2">
//           <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//           در حال انجام...
//         </div>
//       ) : (
//         children
//       )}
//     </button>
//   );
// }
