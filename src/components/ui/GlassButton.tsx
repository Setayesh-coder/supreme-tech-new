import { LiquidGlassCard } from './LiquidGlassCard';
import { ArrowLeft, Target } from 'lucide-react';
import { ReactNode } from 'react';

interface GlassButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  icon?: 'arrow' | 'target' | 'none';
  className?: string;
}

export default function GlassButton({ 
  children, 
  onClick, 
  variant = 'primary',
  icon = 'none',
  className = ''
}: GlassButtonProps) {
  
  const getIcon = () => {
    if (icon === 'arrow') {
      return <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />;
    }
    if (icon === 'target') {
      return <Target className="w-5 h-5" />;
    }
    return null;
  };

  const variants = {
    primary: {
      gradient: "from-blue-600 to-cyan-600",
      text: "text-white",
      glow: "md"
    },
    secondary: {
      gradient: "",
      text: "text-white",
      glow: "sm"
    }
  };

  const currentVariant = variants[variant];

  if (variant === 'primary') {
    return (
      <button
        onClick={onClick}
        className={`group bg-gradient-to-r ${currentVariant.gradient} hover:scale-105 px-8 py-3 rounded-2xl ${currentVariant.text} font-bold flex items-center gap-2 transition-all duration-300 shadow-lg shadow-blue-500/25 ${className}`}
      >
        {children}
        {getIcon()}
      </button>
    );
  }

  return (
    <LiquidGlassCard
      draggable={false}
      expandable={false}
      blurIntensity="lg"
      borderRadius="16px"
      glowIntensity={currentVariant.glow as any}
      className="overflow-hidden"
    >
      <button
        onClick={onClick}
        className={`group px-8 py-3 rounded-2xl ${currentVariant.text} font-bold flex items-center gap-2 transition-all duration-300 w-full ${className}`}
      >
        {children}
        {getIcon()}
      </button>
    </LiquidGlassCard>
  );
}
