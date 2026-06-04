import React, { useState, useEffect, useSyncExternalStore } from "react";

import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";

import { HamburgerMenuIcon, ReloadIcon } from "@radix-ui/react-icons";

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
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
  ItemHeader,
} from "@/components/ui/item";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";
import CurrentUser from "./common/CurrentUser.jsx";
import WaveBackground from "./WaveBackground.jsx";

import { $currentUser } from "@/stores/users.ts";
import { NavigationMenuIndicator } from "@radix-ui/react-navigation-menu";

// Sidebar imports
// Use the same Button component as the language dropdown so the appearance matches

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

  function ListItem({ title, children, href, ...props }) {
    return (
      <li {...props}>
        <NavigationMenuLink asChild>
          <a href={href}>
            <Item variant="default" className="hover:bg-slate-100">
              <ItemContent>
                <ItemTitle>{title}</ItemTitle>
                <ItemDescription>{children}</ItemDescription>
              </ItemContent>
            </Item>
          </a>
        </NavigationMenuLink>
      </li>
    );
  }

  const exchangingFundsHeading = [
    {
      title: "Home:dex.title",
      href: "/dex/index.html",
      description: "Home:dex.subtitle",
    },
    {
      title: "Home:prediction_markets.title",
      href: "/predictions/index.html",
      description: "Home:prediction_markets.subtitle",
    },
    {
      title: "Home:dex.title",
      href: "/order/index.html",
      description: "Home:dex.subtitle",
    },
    {
      title: "Home:prediction_markets.title",
      href: "/settlement/index.html",
      description: "Home:prediction_markets.subtitle",
    },
    {
      title: "Home:create_prediction.title",
      href: "/create_prediction/index.html",
      description: "Home:create_prediction.subtitle",
    },
  ];

  const accountOverviewsHeading = [
    {
      title: "Home:portfolio_balances.title",
      href: "/balances/index.html",
      description: "Home:portfolio_balances.subtitle",
    },
    {
      title: "Home:portfolio_open_orders.title",
      href: "/open-orders/index.html",
      description: "Home:portfolio_open_orders.subtitle",
    },
    {
      title: "Home:favourites.title",
      href: "/favourites/index.html",
      description: "Home:favourites.subtitle",
    },
    {
      title: "Home:issued_assets.title",
      href: "/issued_assets/index.html",
      description: "Home:issued_assets.subtitle",
    },
  ];

  const settingsHeading = [
    {
      title: "Home:about.title",
      href: "/about/index.html",
      description: "Home:about.subtitle",
    },
    {
      title: "Home:nodes.title",
      href: "/nodes/index.html",
      description: "Home:nodes.subtitle",
    },
    {
      title: "Home:create_account.title",
      href: "/create_account/index.html",
      description: "Home:create_account.subtitle",
    },
    {
      title: "Home:configure_visuals.title",
      href: "/visuals/index.html",
      description: "Home:configure_visuals.subtitle",
    },
  ];

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
      <div className="container mx-auto mb-3 px-3 sm:px-4">
        <div className="col-span-12">
          <NavigationMenu className="hidden lg:block">
            <NavigationMenuList className="gap-2">
              <NavigationMenuItem>
                <Badge
                  variant="secondary"
                  className="hover:bg-slate-200 hover:text-black"
                >
                  <NavigationMenuTrigger>
                    {t("PageHeader:exchangingFundsHeading")}
                  </NavigationMenuTrigger>
                </Badge>
                <NavigationMenuContent>
                  <ul className="grid gap-2 sm:w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px] p-2">
                    {exchangingFundsHeading.map((component) => (
                      <ListItem
                        key={t(component.title)}
                        title={t(component.title)}
                        href={component.href}
                      >
                        {t(component.description)}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Badge
                  variant="secondary"
                  className="hover:bg-slate-200 hover:text-black"
                >
                  <NavigationMenuTrigger>
                    {t("PageHeader:accountOverviewsHeading")}
                  </NavigationMenuTrigger>
                </Badge>
                <NavigationMenuContent>
                  <ul className="grid gap-2 sm:w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px] p-2">
                    {accountOverviewsHeading.map((component) => (
                      <ListItem
                        key={t(component.title)}
                        title={t(component.title)}
                        href={component.href}
                      >
                        {t(component.description)}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Badge
                  variant="secondary"
                  className="hover:bg-slate-200 hover:text-black"
                >
                  <NavigationMenuTrigger>
                    {t("PageHeader:settingsHeading")}
                  </NavigationMenuTrigger>
                </Badge>
                <NavigationMenuContent>
                  <ul className="grid gap-2 sm:w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px] p-2">
                    {settingsHeading.map((component) => (
                      <ListItem
                        key={t(component.title)}
                        title={t(component.title)}
                        href={component.href}
                      >
                        {t(component.description)}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </div>
  );
}
