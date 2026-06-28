import React from "react";
import { ShieldCheck, ExternalLink as ExternalLinkIcon } from "lucide-react";
import { StatBlock, LongText, MonoBlock } from "../../ui";
import { Button } from "@/components/ui/button";
import DOMPurify from "dompurify";

export function OrgTab({ parentPmoObject, res, t }) {
  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck className="h-4 w-4 text-cyan-400" />
        <span className="text-sm font-semibold text-foreground">{t("Predictions:org.title")}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {parentPmoObject.name ? <StatBlock label={t("Predictions:org.name")} value={parentPmoObject.name} /> : null}
        {parentPmoObject.website ? (
          <StatBlock label={t("Predictions:org.website")} value={
            <a href={parentPmoObject.website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline inline-flex items-center gap-1">
              {parentPmoObject.website}
              <ExternalLinkIcon className="h-3 w-3" />
            </a>
          } />
        ) : null}
        {parentPmoObject.manifest ? (
          <StatBlock label={t("Predictions:org.manifest")} value={
            <a href={parentPmoObject.manifest} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline inline-flex items-center gap-1">
              {parentPmoObject.manifest}
              <ExternalLinkIcon className="h-3 w-3" />
            </a>
          } />
        ) : null}
        {parentPmoObject.onchain_account ? <StatBlock label={t("Predictions:org.onchainAccount")} value={parentPmoObject.onchain_account} mono /> : null}
      </div>

      {parentPmoObject.resolution_policy ? <LongText label={t("Predictions:org.resolutionPolicy")} value={DOMPurify.sanitize(parentPmoObject.resolution_policy)} /> : null}
      {parentPmoObject.dispute_mechanism ? <LongText label={t("Predictions:org.disputeMechanism")} value={DOMPurify.sanitize(parentPmoObject.dispute_mechanism)} /> : null}
      {parentPmoObject.attestation ? <LongText label={t("Predictions:org.attestation")} value={DOMPurify.sanitize(parentPmoObject.attestation)} /> : null}

      {parentPmoObject.pmo_signature ? (
        <div className="rounded-md border border-border bg-accent/30 dark:bg-white/5 p-3 text-xs">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-0.5">{t("Predictions:org.signature")}</div>
          <MonoBlock value={parentPmoObject.pmo_signature} truncate={32} copyable label={t("Predictions:nft.copySig")} />
        </div>
      ) : null}

      <Button variant="outline" size="sm" asChild className="self-start">
        <a href={`/active-predictions.html?search=${res.symbol.split(".")[0]}.`}>
          <ExternalLinkIcon className="mr-2 h-3.5 w-3.5" />
          {t("Predictions:org.viewAll", { symbol: res.symbol.split(".")[0] })}
        </a>
      </Button>
    </div>
  );
}