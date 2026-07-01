import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";
import { Tag } from "lucide-react";
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

import SectionHeader from "./SectionHeader";
import Field from "./Field";
import { CATEGORIES, CATEGORY_KEYS } from "@/components/predictions/constants/classification";

export default function ClassificationStep({
  category,
  setCategory,
  subcategory,
  setSubcategory,
}) {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });

  const subcategories = useMemo(() => {
    if (!category || !CATEGORIES[category]) return [];
    return CATEGORIES[category];
  }, [category]);

  const hasSubcategories = subcategories.length > 0;

  return (
    <Card className="overflow-hidden border-border bg-card/60 backdrop-blur-xl shadow-lg shadow-black/20">
      <SectionHeader
        step={3}
        icon={Tag}
        title={t("CreatePrediction:steps.classification.title")}
        description={t("CreatePrediction:steps.classification.description")}
      />
      <CardContent className="space-y-5 pt-6">
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
                    {cat}
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
                    {sub}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </CardContent>
    </Card>
  );
}
