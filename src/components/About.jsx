import React from "react";

import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Info, Link2, Radio, FlaskConical, Globe, Rocket, TreePine, Wallet, Globe2, Ban } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURE_ICONS = {
  zeroAuth: Link2,
  multiBroadcast: Radio,
  supportsLatest: FlaskConical,
  switchChains: Globe,
  nearInstant: Rocket,
  evergreen: TreePine,
  multiWallets: Wallet,
  localized: Globe2,
  blockActors: Ban,
};

const FEATURE_ACCENTS = {
  zeroAuth: "from-blue-500 to-indigo-500",
  multiBroadcast: "from-cyan-500 to-sky-500",
  supportsLatest: "from-violet-500 to-purple-500",
  switchChains: "from-teal-500 to-cyan-500",
  nearInstant: "from-amber-500 to-orange-500",
  evergreen: "from-emerald-500 to-green-500",
  multiWallets: "from-fuchsia-500 to-pink-500",
  localized: "from-sky-500 to-blue-500",
  blockActors: "from-rose-500 to-red-500",
};

const FEATURE_CHIP = {
  zeroAuth: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  multiBroadcast: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  supportsLatest: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  switchChains: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  nearInstant: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  evergreen: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  multiWallets: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30",
  localized: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  blockActors: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

const features = [
  "zeroAuth",
  "multiBroadcast",
  "supportsLatest",
  "switchChains",
  "nearInstant",
  "evergreen",
  "multiWallets",
  "localized",
  "blockActors",
];

export default function About() {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });

  return (
    <div className="container mx-auto mt-5 mb-5 text-white">
      <div className="grid grid-cols-1 gap-3">
        <Card className="bg-slate-900/60 border-white/[0.08] shadow-lg shadow-black/20 backdrop-blur-sm">
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/15 flex-shrink-0">
                <Info className="h-5 w-5 text-blue-400" />
              </span>
              {t("About:title")}
            </CardTitle>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((key) => {
            const Icon = FEATURE_ICONS[key] || Info;
            return (
              <Card
                key={key}
                className="group bg-slate-900/60 border-white/[0.08] hover:bg-white/[0.03] hover:border-white/[0.15] transition-all rounded-xl relative overflow-hidden"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r opacity-60 group-hover:opacity-100 transition-opacity",
                    FEATURE_ACCENTS[key]
                  )}
                />
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                      FEATURE_CHIP[key]
                    )}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-white leading-snug">
                        {t(`About:features.${key}.title`)}
                      </h3>
                      <p className="mt-1 text-[12.5px] leading-snug text-white/55">
                        {t(`About:features.${key}.description`)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
