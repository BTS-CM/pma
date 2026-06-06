import React from "react";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";
import {
  Lock,
  Radio,
  Sparkles,
  ArrowLeftRight,
  Zap,
  Code2,
  Wallet,
  Languages,
  Shield,
} from "lucide-react";

const ICONS = {
  zeroAuth: Lock,
  multiBroadcast: Radio,
  supportsLatest: Sparkles,
  switchChains: ArrowLeftRight,
  nearInstant: Zap,
  evergreen: Code2,
  multiWallets: Wallet,
  localized: Languages,
  blockActors: Shield,
};

const ORDER = [
  "zeroAuth",
  "multiBroadcast",
  "supportsLatest",
  "switchChains",
  "nearInstant",
  "multiWallets",
  "localized",
  "blockActors",
];

export default function TrustStrip() {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });

  return (
    <section
      className="mt-12 sm:mt-16 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
      aria-label="Why this app"
    >
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-3">
        {ORDER.map((key) => {
          const Icon = ICONS[key] || Sparkles;
          const title = t(`Home:features.${key}.title`, "");
          const description = t(`Home:features.${key}.description`, "");
          if (!title) return null;
          return (
            <li
              key={key}
              className="flex items-start gap-2.5"
            >
              <span
                aria-hidden
                className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-indigo-500/15 text-indigo-300 mt-0.5"
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-white leading-tight">
                  {title}
                </div>
                <div className="text-[11.5px] text-white/60 leading-snug mt-0.5">
                  {description}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
