import React from "react";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";
import {
  Activity,
  Clock,
  Sparkles,
  Wallet,
  PlusCircle,
  ArrowUpRight,
} from "lucide-react";

export default function QuickJumps({ liveStats }) {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });

  const activeCount =
    liveStats && liveStats.available ? liveStats.active : null;
  const closingCount =
    liveStats && liveStats.available ? liveStats.closingSoon : null;
  const newCount =
    liveStats && liveStats.available ? liveStats.newlyCreated : null;

  const JUMPS = [
    {
      key: "active",
      icon: Activity,
      href: "/active-predictions.html",
      titleKey: "Home:quickJump.active",
      hintKey: "Home:quickJump.activeHint",
      badge: activeCount,
      accent: "from-emerald-500/15 to-emerald-500/0 border-emerald-500/30",
      iconAccent: "text-emerald-400 bg-emerald-500/10",
    },
    {
      key: "closingSoon",
      icon: Clock,
      href: "/active-predictions.html?filter=closing-soon",
      titleKey: "Home:quickJump.closingSoon",
      hintKey: "Home:quickJump.closingSoonHint",
      badge: closingCount,
      accent: "from-amber-500/15 to-amber-500/0 border-amber-500/30",
      iconAccent: "text-amber-400 bg-amber-500/10",
    },
    {
      key: "new",
      icon: Sparkles,
      href: "/active-predictions.html?filter=new",
      titleKey: "Home:quickJump.new",
      hintKey: "Home:quickJump.newHint",
      badge: newCount,
      accent: "from-sky-500/15 to-sky-500/0 border-sky-500/30",
      iconAccent: "text-sky-400 bg-sky-500/10",
    },
    {
      key: "positions",
      icon: Wallet,
      href: "/prediction-portfolio.html",
      titleKey: "Home:quickJump.positions",
      hintKey: "Home:quickJump.positionsHint",
      accent: "from-fuchsia-500/15 to-fuchsia-500/0 border-fuchsia-500/30",
      iconAccent: "text-fuchsia-400 bg-fuchsia-500/10",
    },
    {
      key: "create",
      icon: PlusCircle,
      href: "/create_prediction.html",
      titleKey: "Home:quickJump.create",
      hintKey: "Home:quickJump.createHint",
      accent: "from-indigo-500/15 to-indigo-500/0 border-indigo-500/30",
      iconAccent: "text-indigo-400 bg-indigo-500/10",
    },
  ];

  return (
    <section
      id="jump-in"
      aria-label={t("Home:quickJump.heading")}
      className="mt-8 sm:mt-10"
    >
      <h2 className="text-sm sm:text-base font-semibold uppercase tracking-[0.18em] dark:text-white/60 text-muted-foreground mb-3 text-center">
        {t("Home:quickJump.heading")}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {JUMPS.map((j) => {
          const Icon = j.icon;
          return (
            <a
              key={j.key}
              href={j.href}
              className={`group relative overflow-hidden rounded-xl border bg-gradient-to-br ${j.accent} dark:bg-white/[0.03] bg-accent/30 dark:hover:bg-white/[0.07] hover:bg-accent/40 transition-all p-3 sm:p-4 flex items-start gap-3`}
            >
              <span
                className={`inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${j.iconAccent}`}
                aria-hidden
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-sm dark:text-white text-foreground truncate">
                    {t(j.titleKey)}
                  </span>
                  {j.badge != null ? (
                    <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-semibold tabular-nums bg-accent/50 dark:bg-white/15 dark:text-white text-foreground">
                      {j.badge.toLocaleString()}
                    </span>
                  ) : (
                    <ArrowUpRight className="h-3.5 w-3.5 dark:text-white/40 text-muted-foreground dark:group-hover:text-white group-hover:text-accent-foreground transition-colors flex-shrink-0" />
                  )}
                </span>
                <span className="block text-[11px] sm:text-xs dark:text-white/60 text-muted-foreground mt-0.5 line-clamp-2">
                  {t(j.hintKey)}
                </span>
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
