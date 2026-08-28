// src/components/admin/DailyChart.tsx
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { Eye, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface DailyStat {
  date: string;
  views: number;
  unique_visitors: number;
}

interface DailyChartProps {
  data: DailyStat[];
  loading?: boolean;
  title?: string;
}

export function DailyChart({
  data,
  loading,
  title = "📈 بازدید روزانه",
}: DailyChartProps) {
  if (loading) {
    return (
      <LiquidGlassCard className="p-6" borderRadius="20px" blurIntensity="lg">
        <div className="flex justify-center items-center h-48">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </LiquidGlassCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <LiquidGlassCard className="p-6" borderRadius="20px" blurIntensity="lg">
        <div className="text-center py-12 text-gray-400">
          <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>هیچ داده‌ای برای نمایش وجود ندارد</p>
          <p className="text-xs text-gray-500 mt-1">
            پس از ثبت بازدیدها، آمار در این بخش نمایش داده می‌شود
          </p>
        </div>
      </LiquidGlassCard>
    );
  }

  const maxViews = Math.max(...data.map((d) => d.views), 1);
  const totalViews = data.reduce((sum, d) => sum + d.views, 0);
  const avgViews = Math.round(totalViews / data.length);
  const lastDayViews = data[data.length - 1]?.views || 0;
  const firstDayViews = data[0]?.views || 0;
  const trend = lastDayViews - firstDayViews;
  const trendPercent =
    firstDayViews > 0 ? Math.round((trend / firstDayViews) * 100) : 0;

  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = () => {
    if (trend > 0) return "text-green-400";
    if (trend < 0) return "text-red-400";
    return "text-gray-400";
  };

  const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

  return (
    <LiquidGlassCard className="p-6" borderRadius="20px" blurIntensity="lg">
      {/* هدر با آمار کلی */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-400" />
            {title}
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            {data.length} روز • {totalViews.toLocaleString()} بازدید کل
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-500 text-xs">میانگین روزانه</p>
            <p className="text-white font-bold">{avgViews.toLocaleString()}</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <p className="text-gray-500 text-xs">روند</p>
            <div
              className={`flex items-center gap-1 font-bold ${getTrendColor()}`}
            >
              {getTrendIcon()}
              <span>
                {trendPercent > 0 ? "+" : ""}
                {trendPercent}%
              </span>
            </div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <p className="text-gray-500 text-xs">بیشترین</p>
            <p className="text-white font-bold">{maxViews.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* نمودار */}
      <div className="relative">
        <div className="flex items-end gap-1 h-48">
          {data.map((day, index) => {
            const height = (day.views / maxViews) * 100;
            const date = new Date(day.date);
            const dayName = weekDays[date.getDay()];
            const dayNumber = date.getDate();

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-1 group"
              >
                <div className="relative w-full">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500/60 to-blue-400/40 rounded-t hover:from-blue-400 hover:to-blue-300 transition-all duration-300 group-hover:scale-y-110 origin-bottom cursor-pointer"
                    style={{ height: `${Math.max(height, 3)}%` }}
                  >
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900/95 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-xl border border-white/10">
                      <div className="font-bold">
                        {day.views.toLocaleString()} بازدید
                      </div>
                      <div className="text-gray-400 text-[10px]">
                        {day.unique_visitors.toLocaleString()} بازدیدکننده
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-1">
                  <span className="text-[10px] text-gray-500 block">
                    {dayNumber}
                  </span>
                  <span className="text-[8px] text-gray-600">{dayName}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-xs text-gray-500">
        <span>آخرین بروزرسانی: {new Date().toLocaleTimeString("fa-IR")}</span>
        <span>بیشترین بازدید: {maxViews.toLocaleString()}</span>
      </div>
    </LiquidGlassCard>
  );
}
