import React, { useState, useEffect, useSyncExternalStore } from "react";

import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  HoverCardPortal,
} from "@/components/ui/hover-card";

import { ChevronDown, Sparkles, Send, LineChart, Activity, Hourglass, BookOpen, Briefcase, TrendingUp, Wallet, ClipboardList, Star, Info, Server, UserX, UserPlus, Palette, SlidersHorizontal, ArrowUpRight, Repeat } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import CurrentUser from "./common/CurrentUser.jsx";
import WaveBackground from "./WaveBackground.jsx";

import { $currentUser } from "@/stores/users.ts";

const ICONS = {
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

const ACCENTS = {
  dex: { color: "text-indigo-300", bg: "bg-indigo-500/15", border: "group-hover/navitem:border-indigo-400/30" },
  prediction_markets_active: { color: "text-cyan-300", bg: "bg-cyan-500/15", border: "group-hover/navitem:border-cyan-400/30" },
  prediction_markets_expired: { color: "text-slate-300", bg: "bg-slate-500/15", border: "group-hover/navitem:border-slate-400/30" },
  prediction_markets_mine: { color: "text-emerald-300", bg: "bg-emerald-500/15", border: "group-hover/navitem:border-emerald-400/30" },
  prediction_markets_portfolio: { color: "text-fuchsia-300", bg: "bg-fuchsia-500/15", border: "group-hover/navitem:border-fuchsia-400/30" },
  prediction_markets_margin: { color: "text-amber-300", bg: "bg-amber-500/15", border: "group-hover/navitem:border-amber-400/30" },
  create_prediction: { color: "text-violet-300", bg: "bg-violet-500/15", border: "group-hover/navitem:border-violet-400/30" },
  transfer: { color: "text-sky-300", bg: "bg-sky-500/15", border: "group-hover/navitem:border-sky-400/30" },
  portfolio_balances: { color: "text-emerald-300", bg: "bg-emerald-500/15", border: "group-hover/navitem:border-emerald-400/30" },
  portfolio_open_orders: { color: "text-cyan-300", bg: "bg-cyan-500/15", border: "group-hover/navitem:border-cyan-400/30" },
  favourites: { color: "text-amber-300", bg: "bg-amber-500/15", border: "group-hover/navitem:border-amber-400/30" },
  about: { color: "text-blue-300", bg: "bg-blue-500/15", border: "group-hover/navitem:border-blue-400/30" },
  nodes: { color: "text-slate-300", bg: "bg-slate-500/15", border: "group-hover/navitem:border-slate-400/30" },
  blocked_users: { color: "text-rose-300", bg: "bg-rose-500/15", border: "group-hover/navitem:border-rose-400/30" },
  create_account: { color: "text-emerald-300", bg: "bg-emerald-500/15", border: "group-hover/navitem:border-emerald-400/30" },
  configure_visuals: { color: "text-violet-300", bg: "bg-violet-500/15", border: "group-hover/navitem:border-violet-400/30" },
};

const SECTION_ACCENT = {
  exchange: { bar: "from-cyan-500 via-sky-400 to-blue-500", chip: "bg-cyan-500/20 text-cyan-200 border-cyan-400/30", ring: "shadow-[0_0_0_1px_rgba(34,211,238,0.45),0_0_18px_-2px_rgba(14,165,233,0.6)]", dot: "bg-cyan-400" },
  predictions: { bar: "from-indigo-500 via-cyan-400 to-fuchsia-500", chip: "bg-indigo-500/20 text-indigo-200 border-indigo-400/30", ring: "shadow-[0_0_0_1px_rgba(129,140,248,0.45),0_0_18px_-2px_rgba(99,102,241,0.6)]", dot: "bg-indigo-400" },
  account: { bar: "from-emerald-500 via-cyan-400 to-sky-500", chip: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30", ring: "shadow-[0_0_0_1px_rgba(52,211,153,0.45),0_0_18px_-2px_rgba(16,185,129,0.6)]", dot: "bg-emerald-400" },
  settings: { bar: "from-violet-500 via-fuchsia-500 to-rose-500", chip: "bg-violet-500/20 text-violet-200 border-violet-400/30", ring: "shadow-[0_0_0_1px_rgba(167,139,250,0.45),0_0_18px_-2px_rgba(139,92,246,0.6)]", dot: "bg-violet-400" },
};

function NavPanel({ section, accent, t }) {
  const SectionIcon = section.icon;

  return (
    <div
      className="relative w-full"
      style={{ backgroundColor: "#020617" }}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r",
          accent.bar
        )}
      />
      <div className="px-4 pt-4 pb-3 flex items-center gap-2 border-b border-white/5">
        <span
          className={cn(
            "inline-flex h-6 w-6 items-center justify-center rounded-md border",
            accent.chip
          )}
        >
          <SectionIcon className="h-3.5 w-3.5" />
        </span>
        <h3 className="text-sm font-semibold text-white tracking-tight truncate">
          {t(section.label)}
        </h3>
      </div>
      <ul className="p-2 grid grid-cols-1 gap-1 min-w-[320px] max-w-[420px]">
        {section.items.map((item) => {
          const Icon = ICONS[item.slug] || Sparkles;
          const itemAccent = ACCENTS[item.slug] || { color: "text-white/80", bg: "bg-white/10", border: "" };
          const cleanHref = item.href.replace(/\/index\.html$/, "/");
          const isCurrent = typeof window !== "undefined" && window.location.pathname.startsWith(cleanHref);
          return (
            <li key={item.slug} className="group/navitem">
              <a
                href={item.href}
                className={cn(
                  "relative flex items-start gap-3 rounded-xl border border-transparent p-2.5",
                  "bg-white/[0.02] hover:bg-white/[0.06]",
                  "transition-all duration-150 ease-out",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                  itemAccent.border,
                  isCurrent && "bg-white/[0.08] border-white/15"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10",
                    itemAccent.bg
                  )}
                >
                  <Icon className={cn("h-4 w-4", itemAccent.color)} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-white truncate">
                      {t(item.title)}
                    </span>
                    {isCurrent && (
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/80" />
                    )}
                  </span>
                  <span className="block mt-0.5 text-[12px] leading-snug text-white/55 line-clamp-2">
                    {t(item.description)}
                  </span>
                </span>
                <ArrowUpRight
                  className={cn(
                    "h-4 w-4 shrink-0 text-white/0 -translate-x-1 translate-y-1",
                    "group-hover/navitem:text-white/70 group-hover/navitem:translate-x-0 group-hover/navitem:translate-y-0",
                    "transition-all duration-200 ease-out"
                  )}
                  aria-hidden="true"
                />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function HoverPopover({ section, accent, t, children }) {
  return (
    <HoverCard openDelay={60} closeDelay={180}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardPortal>
        <HoverCardContent
          sideOffset={10}
          align="center"
          style={{ backgroundColor: "#020617" }}
          className={cn(
            "w-auto p-0 overflow-hidden rounded-2xl",
            "border border-white/10",
            "!bg-slate-950",
            "shadow-[0_24px_60px_-12px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.04)]"
          )}
        >
          <NavPanel section={section} accent={accent} t={t} />
        </HoverCardContent>
      </HoverCardPortal>
    </HoverCard>
  );
}

function LanguageRow(properties) {
  const { language, text, i18n } = properties;

  const [hover, setHover] = useState(false);
  const [isCurrentLanguage, setIsCurrentLanguage] = useState(false);

  useEffect(() => {
    setIsCurrentLanguage(language === locale.get());
  }, [language]);

  return (
    <CommandItem
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
      onSelect={() => {
        i18n.changeLanguage(language);
        locale.set(language);
        window.location.reload();
      }}
      style={{
        backgroundColor: hover || isCurrentLanguage ? "#F1F1F1" : "",
      }}
    >
      <span className="grid grid-cols-8 w-full">
        <span className="col-span-6">{text}</span>
        <span className="col-span-1 text-right">
          {isCurrentLanguage ? "✓" : ""}
        </span>
      </span>
    </CommandItem>
  );
}

export default function PageHeader(properties) {
  const { page, backURL } = properties;
  const { t, i18n } = useTranslation(locale.get(), { i18n: i18nInstance });

  const usr = useSyncExternalStore(
    $currentUser.subscribe,
    $currentUser.get,
    () => true,
  );

  const NAV_SECTIONS = [
    {
      id: "predictions",
      label: "PageHeader:exchangingFundsHeading",
      icon: TrendingUp,
      items: [
        { slug: "prediction_markets_active", title: "Home:prediction_markets_active.title", description: "Home:prediction_markets_active.subtitle", href: "/active-predictions/index.html" },
        { slug: "prediction_markets_expired", title: "Home:prediction_markets_expired.title", description: "Home:prediction_markets_expired.subtitle", href: "/expired-predictions/index.html" },
        { slug: "prediction_markets_mine", title: "Home:prediction_markets_mine.title", description: "Home:prediction_markets_mine.subtitle", href: "/my-predictions/index.html" },
        { slug: "prediction_markets_portfolio", title: "Home:prediction_markets_portfolio.title", description: "Home:prediction_markets_portfolio.subtitle", href: "/prediction-portfolio/index.html" },
        { slug: "prediction_markets_margin", title: "Home:prediction_markets_margin.title", description: "Home:prediction_markets_margin.subtitle", href: "/prediction-margin/index.html" },
        { slug: "create_prediction", title: "Home:create_prediction.title", description: "Home:create_prediction.subtitle", href: "/create_prediction/index.html" },
      ],
    },
    {
      id: "exchange",
      label: "PageHeader:exchangeFundsHeading",
      icon: Repeat,
      items: [
        { slug: "dex", title: "Home:dex.title", description: "Home:dex.subtitle", href: "/dex/index.html" },
        { slug: "transfer", title: "Home:transfer.title", description: "Home:transfer.subtitle", href: "/transfer/index.html" },
      ],
    },
    {
      id: "account",
      label: "PageHeader:accountOverviewsHeading",
      icon: Wallet,
      items: [
        { slug: "portfolio_balances", title: "Home:portfolio_balances.title", description: "Home:portfolio_balances.subtitle", href: "/balances/index.html" },
        { slug: "portfolio_open_orders", title: "Home:portfolio_open_orders.title", description: "Home:portfolio_open_orders.subtitle", href: "/open-orders/index.html" },
        { slug: "favourites", title: "Home:favourites.title", description: "Home:favourites.subtitle", href: "/favourites/index.html" },
      ],
    },
    {
      id: "settings",
      label: "PageHeader:settingsHeading",
      icon: SlidersHorizontal,
      items: [
        { slug: "about", title: "Home:about.title", description: "Home:about.subtitle", href: "/about/index.html" },
        { slug: "nodes", title: "Home:nodes.title", description: "Home:nodes.subtitle", href: "/nodes/index.html" },
        { slug: "blocked_users", title: "Home:blocked_users.title", description: "Home:blocked_users.subtitle", href: "/blocked-users/index.html" },
        { slug: "create_account", title: "Home:create_account.title", description: "Home:create_account.subtitle", href: "/create_account/index.html" },
        { slug: "configure_visuals", title: "Home:configure_visuals.title", description: "Home:configure_visuals.subtitle", href: "/visuals/index.html" },
      ],
    },
  ];

  const [currentPath, setCurrentPath] = useState(
    typeof window !== "undefined" ? window.location.pathname : "",
  );

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const update = () => setCurrentPath(window.location.pathname);
    update();
    document.addEventListener("astro:after-swap", update);
    window.addEventListener("popstate", update);
    return () => {
      document.removeEventListener("astro:after-swap", update);
      window.removeEventListener("popstate", update);
    };
  }, []);

  const isActiveSection = (section) =>
    section.items.some((item) => currentPath.startsWith(item.href.replace(/\/index\.html$/, "/")));

  return (
    <div key={`header`}>
      <div className="mb-3 relative min-h-[195px]">
        <div
          className="absolute inset-0 overflow-hidden rounded-lg"
          style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }}
        >
          <WaveBackground />
        </div>
        <div className="container mx-auto px-3 sm:px-4 relative z-10">
          <div className="grid grid-cols-12 gap-3 items-center min-h-[195px]">
            <div className="col-span-12 md:col-span-3 mt-2 flex items-center gap-2 relative z-10">
              <div className="inline-flex items-center rounded-md border border-white/10 bg-white/10 backdrop-blur-md p-1 hover:bg-white/20 transition-colors">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    <svg
                      viewBox="0 0 512 512"
                      fill="currentColor"
                      height="1em"
                      width="1em"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={32}
                        d="M48 112h288M192 64v48M272 448l96-224 96 224M301.5 384h133M281.3 112S257 206 199 277 80 384 80 384"
                      />
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={32}
                        d="M256 336s-35-27-72-75-56-85-56-85"
                      />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="mt-10 p-0" side="end">
                  <Command className="rounded-lg border shadow-md">
                    <CommandInput
                      placeholder={t("PageHeader:commandSearchPlaceholder")}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {t("PageHeader:noResultsFound")}
                      </CommandEmpty>
                      <CommandGroup
                        heading={t("PageHeader:exchangingFundsHeading")}
                      >
                        <LanguageRow
                          language="en"
                          i18n={i18n}
                          text={t("PageHeader:english")}
                        />
                        <LanguageRow
                          language="da"
                          i18n={i18n}
                          text={t("PageHeader:danish")}
                        />
                        <LanguageRow
                          language="de"
                          i18n={i18n}
                          text={t("PageHeader:german")}
                        />
                        <LanguageRow
                          language="es"
                          i18n={i18n}
                          text={t("PageHeader:spanish")}
                        />
                        <LanguageRow
                          language="fr"
                          i18n={i18n}
                          text={t("PageHeader:french")}
                        />
                        <LanguageRow
                          language="it"
                          i18n={i18n}
                          text={t("PageHeader:italian")}
                        />
                        <LanguageRow
                          language="ja"
                          i18n={i18n}
                          text={t("PageHeader:japanese")}
                        />
                        <LanguageRow
                          language="ko"
                          i18n={i18n}
                          text={t("PageHeader:korean")}
                        />
                        <LanguageRow
                          language="pt"
                          i18n={i18n}
                          text={t("PageHeader:portuguese")}
                        />
                        <LanguageRow
                          language="th"
                          i18n={i18n}
                          text={t("PageHeader:thai")}
                        />
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                size="icon"
                className="lg:hidden inline-flex align-middle h-7 w-7"
                onClick={() =>
                  window.__toggleSidebar && window.__toggleSidebar()
                }
                aria-label="Toggle Sidebar"
                title="Toggle Sidebar"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4"
                >
                  <path d="M3 4h18M3 12h18M3 20h18" />
                </svg>
              </Button>
              </div>
            </div>

            <div className="col-span-12 md:col-span-6 text-center relative z-10">
              <div className="relative">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white [text-shadow:_0_1px_2px_rgba(0,0,0,0.9),_0_2px_12px_rgba(0,0,0,0.7),_0_0_24px_rgba(0,0,0,0.5)]">
                  <a
                    href="/index.html"
                    onClick={() => {
                      if (window.location.pathname === "/blocks/index.html") {
                        window.electron.stopBlocks({});
                      }
                    }}
                  >
                    {page && page === "index"
                      ? t("PageHeader:welcomeMessage")
                      : ""}
                    <span>
                      {t("PageHeader:uiName")}
                    </span>
                  </a>
                </h2>
                <span
                  aria-hidden="true"
                  className="mx-auto mt-2 block h-[3px] w-2/5 max-w-[220px] rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(99,102,241,0) 0%, rgba(99,102,241,0.95) 25%, rgba(34,211,238,0.95) 50%, rgba(236,72,153,0.95) 75%, rgba(236,72,153,0) 100%)",
                    boxShadow:
                      "0 0 10px rgba(99,102,241,0.7), 0 0 20px rgba(34,211,238,0.5), 0 0 30px rgba(236,72,153,0.35)",
                  }}
                />
                <h4 className="mt-1 text-sm sm:text-base font-medium text-white [text-shadow:_0_1px_2px_rgba(0,0,0,0.9),_0_2px_12px_rgba(0,0,0,0.7),_0_0_24px_rgba(0,0,0,0.5)]">
                  {t(`PageHeader:descText.${page}`)}
                </h4>
              </div>
            </div>

            <div className="col-span-12 md:col-span-3 text-center md:text-right mt-2 relative z-10">
              {usr && usr.username && usr.username.length ? (
                <CurrentUser usr={usr} />
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto mb-4 px-3 sm:px-4 hidden lg:flex justify-center">
        <div
          className="inline-flex w-auto max-w-full items-center gap-1 rounded-2xl border border-white/10 bg-slate-950/55 backdrop-blur-xl p-1.5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.04)]"
        >
          {NAV_SECTIONS.map((section) => {
            const SectionIcon = section.icon;
            const accent = SECTION_ACCENT[section.id];
            const active = isActiveSection(section);
            return (
              <HoverPopover key={section.id} section={section} accent={accent} t={t}>
                <button
                  type="button"
                  className={cn(
                    "group/navtrigger relative inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium",
                    "text-white/80 hover:text-white",
                    "border border-transparent hover:border-white/10",
                    "bg-white/0 hover:bg-white/[0.06]",
                    "transition-all duration-200 ease-out",
                    "data-[state=open]:text-white data-[state=open]:bg-white/[0.08] data-[state=open]:border-white/15",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                    active && "text-white border-white/10 bg-white/[0.07]"
                  )}
                >
                  <SectionIcon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      active ? "text-white" : "text-white/70 group-hover/navtrigger:text-white"
                    )}
                  />
                  <span className="whitespace-nowrap">{t(section.label)}</span>
                  <ChevronDown
                    className="h-3.5 w-3.5 shrink-0 text-white/60 transition-transform duration-300 group-data-[state=open]:rotate-180 group-data-[state=open]:text-white"
                    aria-hidden="true"
                  />
                  {active && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "pointer-events-none absolute left-1/2 -bottom-[6px] -translate-x-1/2 h-1.5 w-1.5 rounded-full",
                        "shadow-[0_0_10px_2px_currentColor]",
                        accent.dot
                      )}
                    />
                  )}
                </button>
              </HoverPopover>
            );
          })}
        </div>
      </div>
    </div>
  );
}
