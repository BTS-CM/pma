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

export default function AppSidebar() {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });

  const exchangingFundsHeading = [
    { title: "Home:dex.title", href: "/dex/index.html" },
    { title: "Home:prediction_markets.title", href: "/predictions/index.html" },
    { title: "Home:dex.title", href: "/order/index.html" },
    { title: "Home:prediction_markets.title", href: "/settlement/index.html" },
    {
      title: "Home:create_prediction.title",
      href: "/create_prediction/index.html",
    },
  ];

  const accountOverviewsHeading = [
    { title: "Home:portfolio_balances.title", href: "/balances/index.html" },
    {
      title: "Home:portfolio_open_orders.title",
      href: "/open-orders/index.html",
    },
    { title: "Home:favourites.title", href: "/favourites/index.html" },
    { title: "Home:issued_assets.title", href: "/issued_assets/index.html" },
  ];

  const settingsHeading = [
    { title: "Home:about.title", href: "/about/index.html" },
    { title: "Home:nodes.title", href: "/nodes/index.html" },
    { title: "Home:create_account.title", href: "/create_account/index.html" },
  ];

  const sections = [
    {
      key: "exchanging",
      label: t("PageHeader:exchangingFundsHeading"),
      items: exchangingFundsHeading,
    },
    {
      key: "accounts",
      label: t("PageHeader:accountOverviewsHeading"),
      items: accountOverviewsHeading,
    },
    {
      key: "settings",
      label: t("PageHeader:settingsHeading"),
      items: settingsHeading,
    },
  ];

  const groupEmojis = {
    exchanging: "💱",
    accounts: "👤",
    settings: "⚙️",
  };

  const { openMobile, isMobile } = useSidebar();
  const [accValue, setAccValue] = React.useState(sections[0].key);

  React.useEffect(() => {
    // When opening the mobile sidebar sheet, default to the first group
    if (isMobile && openMobile) {
      setAccValue(sections[0].key);
    }
  }, [isMobile, openMobile]);

  return (
    <Sidebar>
      <SidebarContent>
        <Accordion
          type="single"
          collapsible
          value={accValue}
          onValueChange={setAccValue}
          className="w-full"
        >
          {sections.map((section) => (
            <AccordionItem key={section.key} value={section.key}>
              <AccordionTrigger className="py-2 text-sm">
                <SidebarGroupLabel className="px-2 py-0.5 text-[13px]">
                  <span className="mr-2" aria-hidden>
                    {groupEmojis[section.key]}
                  </span>
                  {section.label}
                </SidebarGroupLabel>
              </AccordionTrigger>
              <AccordionContent>
                <SidebarGroup>
                  <SidebarGroupContent className="ml-3 pl-3 border-l border-sidebar-border">
                    <SidebarMenu>
                      {section.items.map((it) => (
                        <SidebarMenuItem key={it.href}>
                          <SidebarMenuButton asChild>
                            <a href={it.href}>
                              <span>{t(it.title)}</span>
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </SidebarContent>
    </Sidebar>
  );
}
