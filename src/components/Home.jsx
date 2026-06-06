import React, { useEffect, useMemo } from "react";
import { useStore } from "@nanostores/react";
import { useSyncExternalStore } from "react";

import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import { useInitCache } from "@/nanoeffects/Init.ts";
import { $currentUser } from "@/stores/users.ts";
import { $currentNode } from "@/stores/node.ts";
import { $blockList, updateBlockList } from "@/stores/blocklist.ts";

import { createBlockedAccountStore } from "@/nanoeffects/BlockedAccounts.ts";

export default function Home(properties) {
  const { t, i18n } = useTranslation(locale.get(), { i18n: i18nInstance });
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

  useInitCache(usr && usr.chain ? usr.chain : "bitshares", []);
  useEffect(() => {
    if (
      blocklist &&
      blocklist.timestamp &&
      usr &&
      usr.chain &&
      usr.chain === "bitshares" && // production only block list
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

  const accordionSections = [
    {
      value: "item-1",
      icon: "💱",
      headingKey: "PageHeader:exchangingFundsHeading",
      cards: [
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
      ],
    },
    {
      value: "item-4",
      icon: "👤",
      headingKey: "PageHeader:accountOverviewsHeading",
      cards: [
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
      ],
    },
    {
      value: "item-7",
      icon: "⚙️",
      headingKey: "PageHeader:settingsHeading",
      cards: [
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
      ],
    },
  ];

  const renderHoverCard = (card) => (
    <HoverCard key={card.key}>
      <HoverCardTrigger asChild>
        <a href={card.href} style={{ textDecoration: "none" }}>
          <Card className="h-full hover:shadow-md hover:shadow-black">
            <CardHeader>
              <CardTitle>{t(card.titleKey)}</CardTitle>
              <CardDescription>{t(card.subtitleKey)}</CardDescription>
            </CardHeader>
          </Card>
        </a>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 text-sm pt-1">
        <ul className="ml-2 list-disc [&>li]:mt-2">
          {card.hoverKeys?.map((hoverKey, index) => (
            <li key={`${card.key}-hover-${index}`}>{t(hoverKey)}</li>
          ))}
        </ul>
      </HoverCardContent>
    </HoverCard>
  );

  return (
    <>
      <div className="container mx-auto mt-3 mb-5 px-3 sm:px-4">
        <h3 className="scroll-m-20 text-xl sm:text-2xl font-semibold tracking-tight mb-4 sm:mb-5 text-center mt-8 sm:mt-10">
          {t("Home:features.functionalityHeading")}
        </h3>

        {accordionSections.map((section) => (
          <div key={section.value} className="mb-6">
            <h4 className="mt-3 mb-2 scroll-m-20 text-xl font-semibold tracking-tight text-white">
              {section.icon} {t(section.headingKey)}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {section.cards.map((card) => renderHoverCard(card))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
