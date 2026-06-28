import React from "react";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useSidebar } from "@/components/ui/sidebar";

import {
  LineChart,
  Activity,
  Hourglass,
  BookOpen,
  Briefcase,
  TrendingUp,
  Sparkles,
  Wallet,
  ClipboardList,
  Star,
  Info,
  Server,
  UserX,
  UserPlus,
  ArrowLeftRight,
  Zap,
  Send,
  Settings,
  Repeat,
  SlidersHorizontal,
  Palette,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SECTION_ICONS = {
  predictions: TrendingUp,
  exchange: Repeat,
  account: Wallet,
  settings: SlidersHorizontal,
};

const SECTION_ACCENTS = {
  predictions: { fg: "dark:text-indigo-400 text-indigo-600", bg: "dark:bg-indigo-500/15 bg-indigo-100" },
  exchange: { fg: "dark:text-cyan-400 text-cyan-600", bg: "dark:bg-cyan-500/15 bg-cyan-100" },
  account: { fg: "dark:text-emerald-400 text-emerald-600", bg: "dark:bg-emerald-500/15 bg-emerald-100" },
  settings: { fg: "dark:text-violet-400 text-violet-600", bg: "dark:bg-violet-500/15 bg-violet-100" },
};

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
  create_pma_org: Sparkles,
  prediction_organizations: ShieldCheck,
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

const ITEM_ACCENT_COLORS = {
  dex: "dark:text-indigo-400 text-indigo-600",
  instant_trade: "dark:text-amber-400 text-amber-600",
  simple_asset_swap: "dark:text-blue-400 text-blue-600",
  prediction_markets_active: "dark:text-cyan-400 text-cyan-600",
  prediction_markets_expired: "dark:text-sky-400 text-sky-600",
  prediction_markets_mine: "dark:text-emerald-400 text-emerald-600",
  prediction_markets_portfolio: "dark:text-fuchsia-400 text-fuchsia-600",
  prediction_markets_margin: "dark:text-amber-400 text-amber-600",
  create_prediction: "dark:text-violet-400 text-violet-600",
  create_pma_org: "dark:text-fuchsia-400 text-fuchsia-600",
  prediction_organizations: "dark:text-cyan-400 text-cyan-600",
  transfer: "dark:text-sky-400 text-sky-600",
  portfolio_balances: "dark:text-emerald-400 text-emerald-600",
  portfolio_open_orders: "dark:text-cyan-400 text-cyan-600",
  favourites: "dark:text-amber-400 text-amber-600",
  about: "dark:text-blue-400 text-blue-600",
  nodes: "dark:text-teal-400 text-teal-600",
  blocked_users: "dark:text-rose-400 text-rose-600",
  create_account: "dark:text-emerald-400 text-emerald-600",
  configure_visuals: "dark:text-violet-400 text-violet-600",
};

export default function AppSidebar() {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });

  const predictionsItems = [
    { title: "Home:prediction_markets_active.title", href: "/active-predictions.html", key: "prediction_markets_active" },
    { title: "Home:prediction_markets_expired.title", href: "/expired-predictions.html", key: "prediction_markets_expired" },
    { title: "Home:prediction_markets_mine.title", href: "/my-predictions.html", key: "prediction_markets_mine" },
    { title: "Home:prediction_markets_portfolio.title", href: "/prediction-portfolio.html", key: "prediction_markets_portfolio" },
    { title: "Home:prediction_markets_margin.title", href: "/prediction-margin.html", key: "prediction_markets_margin" },
    { title: "PageHeader:createPrediction", href: "/create_prediction.html", key: "create_prediction" },
    { title: "PageHeader:createPMAOrg", href: "/create_pma_org.html", key: "create_pma_org" },
    { title: "PageHeader:predictionOrganizations", href: "/prediction-organizations.html", key: "prediction_organizations" },
  ];

  const exchangeItems = [
    { title: "Home:dex.title", href: "/dex.html", key: "dex" },
    { title: "Home:instant_trade.title", href: "/instant_trade.html", key: "instant_trade" },
    { title: "Home:simple_asset_swap.title", href: "/swap.html", key: "simple_asset_swap" },
    { title: "Home:transfer.title", href: "/transfer.html", key: "transfer" },
  ];

  const accountItems = [
    { title: "Home:portfolio_balances.title", href: "/balances.html", key: "portfolio_balances" },
    { title: "Home:portfolio_open_orders.title", href: "/open-orders.html", key: "portfolio_open_orders" },
    { title: "Home:favourites.title", href: "/favourites.html", key: "favourites" },
  ];

  const settingsItems = [
    { title: "Home:about.title", href: "/docs/", key: "about" },
    { title: "Home:nodes.title", href: "/nodes.html", key: "nodes" },
    { title: "Home:blocked_users.title", href: "/blocked-users.html", key: "blocked_users" },
    { title: "Home:create_account.title", href: "/create_account.html", key: "create_account" },
    { title: "Home:configure_visuals.title", href: "/visuals.html", key: "configure_visuals" },
  ];

  const sections = [
    {
      key: "predictions",
      label: t("PageHeader:exchangingFundsHeading"),
      items: predictionsItems,
    },
    {
      key: "exchange",
      label: t("PageHeader:exchangeFundsHeading"),
      items: exchangeItems,
    },
    {
      key: "account",
      label: t("PageHeader:accountOverviewsHeading"),
      items: accountItems,
    },
    {
      key: "settings",
      label: t("PageHeader:settingsHeading"),
      items: settingsItems,
    },
  ];

  const { openMobile, isMobile, setOpenMobile, setOpen } = useSidebar();
  const [accValue, setAccValue] = React.useState(sections[0].key);

  React.useEffect(() => {
    if (isMobile && openMobile) {
      setAccValue(sections[0].key);
    }
  }, [isMobile, openMobile]);

  return (
    <Sidebar className="dark:!bg-slate-950/80 !bg-card dark:!border-r-white/[0.06] !border-r-border">
      <SidebarContent className="dark:!bg-slate-950/80 !bg-card">
        <Accordion
          type="single"
          collapsible
          value={accValue}
          onValueChange={setAccValue}
          className="w-full"
        >
          {sections.map((section) => {
            const SectionIcon = SECTION_ICONS[section.key] || Settings;
            return (
              <AccordionItem
                key={section.key}
                value={section.key}
                className="dark:border-b-white/[0.06] border-b-sidebar-border"
              >
                <AccordionTrigger className="py-2 text-sm hover:no-underline">
                  <SidebarGroupLabel className="px-2 py-0.5 text-[13px]">
                    <span className={cn("mr-2 inline-flex items-center justify-center w-5 h-5 rounded", SECTION_ACCENTS[section.key]?.bg)}>
                      <SectionIcon className={cn("h-3 w-3", SECTION_ACCENTS[section.key]?.fg)} />
                    </span>
                    <span className="dark:text-white/70 text-sidebar-foreground/70">{section.label}</span>
                  </SidebarGroupLabel>
                </AccordionTrigger>
                <AccordionContent>
                  <SidebarGroup>
                    <SidebarGroupContent className="ml-3 pl-3 border-l dark:border-white/[0.08] border-sidebar-border">
                      <SidebarMenu>
                        {section.items.map((it) => {
                          const ItemIcon = ITEM_ICONS[it.key] || Info;
                          const itemColor = ITEM_ACCENT_COLORS[it.key] || "dark:text-white/50 text-sidebar-foreground/50";
                          return (
                            <SidebarMenuItem key={it.href}>
                              <SidebarMenuButton
                                asChild
                                className="dark:!text-white/60 dark:hover:!text-white dark:hover:!bg-white/[0.06] !text-sidebar-foreground/60 hover:!text-sidebar-foreground hover:!bg-sidebar-accent !bg-transparent focus-visible:ring-0"
                              >
                                <a href={it.href} className="flex items-center gap-2" onClick={() => { if (isMobile) setOpenMobile(false); else setOpen(false); }}>
                                  <ItemIcon className={cn("h-3.5 w-3.5", itemColor)} />
                                  <span>{t(it.title)}</span>
                                </a>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </SidebarContent>
    </Sidebar>
  );
}
