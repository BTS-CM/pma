import React from "react";
import { ImageIcon } from "@radix-ui/react-icons";
import { ipfsUrl } from "@/lib/common.js";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";

export function NftHero({ images, heroIndex, setHeroIndex, ipfsGateway }) {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });
  const hero = images[heroIndex] || images[0];
  if (!hero) return null;
  const src = ipfsUrl(hero.url, ipfsGateway);
  return (
    <div className="rounded-md border border-white/10 overflow-hidden bg-white/5">
      {src ? (
        <img
          src={src}
          alt={hero.type}
          loading="lazy"
          className="w-full h-auto object-contain max-h-[420px]"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-32 text-white/40 text-sm">
          <ImageIcon className="mr-2 h-4 w-4" />
          {t("Predictions:nft.noImage")}
        </div>
      )}
    </div>
  );
}