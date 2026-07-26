// src/components/profile/ProfileTabs.tsx
import { BookOpen, ShoppingCart, Ticket } from "lucide-react";

interface ProfileTabsProps {
  activeTab: "enrollments" | "cart" | "tickets" | "replies";
  onTabChange: (tab: "enrollments" | "cart" | "tickets") => void;
  cartCount: number;
  ticketCount: number;
}

export function ProfileTabs({
  activeTab,
  onTabChange,
  cartCount,
  ticketCount,
}: ProfileTabsProps) {
  const tabs = [
    { id: "enrollments", label: "دوره‌های من", icon: BookOpen, count: null },
    { id: "cart", label: "سبد خرید", icon: ShoppingCart, count: cartCount },
    { id: "tickets", label: "تیکت‌ها", icon: Ticket, count: ticketCount },
  ];

  const getTabColor = (tabId: string) => {
    switch (tabId) {
      case "enrollments":
        return "blue";
      case "cart":
        return "orange";
      case "tickets":
        return "red";
      default:
        return "blue";
    }
  };

  return (
    <div className="flex gap-2 mb-6 border-b border-white/10 pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id as any)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
            activeTab === tab.id
              ? `bg-${getTabColor(tab.id)}-500/20 text-${getTabColor(tab.id)}-400 border border-${getTabColor(tab.id)}-400/30`
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
          {tab.count !== null && tab.count > 0 && (
            <span
              className={`bg-${getTabColor(tab.id)}-500/30 text-white text-xs px-2 py-0.5 rounded-full`}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
