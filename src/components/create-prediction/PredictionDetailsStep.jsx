import React from "react";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";
import { Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { DateTimePicker, TimePicker } from "@/components/ui/datetime-picker";

import SectionHeader from "./SectionHeader";
import Field from "./Field";
import SuffixInput from "./SuffixInput";

export default function PredictionDetailsStep({
  isEditMode,
  condition,
  setCondition,
  commission,
  setCommission,
  sanitizeCommission,
  backingAsset,
  backingAssetData,
  date,
  setDate,
  isExpiredInEditMode,
  isResolvedInEditMode,
  commissionError,
}) {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });

  return (
    <Card className="overflow-hidden border-border bg-card/60 backdrop-blur-xl shadow-lg shadow-black/20">
      <SectionHeader
        step={2}
        icon={Target}
        title={t("CreatePrediction:steps.pma.title")}
        description={t("CreatePrediction:steps.pma.description")}
      />
      <CardContent className="space-y-5 pt-6">
        <Field
          label={t("CreatePrediction:pma.condition.header")}
          help={t("CreatePrediction:pma.condition.header_content")}
          htmlFor="prediction-condition"
          required
        >
          <Textarea
            id="prediction-condition"
            placeholder={t(
              "CreatePrediction:pma.condition.placeholder"
            )}
            value={condition}
            rows={3}
            disabled={isEditMode && (isExpiredInEditMode || isResolvedInEditMode)}
            className="bg-card/60 border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-violet-500/50 disabled:opacity-50"
            onInput={(e) => setCondition(e.currentTarget.value)}
          />
        </Field>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-9">
          <Field
            label={t("CreatePrediction:pma.commission.header")}
            help={t("CreatePrediction:pma.commission.header_content")}
            htmlFor="prediction-commission"
            error={commissionError}
            className="md:col-span-3 mt-3"
          >
            <SuffixInput
              id="prediction-commission"
              suffix="%"
              placeholder={t(
                "CreatePrediction:pma.commission.placeholder"
              )}
              value={commission}
              type="text"
              inputMode="decimal"
              disabled={isEditMode && isResolvedInEditMode}
              onInput={(e) => {
                setCommission(sanitizeCommission(e.currentTarget.value));
              }}
            />
          </Field>

          <Field
            label={t("CreatePrediction:pma.backing_asset.header")}
            help={t("CreatePrediction:pma.backing_asset.header_content")}
            htmlFor="prediction-backing"
            className="md:col-span-3 mt-3"
          >
            <Input
              id="prediction-backing"
              disabled
              value={
                backingAssetData
                  ? `${backingAssetData.symbol} (${backingAssetData.id})`
                  : backingAsset
              }
              type="text"
              className="font-mono bg-card/60 border-border text-foreground disabled:opacity-100 placeholder:text-muted-foreground/60"
            />
          </Field>

          <Field
            label={t("CreatePrediction:pma.resolution.header")}
            help={t("CreatePrediction:pma.resolution.header_content")}
            required
            className="md:col-span-3"
          >
            {isEditMode && isResolvedInEditMode ? (
              <div className="rounded-md border border-border bg-card/60 px-4 py-2 text-sm text-foreground/70">
                {date ? date.toLocaleString() : t("CreatePrediction:pma.resolution.noDate")}
              </div>
            ) : (
              <div className="flex flex-col gap-3 [&_button]:bg-card/60 [&_button]:border-border [&_button]:text-foreground [&_button]:hover:bg-accent/40 [&_[role=gridcell]]:text-foreground [&_[data-selected]]:bg-violet-500 [&_[data-selected]]:text-white [&_.rdp-day]:text-foreground [&_.rdp-caption_label]:text-foreground [&_.rdp-button_previous]:text-muted-foreground [&_.rdp-button_next]:text-muted-foreground [&_input]:bg-card/60 [&_input]:border-border [&_input]:text-foreground [&_input]:focus:bg-violet-500/20 [&_input]:focus:text-foreground [&_.border-t]:border-border">
                <DateTimePicker
                  granularity="day"
                  value={date}
                  disabled={false}
                  onChange={(newDate) => {
                    const now = new Date();
                    const minDate = new Date(now.getTime() + 60 * 60 * 1000);
                    if (newDate >= minDate) {
                      setDate(newDate);
                    } else {
                      setDate(minDate);
                    }
                  }}
                />
                <TimePicker date={date} onChange={setDate} />
              </div>
            )}
          </Field>
        </div>
      </CardContent>
    </Card>
  );
}
