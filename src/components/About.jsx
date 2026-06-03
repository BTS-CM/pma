import React from "react";

import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

export default function About() {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });

  const features = [
    {
      key: "zeroAuth",
      icon: "⛓️‍💥",
    },
    {
      key: "multiBroadcast",
      icon: "📡",
    },
    {
      key: "supportsLatest",
      icon: "🧑‍🔬",
    },
    {
      key: "switchChains",
      icon: "🌐",
    },
    {
      key: "nearInstant",
      icon: "🚀",
    },
    {
      key: "evergreen",
      icon: "🌲",
    },
    {
      key: "multiWallets",
      icon: "👛",
    },
    {
      key: "localized",
      icon: "🌍",
    },
    {
      key: "blockActors",
      icon: "🤚",
    },
  ];

  return (
    <div className="container mx-auto mt-3 mb-5 px-3 sm:px-4">
      <h3 className="scroll-m-20 text-xl sm:text-2xl font-semibold tracking-tight mb-4 sm:mb-5">
        {t("About:title")}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-5">
        {features.map((feature) => (
          <Item
            key={feature.key}
            variant="outline"
            className="w-full bg-white"
          >
            <ItemMedia variant="icon">{feature.icon}</ItemMedia>
            <ItemContent>
              <ItemTitle className="text-black">
                {t(`About:features.${feature.key}.title`)}
              </ItemTitle>
              <ItemDescription>
                {t(`About:features.${feature.key}.description`)}
              </ItemDescription>
            </ItemContent>
          </Item>
        ))}
      </div>
    </div>
  );
}
