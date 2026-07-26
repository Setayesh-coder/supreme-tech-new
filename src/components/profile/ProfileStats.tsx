// src/components/profile/ProfileStats.tsx
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Award,
  ShoppingCart,
  Ticket,
} from "lucide-react";

interface ProfileStatsProps {
  stats: {
    totalEnrollments: number;
    confirmedEnrollments: number;
    pendingEnrollments: number;
    attendedEnrollments: number;
    cartCount: number;
    ticketCount: number;
  };
  onStatClick: (tab: string) => void;
}

export function ProfileStats({ stats, onStatClick }: ProfileStatsProps) {
  const statItems = [
    {
      icon: BookOpen,
      label: "دوره‌ها",
      value: stats.totalEnrollments,
      color: "blue",
      tab: "enrollments",
    },
    {
      icon: CheckCircle,
      label: "تایید شده",
      value: stats.confirmedEnrollments,
      color: "green",
      tab: "enrollments",
    },
    {
      icon: Clock,
      label: "در انتظار",
      value: stats.pendingEnrollments,
      color: "yellow",
      tab: "enrollments",
    },
    {
      icon: Award,
      label: "حضور",
      value: stats.attendedEnrollments,
      color: "purple",
      tab: "enrollments",
    },
    {
      icon: ShoppingCart,
      label: "سبد خرید",
      value: stats.cartCount,
      color: "orange",
      tab: "cart",
    },
    {
      icon: Ticket,
      label: "تیکت‌ها",
      value: stats.ticketCount,
      color: "red",
      tab: "tickets",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {statItems.map((stat, index) => (
        <LiquidGlassCard
          key={index}
          className="p-4 text-center cursor-pointer hover:bg-white/5 transition-all duration-300"
          borderRadius="16px"
          blurIntensity="sm"
          glowIntensity="sm"
          onClick={() => onStatClick(stat.tab)}
        >
          <stat.icon
            className={`w-6 h-6 mx-auto mb-2 text-${stat.color}-400`}
          />
          <p className="text-2xl font-bold text-white">{stat.value}</p>
          <p className="text-xs text-gray-400">{stat.label}</p>
        </LiquidGlassCard>
      ))}
    </div>
  );
}
