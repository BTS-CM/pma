import React, { useEffect } from "react";
import { useStore } from "@nanostores/react";
import { useSyncExternalStore } from "react";

import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import { Separator } from "@/components/ui/separator";

import Hero from "./home/Hero";
import QuickJumps from "./home/QuickJumps";
import ForCreators from "./home/ForCreators";
import HowItWorks from "./home/HowItWorks";
import TrustStrip from "./home/TrustStrip";
import { useLiveStats } from "./home/useLiveStats";

import {
  Activity,
  Hourglass,
  BookOpen,
  Briefcase,
  TrendingUp,
  Sparkles,
  Send,
  Wallet,
  ClipboardList,
  Star,
  LineChart,
  Info,
  Server,
  UserX,
  UserPlus,
  Palette,
  ArrowUpRight,
  Repeat,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { useInitCache } from "@/nanoeffects/Init.ts";
import { $currentUser } from "@/stores/users.ts";
import { $currentNode } from "@/stores/node.ts";
import { $blockList, updateBlockList } from "@/stores/blocklist.ts";

import { createBlockedAccountStore } from "@/nanoeffects/BlockedAccounts.ts";

const ITEM_ICONS = {
  dex: LineChart,
  prediction_markets_active: Activity,
  prediction_markets_expired: Hourglass,
  prediction_markets_mine: BookOpen,
  prediction_markets_portfolio: Briefcase,
  prediction_markets_margin: TrendingUp,
  create_prediction: Sparkles,
  transfer: Send,
  portfolio_balances: Wallet,
  portfolio_open_orders: ClipboardList,
  favourites: Star,
  about: Info,
  nodes: Server,
  blocked_users: UserX,
  create_account: UserPlus,
  configure_visuals: Palette,
};

const ITEM_ACCENTS = {
  dex: { bar: "from-indigo-500/80 to-cyan-500/80", chip: "bg-indigo-500/15 text-indigo-300 border-indigo-400/20", glow: "bg-indigo-500/20", text: "text-indigo-300" },
  prediction_markets_active: { bar: "from-cyan-500/80 to-sky-500/80", chip: "bg-cyan-500/15 text-cyan-300 border-cyan-400/20", glow: "bg-cyan-500/20", text: "text-cyan-300" },
  prediction_markets_expired: { bar: "from-slate-500/80 to-zinc-500/80", chip: "bg-slate-500/15 text-slate-200 border-slate-400/20", glow: "bg-slate-500/20", text: "text-slate-200" },
  prediction_markets_mine: { bar: "from-emerald-500/80 to-teal-500/80", chip: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20", glow: "bg-emerald-500/20", text: "text-emerald-300" },
  prediction_markets_portfolio: { bar: "from-fuchsia-500/80 to-pink-500/80", chip: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/20", glow: "bg-fuchsia-500/20", text: "text-fuchsia-300" },
  prediction_markets_margin: { bar: "from-amber-500/80 to-orange-500/80", chip: "bg-amber-500/15 text-amber-300 border-amber-400/20", glow: "bg-amber-500/20", text: "text-amber-300" },
  create_prediction: { bar: "from-violet-500/80 to-purple-500/80", chip: "bg-violet-500/15 text-violet-300 border-violet-400/20", glow: "bg-violet-500/20", text: "text-violet-300" },
  transfer: { bar: "from-sky-500/80 to-blue-500/80", chip: "bg-sky-500/15 text-sky-300 border-sky-400/20", glow: "bg-sky-500/20", text: "text-sky-300" },
  portfolio_balances: { bar: "from-emerald-500/80 to-teal-500/80", chip: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20", glow: "bg-emerald-500/20", text: "text-emerald-300" },
  portfolio_open_orders: { bar: "from-cyan-500/80 to-sky-500/80", chip: "bg-cyan-500/15 text-cyan-300 border-cyan-400/20", glow: "bg-cyan-500/20", text: "text-cyan-300" },
  favourites: { bar: "from-amber-500/80 to-yellow-500/80", chip: "bg-amber-500/15 text-amber-300 border-amber-400/20", glow: "bg-amber-500/20", text: "text-amber-300" },
  about: { bar: "from-blue-500/80 to-indigo-500/80", chip: "bg-blue-500/15 text-blue-300 border-blue-400/20", glow: "bg-blue-500/20", text: "text-blue-300" },
  nodes: { bar: "from-slate-500/80 to-zinc-500/80", chip: "bg-slate-500/15 text-slate-200 border-slate-400/20", glow: "bg-slate-500/20", text: "text-slate-200" },
  blocked_users: { bar: "from-rose-500/80 to-red-500/80", chip: "bg-rose-500/15 text-rose-300 border-rose-400/20", glow: "bg-rose-500/20", text: "text-rose-300" },
  create_account: { bar: "from-emerald-500/80 to-green-500/80", chip: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20", glow: "bg-emerald-500/20", text: "text-emerald-300" },
  configure_visuals: { bar: "from-violet-500/80 to-fuchsia-500/80", chip: "bg-violet-500/15 text-violet-300 border-violet-400/20", glow: "bg-violet-500/20", text: "text-violet-300" },
};

const SECTION_STYLES = {
  predictionMarkets: { bar: "from-indigo-500 via-cyan-400 to-fuchsia-500", eyebrow: "text-indigo-300" },
  account: { bar: "from-emerald-500 via-cyan-400 to-sky-500", eyebrow: "text-emerald-300" },
  moreTools: { bar: "from-violet-500 via-fuchsia-500 to-rose-500", eyebrow: "text-violet-300" },
};

export default function Home(properties) {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });
  const usr = useSyncExternalStore(
    $currentUser.subscribe,
    $currentUser.get,
    () => true,
  );
  const blocklist = useSyncExternalStore(
    $blockList.subscribe,
    $blockList.get,
    () => true,
  );
  const currentNode = useStore($currentNode);

  const liveStats = useLiveStats(properties._assetsBTS, properties._assetsTEST);

  useInitCache(usr && usr.chain ? usr.chain : "bitshares", []);
  useEffect(() => {
    if (
      blocklist &&
      blocklist.timestamp &&
      usr &&
      usr.chain &&
      usr.chain === "bitshares" &&
      currentNode &&
      currentNode.url
    ) {
      const currentTime = Date.now();
      const isOlderThan24Hours =
        currentTime - blocklist.timestamp > 24 * 60 * 60 * 1000;
      if (isOlderThan24Hours || !blocklist.users.length) {
        const blockListStore = createBlockedAccountStore([
          usr.chain,
          currentNode.url,
        ]);
        const unsub = blockListStore.subscribe((result) => {
          if (result.error) {
            console.error(result.error);
          }
          if (!result.loading && result.data) {
            updateBlockList(result.data);
          }
        });
        return () => {
          unsub();
        };
      }
    }
  }, [usr, currentNode]);

  const predictionMarkets = [
    {
      key: "active_predictions",
      href: "/active-predictions/index.html",
      titleKey: "Home:prediction_markets_active.title",
      subtitleKey: "Home:prediction_markets_active.subtitle",
      hoverKeys: [
        "Home:prediction_markets_active.hover1",
        "Home:prediction_markets_active.hover2",
        "Home:prediction_markets_active.hover3",
      ],
    },
    {
      key: "expired_predictions",
      href: "/expired-predictions/index.html",
      titleKey: "Home:prediction_markets_expired.title",
      subtitleKey: "Home:prediction_markets_expired.subtitle",
      hoverKeys: [
        "Home:prediction_markets_expired.hover1",
        "Home:prediction_markets_expired.hover2",
        "Home:prediction_markets_expired.hover3",
      ],
    },
    {
      key: "my_predictions",
      href: "/my-predictions/index.html",
      titleKey: "Home:prediction_markets_mine.title",
      subtitleKey: "Home:prediction_markets_mine.subtitle",
      hoverKeys: [
        "Home:prediction_markets_mine.hover1",
        "Home:prediction_markets_mine.hover2",
        "Home:prediction_markets_mine.hover3",
      ],
    },
    {
      key: "prediction_portfolio",
      href: "/prediction-portfolio/index.html",
      titleKey: "Home:prediction_markets_portfolio.title",
      subtitleKey: "Home:prediction_markets_portfolio.subtitle",
      hoverKeys: [
        "Home:prediction_markets_portfolio.hover1",
        "Home:prediction_markets_portfolio.hover2",
        "Home:prediction_markets_portfolio.hover3",
      ],
    },
    {
      key: "prediction_margin",
      href: "/prediction-margin/index.html",
      titleKey: "Home:prediction_markets_margin.title",
      subtitleKey: "Home:prediction_markets_margin.subtitle",
      hoverKeys: [
        "Home:prediction_markets_margin.hover1",
        "Home:prediction_markets_margin.hover2",
        "Home:prediction_markets_margin.hover3",
      ],
    },
    {
      key: "create_prediction",
      href: "/create_prediction/index.html",
      titleKey: "Home:create_prediction.title",
      subtitleKey: "Home:create_prediction.subtitle",
      hoverKeys: [
        "Home:create_prediction.hover1",
        "Home:create_prediction.hover2",
        "Home:create_prediction.hover3",
      ],
    },
  ];

  const accountOverviews = [
    {
      key: "portfolio_balances",
      href: "/balances/index.html",
      titleKey: "Home:portfolio_balances.title",
      subtitleKey: "Home:portfolio_balances.subtitle",
      hoverKeys: [
        "Home:portfolio_balances.hover1",
        "Home:portfolio_balances.hover2",
        "Home:portfolio_balances.hover3",
      ],
    },
    {
      key: "portfolio_open_orders",
      href: "/open-orders/index.html",
      titleKey: "Home:portfolio_open_orders.title",
      subtitleKey: "Home:portfolio_open_orders.subtitle",
      hoverKeys: [
        "Home:portfolio_open_orders.hover1",
        "Home:portfolio_open_orders.hover2",
        "Home:portfolio_open_orders.hover3",
      ],
    },
    {
      key: "favourites",
      href: "/favourites/index.html",
      titleKey: "Home:favourites.title",
      subtitleKey: "Home:favourites.subtitle",
      hoverKeys: ["Home:favourites.hover1", "Home:favourites.hover2"],
    },
  ];

  const moreTools = [
    {
      key: "dex",
      href: "/dex/index.html",
      titleKey: "Home:dex.title",
      subtitleKey: "Home:dex.subtitle",
      hoverKeys: [
        "Home:dex.hover1",
        "Home:dex.hover2",
        "Home:dex.hover3",
        "Home:dex.hover4",
      ],
    },
    {
      key: "about",
      href: "/about/index.html",
      titleKey: "Home:about.title",
      subtitleKey: "Home:about.subtitle",
      hoverKeys: ["Home:about.hover1", "Home:about.hover2"],
    },
    {
      key: "nodes",
      href: "/nodes/index.html",
      titleKey: "Home:nodes.title",
      subtitleKey: "Home:nodes.subtitle",
      hoverKeys: ["Home:nodes.hover1", "Home:nodes.hover2"],
    },
    {
      key: "blocked_users",
      href: "/blocked-users/index.html",
      titleKey: "Home:blocked_users.title",
      subtitleKey: "Home:blocked_users.subtitle",
      hoverKeys: [
        "Home:blocked_users.hover1",
        "Home:blocked_users.hover2",
      ],
    },
    {
      key: "create_account",
      href: "/create_account/index.html",
      titleKey: "Home:create_account.title",
      subtitleKey: "Home:create_account.subtitle",
      hoverKeys: [
        "Home:create_account.hover1",
        "Home:create_account.hover2",
      ],
    },
    {
      key: "configure_visuals",
      href: "/visuals/index.html",
      titleKey: "Home:configure_visuals.title",
      subtitleKey: "Home:configure_visuals.subtitle",
    },
  ];

  const renderHoverCard = (card) => {
    const Icon = ITEM_ICONS[card.key] || Sparkles;
    const accent = ITEM_ACCENTS[card.key] || {
      bar: "from-white/40 to-white/20",
      chip: "bg-white/10 text-white/80 border-white/15",
      glow: "bg-white/10",
      text: "text-white/80",
    };
    return (
      <HoverCard key={card.key} openDelay={120} closeDelay={80}>
        <HoverCardTrigger asChild>
          <a
            href={card.href}
            className={cn(
              "group relative overflow-hidden block rounded-2xl",
              "border border-white/10 bg-white/[0.025]",
              "p-4 sm:p-5",
              "transition-all duration-200 ease-out",
              "hover:border-white/20 hover:bg-white/[0.05]",
              "hover:-translate-y-0.5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r opacity-60 group-hover:opacity-100 transition-opacity",
                accent.bar
              )}
            />
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-300",
                accent.glow
              )}
            />
            <div className="relative flex items-start gap-3">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                  accent.chip
                )}
              >
                <Icon className={cn("h-5 w-5", accent.text)} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-white leading-snug">
                  {t(card.titleKey)}
                </h3>
                <p className="mt-1 text-[12.5px] leading-snug text-white/60 line-clamp-2">
                  {t(card.subtitleKey)}
                </p>
              </div>
              <ArrowUpRight
                className={cn(
                  "h-4 w-4 shrink-0 text-white/30 -translate-x-0.5 translate-y-0.5",
                  "group-hover:text-white/80 group-hover:translate-x-0 group-hover:translate-y-0",
                  "transition-all duration-200 ease-out"
                )}
                aria-hidden="true"
              />
            </div>
          </a>
        </HoverCardTrigger>
        {card.hoverKeys && card.hoverKeys.length ? (
          <HoverCardContent className="w-80 text-sm pt-1">
            <ul className="ml-2 list-disc [&>li]:mt-2">
              {card.hoverKeys.map((hoverKey, index) => (
                <li key={`${card.key}-hover-${index}`}>{t(hoverKey)}</li>
              ))}
            </ul>
          </HoverCardContent>
        ) : null}
      </HoverCard>
    );
  };

  const renderCardGrid = (cards, gridColsClass = "lg:grid-cols-3") => (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridColsClass} gap-3 sm:gap-4`}>
      {cards.map((card) => renderHoverCard(card))}
    </div>
  );

  const renderSection = (titleKey, cards, sectionKey) => {
    const style = SECTION_STYLES[sectionKey] || SECTION_STYLES.moreTools;
    return (
      <section className="mt-8 sm:mt-10">
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          <span
            aria-hidden="true"
            className={cn("inline-block h-5 w-1 rounded-full bg-gradient-to-b", style.bar)}
          />
          <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
            {t(titleKey)}
          </h2>
          <span
            className={cn(
              "inline-flex h-5 items-center rounded-full px-2 text-[10px] font-semibold uppercase tracking-wider border",
              "border-white/10 bg-white/[0.04] text-white/55"
            )}
          >
            {cards.length}
          </span>
        </div>
        {renderCardGrid(cards, "lg:grid-cols-3")}
      </section>
    );
  };

  return (
    <div className="container mx-auto mt-3 mb-5 px-3 sm:px-4">
      <QuickJumps liveStats={liveStats} />

      <ForCreators />

      <HowItWorks />

      <TrustStrip />

      <Separator className="my-10 sm:my-12 bg-white/10" />

      {renderSection("Home:sections.predictionMarkets", predictionMarkets, "predictionMarkets")}
      {renderSection("Home:sections.account", accountOverviews, "account")}
      {renderSection("Home:sections.moreTools", moreTools, "moreTools")}
    </div>
  );
}
