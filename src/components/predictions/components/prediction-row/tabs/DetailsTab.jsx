import React from "react";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { StatBlock, LongText, MonoBlock } from "../../ui";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { humanReadableFloat } from "../../../../utils/formatters";

export function DetailsTab({
  res,
  house,
  cleanedDescription,
  _issuer_permissions,
  _flags,
  t,
}) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {cleanedDescription ? (
        <LongText
          label={t("Predictions:description")}
          value={cleanedDescription}
        />
      ) : null}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <StatBlock
          label={t("Predictions:permissions")}
          value={
            Object.keys(_issuer_permissions).length > 0 ? (
              <HoverCard>
                <HoverCardTrigger>
                  <span className="inline-flex items-center gap-1">
                    {Object.keys(_issuer_permissions).length}
                    <QuestionMarkCircledIcon className="h-3 w-3" />
                  </span>
                </HoverCardTrigger>
                <HoverCardContent
                  className="w-80 mt-1 bg-slate-950 border-white/[0.08] text-white z-[9999]"
                  align="start"
                >
                  {Object.keys(_issuer_permissions).join(", ")}
                </HoverCardContent>
              </HoverCard>
            ) : (
              "0"
            )
          }
        />
        <StatBlock
          label={t("Predictions:flags")}
          value={
            Object.keys(_flags).length > 0 ? (
              <HoverCard>
                <HoverCardTrigger>
                  <span className="inline-flex items-center gap-1">
                    {Object.keys(_flags).length}
                    <QuestionMarkCircledIcon className="h-3 w-3" />
                  </span>
                </HoverCardTrigger>
                <HoverCardContent
                  className="w-80 mt-1 bg-slate-950 border-white/[0.08] text-white z-[9999]"
                  align="start"
                >
                  {Object.keys(_flags).join(", ")}
                </HoverCardContent              />
            ) : (
              "0"
            )
          }
        />
      </div>
      <div className="rounded-md border border-white/10 bg-white/5 p-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-white/60">
              {t("Predictions:details.assetId")}
            </div>
            <MonoBlock
              value={res.id}
              copyable
              label={t("Predictions:copyAssetId")}
            />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-white/60">
              {t("Predictions:details.issuer")}
            </div>
            <MonoBlock
              value={house}
              copyable
              label={t("Predictions:copyIssuerId")}
            />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-white/60">
              {t("Predictions:details.precision")}
            </div>
            <span className="font-mono">{res.precision}</span>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-white/60">
              {t("Predictions:details.maxSupply")}
            </div>
            <span className="font-mono">
              {humanReadableFloat(
                res.options.max_supply,
                res.precision,
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}