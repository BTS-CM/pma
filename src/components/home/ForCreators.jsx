import React from "react";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";
import { Crown, ArrowRight } from "lucide-react";

export default function ForCreators() {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });

  return (
    <section
      className="mt-8 sm:mt-10 relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/15 via-fuchsia-500/10 to-transparent p-5 sm:p-7"
      aria-label={t("Home:creators.title")}
    >
      <div
        aria-hidden
        className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-fuchsia-500/15 blur-3xl"
      />
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <span className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500/25 text-indigo-200">
          <Crown className="h-6 w-6" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-200/80 mb-1">
            {t("Home:creators.eyebrow")}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
            {t("Home:creators.title")}
          </h2>
          <p className="text-sm sm:text-base text-white/75 max-w-2xl leading-relaxed">
            {t("Home:creators.body")}
          </p>
        </div>
        <a
          href="/create_prediction.html"
          className="inline-flex items-center gap-2 self-stretch sm:self-auto justify-center rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm px-4 py-2.5 transition-colors shadow-sm shadow-indigo-900/40"
        >
          {t("Home:creators.cta")}
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}
