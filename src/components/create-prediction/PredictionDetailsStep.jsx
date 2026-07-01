import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";
import { Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { DateTimePicker, TimePicker } from "@/components/ui/datetime-picker";

import SectionHeader from "./SectionHeader";
import Field from "./Field";
import SuffixInput from "./SuffixInput";
import { CATEGORY_KEYS, getSubcategories } from "@/components/predictions/constants/classification";

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
  category,
  setCategory,
  subcategory,
  setSubcategory,
}) {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });

  const subcategories = useMemo(() => getSubcategories(category), [category]);
  const hasSubcategories = subcategories.length > 0;

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

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field
            label={t("CreatePrediction:classification.category.header")}
            help={t("CreatePrediction:classification.category.header_content")}
            htmlFor="prediction-category"
          >
            <Select
              value={category}
              onValueChange={(val) => {
                setCategory(val);
                setSubcategory("");
              }}
            >
              <SelectTrigger
                id="prediction-category"
                className="bg-card/60 border-border text-foreground"
              >
                <SelectValue
                  placeholder={t("CreatePrediction:classification.category.placeholder")}
                />
              </SelectTrigger>
              <SelectContent className="bg-card border-border shadow-2xl shadow-black/40">
                {CATEGORY_KEYS.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {t("Predictions:categories." + cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            label={t("CreatePrediction:classification.subcategory.header")}
            help={t("CreatePrediction:classification.subcategory.header_content")}
            htmlFor="prediction-subcategory"
          >
            <Select
              value={subcategory}
              onValueChange={setSubcategory}
              disabled={!category || !hasSubcategories}
            >
              <SelectTrigger
                id="prediction-subcategory"
                className="bg-card/60 border-border text-foreground disabled:opacity-50"
              >
                <SelectValue
                  placeholder={
                    !category
                      ? t("CreatePrediction:classification.subcategory.selectCategory")
                      : !hasSubcategories
                        ? t("CreatePrediction:classification.subcategory.noneAvailable")
                        : t("CreatePrediction:classification.subcategory.placeholder")
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-card border-border shadow-2xl shadow-black/40">
                {subcategories.map((sub) => (
                  <SelectItem key={sub} value={sub}>
                    {t("Predictions:subcategories." + sub)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

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
