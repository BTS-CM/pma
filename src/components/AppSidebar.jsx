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
  predictions: "text-indigo-400",
  exchange: "text-cyan-400",
  account: "text-emerald-400",
  settings: "text-violet-400",
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
  dex: "text-indigo-400",
  instant_trade: "text-amber-400",
  simple_asset_swap: "text-blue-400",
  prediction_markets_active: "text-cyan-400",
  prediction_markets_expired: "text-sky-400",
  prediction_markets_mine: "text-emerald-400",
  prediction_markets_portfolio: "text-fuchsia-400",
  prediction_markets_margin: "text-amber-400",
  create_prediction: "text-violet-400",
  create_pma_org: "text-fuchsia-400",
  prediction_organizations: "text-cyan-400",
  transfer: "text-sky-400",
  portfolio_balances: "text-emerald-400",
  portfolio_open_orders: "text-cyan-400",
  favourites: "text-amber-400",
  about: "text-blue-400",
  nodes: "text-teal-400",
  blocked_users: "text-rose-400",
  create_account: "text-emerald-400",
  configure_visuals: "text-violet-400",
};

export default function AppSidebar() {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });

  const predictionsItems = [
    { title: "Home:prediction_markets_active.title", href: "/active-predictions/index.html", key: "prediction_markets_active" },
    { title: "Home:prediction_markets_expired.title", href: "/expired-predictions/index.html", key: "prediction_markets_expired" },
    { title: "Home:prediction_markets_mine.title", href: "/my-predictions/index.html", key: "prediction_markets_mine" },
    { title: "Home:prediction_markets_portfolio.title", href: "/prediction-portfolio/index.html", key: "prediction_markets_portfolio" },
    { title: "Home:prediction_markets_margin.title", href: "/prediction-margin/index.html", key: "prediction_markets_margin" },
    { title: "PageHeader:createPrediction", href: "/create_prediction/index.html", key: "create_prediction" },
    { title: "PageHeader:createPMAOrg", href: "/create_pma_org/index.html", key: "create_pma_org" },
    { title: "PageHeader:predictionOrganizations", href: "/prediction-organizations/index.html", key: "prediction_organizations" },
  ];

  const exchangeItems = [
    { title: "Home:dex.title", href: "/dex/index.html", key: "dex" },
    { title: "Home:instant_trade.title", href: "/instant_trade/index.html", key: "instant_trade" },
    { title: "Home:simple_asset_swap.title", href: "/swap/index.html", key: "simple_asset_swap" },
    { title: "Home:transfer.title", href: "/transfer/index.html", key: "transfer" },
  ];

  const accountItems = [
    { title: "Home:portfolio_balances.title", href: "/balances/index.html", key: "portfolio_balances" },
    { title: "Home:portfolio_open_orders.title", href: "/open-orders/index.html", key: "portfolio_open_orders" },
    { title: "Home:favourites.title", href: "/favourites/index.html", key: "favourites" },
  ];

  const settingsItems = [
    { title: "Home:about.title", href: "/about/index.html", key: "about" },
    { title: "Home:nodes.title", href: "/nodes/index.html", key: "nodes" },
    { title: "Home:blocked_users.title", href: "/blocked-users/index.html", key: "blocked_users" },
    { title: "Home:create_account.title", href: "/create_account/index.html", key: "create_account" },
    { title: "Home:configure_visuals.title", href: "/visuals/index.html", key: "configure_visuals" },
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

  const { openMobile, isMobile } = useSidebar();
  const [accValue, setAccValue] = React.useState(sections[0].key);

  React.useEffect(() => {
    if (isMobile && openMobile) {
      setAccValue(sections[0].key);
    }
  }, [isMobile, openMobile]);

  return (
    <Sidebar className="!bg-slate-950/80 !border-r-white/[0.06]">
      <SidebarContent className="!bg-slate-950/80">
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
                className="border-b-white/[0.06]"
              >
                <AccordionTrigger className="py-2 text-sm hover:no-underline">
                  <SidebarGroupLabel className="px-2 py-0.5 text-[13px]">
                    <span className={cn("mr-2 inline-flex items-center justify-center w-5 h-5 rounded", SECTION_ACCENTS[section.key]?.replace("text-", "bg-")?.replace("400", "500/15"))}>
                      <SectionIcon className={cn("h-3 w-3", SECTION_ACCENTS[section.key])} />
                    </span>
                    <span className="text-white/70">{section.label}</span>
                  </SidebarGroupLabel>
                </AccordionTrigger>
                <AccordionContent>
                  <SidebarGroup>
                    <SidebarGroupContent className="ml-3 pl-3 border-l border-white/[0.08]">
                      <SidebarMenu>
                        {section.items.map((it) => {
                          const ItemIcon = ITEM_ICONS[it.key] || Info;
                          const itemColor = ITEM_ACCENT_COLORS[it.key] || "text-white/50";
                          return (
                            <SidebarMenuItem key={it.href}>
                              <SidebarMenuButton
                                asChild
                                className="!text-white/60 hover:!text-white hover:!bg-white/[0.06] !bg-transparent focus-visible:ring-0"
                              >
                                <a href={it.href} className="flex items-center gap-2">
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
