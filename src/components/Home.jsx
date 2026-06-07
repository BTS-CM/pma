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
import HowItWorks from "./home/HowItWorks";
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
  Wrench,
  Zap,
  ArrowLeftRight,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { useInitCache } from "@/nanoeffects/Init.ts";
import { $currentUser } from "@/stores/users.ts";
import { $currentNode } from "@/stores/node.ts";
import { $blockList, updateBlockList } from "@/stores/blocklist.ts";

import { createBlockedAccountStore } from "@/nanoeffects/BlockedAccounts.ts";

const ITEM_ICONS = {
  dex: LineChart,
  instant_trade: Zap,
  simple_asset_swap: ArrowLeftRight,
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
  dex: { bar: "from-indigo-500 to-cyan-500", chip: "bg-indigo-500/30 text-indigo-100 border-indigo-400/50", glow: "bg-indigo-500/30", text: "text-indigo-100" },
  instant_trade: { bar: "from-amber-500 to-orange-500", chip: "bg-amber-500/30 text-amber-100 border-amber-400/50", glow: "bg-amber-500/30", text: "text-amber-100" },
  simple_asset_swap: { bar: "from-blue-500 to-indigo-500", chip: "bg-blue-500/30 text-blue-100 border-blue-400/50", glow: "bg-blue-500/30", text: "text-blue-100" },
  prediction_markets_active: { bar: "from-cyan-500 to-sky-500", chip: "bg-cyan-500/30 text-cyan-100 border-cyan-400/50", glow: "bg-cyan-500/30", text: "text-cyan-100" },
  prediction_markets_expired: { bar: "from-sky-500 to-blue-500", chip: "bg-sky-500/30 text-sky-100 border-sky-400/50", glow: "bg-sky-500/30", text: "text-sky-100" },
  prediction_markets_mine: { bar: "from-emerald-500 to-teal-500", chip: "bg-emerald-500/30 text-emerald-100 border-emerald-400/50", glow: "bg-emerald-500/30", text: "text-emerald-100" },
  prediction_markets_portfolio: { bar: "from-fuchsia-500 to-pink-500", chip: "bg-fuchsia-500/30 text-fuchsia-100 border-fuchsia-400/50", glow: "bg-fuchsia-500/30", text: "text-fuchsia-100" },
  prediction_markets_margin: { bar: "from-amber-500 to-orange-500", chip: "bg-amber-500/30 text-amber-100 border-amber-400/50", glow: "bg-amber-500/30", text: "text-amber-100" },
  create_prediction: { bar: "from-violet-500 to-purple-500", chip: "bg-violet-500/30 text-violet-100 border-violet-400/50", glow: "bg-violet-500/30", text: "text-violet-100" },
  transfer: { bar: "from-sky-500 to-blue-500", chip: "bg-sky-500/30 text-sky-100 border-sky-400/50", glow: "bg-sky-500/30", text: "text-sky-100" },
  portfolio_balances: { bar: "from-emerald-500 to-teal-500", chip: "bg-emerald-500/30 text-emerald-100 border-emerald-400/50", glow: "bg-emerald-500/30", text: "text-emerald-100" },
  portfolio_open_orders: { bar: "from-cyan-500 to-sky-500", chip: "bg-cyan-500/30 text-cyan-100 border-cyan-400/50", glow: "bg-cyan-500/30", text: "text-cyan-100" },
  favourites: { bar: "from-amber-500 to-yellow-500", chip: "bg-amber-500/30 text-amber-100 border-amber-400/50", glow: "bg-amber-500/30", text: "text-amber-100" },
  about: { bar: "from-blue-500 to-indigo-500", chip: "bg-blue-500/30 text-blue-100 border-blue-400/50", glow: "bg-blue-500/30", text: "text-blue-100" },
  nodes: { bar: "from-teal-500 to-cyan-500", chip: "bg-teal-500/30 text-teal-100 border-teal-400/50", glow: "bg-teal-500/30", text: "text-teal-100" },
  blocked_users: { bar: "from-rose-500 to-red-500", chip: "bg-rose-500/30 text-rose-100 border-rose-400/50", glow: "bg-rose-500/30", text: "text-rose-100" },
  create_account: { bar: "from-emerald-500 to-green-500", chip: "bg-emerald-500/30 text-emerald-100 border-emerald-400/50", glow: "bg-emerald-500/30", text: "text-emerald-100" },
  configure_visuals: { bar: "from-violet-500 to-fuchsia-500", chip: "bg-violet-500/30 text-violet-100 border-violet-400/50", glow: "bg-violet-500/30", text: "text-violet-100" },
};

