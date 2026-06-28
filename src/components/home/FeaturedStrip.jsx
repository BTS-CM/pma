import React from "react";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";
import { TrendingUp, Clock, Sparkles } from "lucide-react";

export default function FeaturedStrip({ liveStats }) {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });

  if (!liveStats || !liveStats.available) {
    return null;
  }

  const items = [
    {
      key: "active",
      icon: TrendingUp,
      value: liveStats.active,
      label: t("Home:hero.statActive", { count: liveStats.active }).replace(
        /^[\s\d,]+/,
        "",
      ),
      accent: "text-emerald-300",
      dot: "bg-emerald-400",
    },
    {
      key: "closing",
      icon: Clock,
      value: liveStats.closingSoon,
      label: t("Home:hero.statClosing", { count: liveStats.closingSoon }).replace(
        /^[\s\d,]+/,
        "",
      ),
      accent: "text-amber-300",
      dot: "bg-amber-400",
    },
    {
      key: "new",
      icon: Sparkles,
      value: liveStats.newlyCreated,
      label: t("Home:hero.statNew", { count: liveStats.newlyCreated }).replace(
        /^[\s\d,]+/,
        "",
      ),
      accent: "text-sky-300",
      dot: "bg-sky-400",
    },
  ];

  return (
    <div
      className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm dark:text-white/85 text-foreground/85"
      aria-live="polite"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <span
            key={item.key}
            className="inline-flex items-center gap-2"
            title={item.label}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${item.dot} animate-pulse`} />
            <Icon className={`h-3.5 w-3.5 ${item.accent}`} />
            <span className="font-semibold tabular-nums dark:text-white text-foreground">
              {item.value.toLocaleString()}
            </span>
            <span className="dark:text-white/70 text-foreground/70">{item.label}</span>
          </span>
        );
      })}
    </div>
  );
}
