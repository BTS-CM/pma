import React from "react";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";
import {
  Sparkles,
  Send,
  Info,
  CheckCircle2,
  AlertCircle,
  Hash,
  Tag,
  FileText,
  Coins,
  Calendar,
  Percent,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import SectionHeader from "./SectionHeader";
import SummaryRow from "./SummaryRow";

export default function SummaryStep({
  summaryRef,
  isEditMode,
  _chain,
  feeSchedule,
  fullSymbol,
  shortName,
  condition,
  backingAsset,
  backingAssetData,
  maxSupply,
  commissionNum,
  date,
  daysUntil,
  isFormValid,
  estimatedFee,
  feeCalculating,
  hasExpiredWithPrize,
  setShowDialog,
  setExpiryWarningDialog,
  originalExpiryRef,
}) {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });

  return (
    <Card
      ref={summaryRef}
      className="overflow-hidden border-border bg-card/60 backdrop-blur-xl shadow-lg shadow-black/20"
    >
      <SectionHeader
        icon={Sparkles}
        title={t("CreatePrediction:summary.title")}
        description={t("CreatePrediction:summary.subtitle")}
      />
      <CardContent className="space-y-5 pt-6">
        <div className="overflow-hidden rounded-lg border border-border bg-accent/30 dark:bg-white/[0.05]">
          <div className="divide-y divide-white/10 px-4">
            <SummaryRow
              icon={Hash}
              label={t("CreatePrediction:summary.symbol")}
              value={fullSymbol}
              mono
            />
            <SummaryRow
              icon={Tag}
              label={t("CreatePrediction:summary.name")}
              value={shortName}
            />
            <SummaryRow
              icon={FileText}
              label={t("CreatePrediction:summary.condition")}
              value={
                condition ||
                t("CreatePrediction:summary.noCondition")
              }
            />
            <SummaryRow
              icon={Coins}
              label={t("CreatePrediction:summary.backing")}
              value={
                backingAssetData
                  ? `${backingAssetData.symbol} (${backingAssetData.id})`
                  : backingAsset
              }
              mono
            />
            <SummaryRow
              icon={Hash}
              label={t("CreatePrediction:summary.maxSupply")}
              value={
                parseFloat(maxSupply) > 0
                  ? parseFloat(maxSupply).toLocaleString()
                  : null
              }
              mono
            />
            <SummaryRow
              icon={Percent}
              label={t("CreatePrediction:summary.commission")}
              value={
                commissionNum > 0
                  ? `${commissionNum}%`
                  : "0%"
              }
            />
            <SummaryRow
              icon={Calendar}
              label={t("CreatePrediction:summary.resolution")}
              value={
                date
                  ? `${date.toLocaleDateString()} · ${t(
                      "CreatePrediction:summary.days",
                      { count: daysUntil }
                    )}`
                  : null
              }
            />
          </div>
        </div>

        {isFormValid ? (
          <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            <p className="text-sm font-medium text-emerald-400">
              {isEditMode ? t("CreatePrediction:summary.readyUpdate") : t("CreatePrediction:summary.ready")}
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <p className="text-sm font-medium text-amber-400">
              {t("CreatePrediction:summary.fieldsRequired")}
            </p>
          </div>
        )}

        <div className="flex items-start gap-3 rounded-lg border border-border bg-accent/30 dark:bg-white/[0.05] p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">
              {t("CreatePrediction:tips.submitTitle")}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {t("CreatePrediction:tips.submitHint")}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          {feeSchedule && (
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 text-sm cursor-help">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <span className="font-mono text-amber-400">
                      {feeCalculating
                        ? t("CreatePrediction:fee.calculating")
                        : `${(estimatedFee / 100000).toFixed(5)} ${_chain === "bitshares" ? "BTS" : "TEST"}`}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-card border-border text-foreground max-w-xs"
                >
                  <p className="text-xs">{isEditMode ? t("CreatePrediction:fee.updateHover") : t("CreatePrediction:fee.hover")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Button
            size="lg"
            disabled={!isFormValid}
            onClick={() => {
              const expiryChanged = originalExpiryRef.current !== null && date && date.getTime() !== originalExpiryRef.current;
              if (hasExpiredWithPrize && expiryChanged) {
                setExpiryWarningDialog(true);
              } else {
                setShowDialog(true);
              }
            }}
            className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-foreground font-semibold shadow-lg shadow-violet-500/25 hover:brightness-110 active:scale-[0.99] transition-all"
          >
            <Send className="h-4 w-4" />
            {isEditMode ? t("CreatePrediction:buttons.update") : t("CreatePrediction:buttons.submit")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