const SECTION_STYLES = {
  predictionMarkets: {
    icon: TrendingUp,
    titleKey: "Home:sections.predictionMarkets",
    subtitleKey: "Home:sections.predictionMarketsSubtitle",
    border: "border-indigo-400/20",
    bg: "from-indigo-500/15 via-slate-900/20 to-fuchsia-500/10",
    iconBg: "bg-indigo-500/15",
    iconBorder: "border-indigo-400/25",
    iconText: "text-indigo-200",
    blobA: "bg-indigo-500/30",
    blobB: "bg-fuchsia-500/20",
    underline: "from-indigo-500/0 via-indigo-400/60 to-fuchsia-500/0",
  },
  exchange: {
    icon: Repeat,
    titleKey: "Home:sections.exchange",
    subtitleKey: "Home:sections.exchangeSubtitle",
    border: "border-cyan-400/20",
    bg: "from-cyan-500/15 via-slate-900/20 to-blue-500/10",
    iconBg: "bg-cyan-500/15",
    iconBorder: "border-cyan-400/25",
    iconText: "text-cyan-200",
    blobA: "bg-cyan-500/30",
    blobB: "bg-blue-500/20",
    underline: "from-cyan-500/0 via-cyan-400/60 to-blue-500/0",
  },
  account: {
    icon: Wallet,
    titleKey: "Home:sections.account",
    subtitleKey: "Home:sections.accountSubtitle",
    border: "border-emerald-400/20",
    bg: "from-emerald-500/15 via-slate-900/20 to-sky-500/10",
    iconBg: "bg-emerald-500/15",
    iconBorder: "border-emerald-400/25",
    iconText: "text-emerald-200",
    blobA: "bg-emerald-500/30",
    blobB: "bg-sky-500/20",
    underline: "from-emerald-500/0 via-emerald-400/60 to-sky-500/0",
  },
  moreTools: {
    icon: Wrench,
    titleKey: "Home:sections.moreTools",
    subtitleKey: "Home:sections.moreToolsSubtitle",
    border: "border-violet-400/20",
    bg: "from-violet-500/15 via-slate-900/20 to-rose-500/10",
    iconBg: "bg-violet-500/15",
    iconBorder: "border-violet-400/25",
    iconText: "text-violet-200",
    blobA: "bg-violet-500/30",
    blobB: "bg-rose-500/20",
    underline: "from-violet-500/0 via-violet-400/60 to-rose-500/0",
  },
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
      key: "prediction_markets_active",
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
      key: "prediction_markets_mine",
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
    {
      key: "prediction_markets_expired",
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
      key: "prediction_markets_portfolio",
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
      key: "prediction_markets_margin",
      href: "/prediction-margin/index.html",
      titleKey: "Home:prediction_markets_margin.title",
      subtitleKey: "Home:prediction_markets_margin.subtitle",
      hoverKeys: [
        "Home:prediction_markets_margin.hover1",
        "Home:prediction_markets_margin.hover2",
        "Home:prediction_markets_margin.hover3",
      ],
    },
  ];

  const exchangeFunds = [
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
      key: "instant_trade",
      href: "/instant_trade/index.html",
      titleKey: "Home:instant_trade.title",
      subtitleKey: "Home:instant_trade.subtitle",
      hoverKeys: [
        "Home:instant_trade.hover1",
        "Home:instant_trade.hover2",
        "Home:instant_trade.hover3",
      ],
    },
    {
      key: "simple_asset_swap",
      href: "/swap/index.html",
      titleKey: "Home:simple_asset_swap.title",
      subtitleKey: "Home:simple_asset_swap.subtitle",
      hoverKeys: [
        "Home:simple_asset_swap.hover1",
        "Home:simple_asset_swap.hover2",
        "Home:simple_asset_swap.hover3",
      ],
    },
    {
      key: "transfer",
      href: "/transfer/index.html",
      titleKey: "Home:transfer.title",
      subtitleKey: "Home:transfer.subtitle",
      hoverKeys: ["Home:transfer.hover1"],
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
          <HoverCardContent
            sideOffset={10}
            align="center"
            style={{ backgroundColor: "#020617" }}
            className={cn(
              "w-80 overflow-hidden rounded-2xl border border-white/10 p-4 text-sm",
              "!bg-slate-950 text-white/75",
              "shadow-[0_24px_60px_-12px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.04)]"
            )}
          >
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r opacity-80",
                accent.bar
              )}
            />
            <ul className="ml-4 list-disc [&>li]:mt-2 marker:text-white/40">
              {card.hoverKeys.map((hoverKey, index) => (
                <li key={`${card.key}-hover-${index}`} className="leading-relaxed">
                  {t(hoverKey)}
                </li>
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

  const renderSection = (cards, sectionKey) => {
    const style = SECTION_STYLES[sectionKey] || SECTION_STYLES.moreTools;
    const SectionIcon = style.icon;
    return (
      <section className="mt-10 sm:mt-14">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border p-4 sm:p-5",
            "bg-gradient-to-br",
            style.border,
            style.bg
          )}
        >
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full blur-3xl",
              style.blobA
            )}
          />
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute -right-12 -bottom-12 h-40 w-40 rounded-full blur-3xl",
              style.blobB
            )}
          />
          <div className="relative flex items-center gap-3 sm:gap-4">
            <span
              className={cn(
                "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
                style.iconBg,
                style.iconBorder
              )}
            >
              <SectionIcon className={cn("h-5 w-5", style.iconText)} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight leading-tight">
                {t(style.titleKey)}
              </h2>
              <p className="mt-1 text-[13px] sm:text-sm text-white/60 leading-snug">
                {t(style.subtitleKey)}
              </p>
            </div>
            <div
              aria-hidden="true"
              className="hidden md:flex items-center gap-1 pr-1"
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", style.iconBg.replace("/15", "/80"))} />
              <span className={cn("h-1.5 w-1.5 rounded-full opacity-60", style.iconBg.replace("/15", "/60"))} />
              <span className={cn("h-1.5 w-1.5 rounded-full opacity-30", style.iconBg.replace("/15", "/40"))} />
            </div>
          </div>
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r",
              style.underline
            )}
          />
        </div>
        <div className="mt-3 sm:mt-4">
          {renderCardGrid(cards, "lg:grid-cols-3")}
        </div>
      </section>
    );
  };

  return (
    <div className="container mx-auto mt-3 mb-5 px-3 sm:px-4">
      <QuickJumps liveStats={liveStats} />

      <HowItWorks />

      <Separator className="my-10 sm:my-12 bg-white/10" />

      {renderSection(predictionMarkets, "predictionMarkets")}
      {renderSection(exchangeFunds, "exchange")}
      {renderSection(accountOverviews, "account")}
      {renderSection(moreTools, "moreTools")}
    </div>
  );
}
