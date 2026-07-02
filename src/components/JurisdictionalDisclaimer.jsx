import React, { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { useStore } from "@nanostores/react";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";
import { $disclaimerAccepted, acceptDisclaimer } from "@/stores/disclaimer.ts";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { AlertTriangle, Globe } from "lucide-react";

const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "da", label: "Dansk" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "pt", label: "Português" },
  { code: "th", label: "ไทย" },
];

export default function JurisdictionalDisclaimer() {
  const accepted = useStore($disclaimerAccepted);
  const [checked, setChecked] = useState(false);
  const [langLoading, setLangLoading] = useState(false);

  const currentLocale = useSyncExternalStore(
    locale.subscribe,
    locale.get,
    () => locale.get(),
  );

  const { t } = useTranslation(currentLocale, { i18n: i18nInstance });

  const handleProceed = useCallback(() => {
    if (checked) {
      acceptDisclaimer();
    }
  }, [checked]);

  const handleLanguageChange = useCallback((lang) => {
    setLangLoading(true);
    i18nInstance.changeLanguage(lang);
    locale.set(lang);
    window.location.reload();
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
    }
    function handleContextMenu(e) {
      e.preventDefault();
    }
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("contextmenu", handleContextMenu, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("contextmenu", handleContextMenu, true);
    };
  }, []);

  if (accepted) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.preventDefault()}
      onMouseDown={(e) => e.preventDefault()}
      onScroll={(e) => e.preventDefault()}
    >
      <Card className="mx-4 my-8 flex max-h-[90vh] w-full max-w-2xl flex-col border-amber-500/30 bg-card shadow-2xl shadow-amber-500/10">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-lg text-amber-500">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              {t("Disclaimer:title")}
            </CardTitle>
            <Select
              value={currentLocale}
              onValueChange={handleLanguageChange}
              disabled={langLoading}
            >
              <SelectTrigger className="h-8 w-auto min-w-[120px] shrink-0 border-border/50 bg-card/50 text-xs text-muted-foreground">
                <Globe className="mr-1 h-3 w-3" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-[10000]" position="popper" sideOffset={4}>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code} className="text-xs">
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[50vh] px-6 py-4">
            <div className="space-y-4 text-sm leading-relaxed text-foreground/80">
              <p className="font-medium text-foreground">
                {t("Disclaimer:readCarefully")}
              </p>
              <p>
                {t("Disclaimer:intro")}
              </p>
              <p>
                {t("Disclaimer:acknowledge")}
              </p>

              <div className="space-y-3">
                <section>
                  <h3 className="mb-1 font-semibold text-foreground">
                    1. {t("Disclaimer:section1Title")}
                  </h3>
                  <p>{t("Disclaimer:section1Content")}</p>
                </section>

                <section>
                  <h3 className="mb-1 font-semibold text-foreground">
                    2. {t("Disclaimer:section2Title")}
                  </h3>
                  <p>{t("Disclaimer:section2Content")}</p>
                </section>

                <section>
                  <h3 className="mb-1 font-semibold text-foreground">
                    3. {t("Disclaimer:section3Title")}
                  </h3>
                  <p>{t("Disclaimer:section3Content")}</p>
                  <ul className="my-2 list-disc space-y-1 pl-6">
                    <li>{t("Disclaimer:jurisdictionUSA")}</li>
                    <li>{t("Disclaimer:jurisdictionUK")}</li>
                    <li>{t("Disclaimer:jurisdictionEU")}</li>
                    <li>{t("Disclaimer:jurisdictionOther")}</li>
                    <li>{t("Disclaimer:jurisdictionSanctions")}</li>
                  </ul>
                </section>

                <section>
                  <h3 className="mb-1 font-semibold text-foreground">
                    4. {t("Disclaimer:section4Title")}
                  </h3>
                  <p>{t("Disclaimer:section4Content")}</p>
                </section>

                <section>
                  <h3 className="mb-1 font-semibold text-foreground">
                    5. {t("Disclaimer:section5Title")}
                  </h3>
                </section>
              </div>
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 border-t border-border/50 pt-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="disclaimer-agree"
              checked={checked}
              onCheckedChange={setChecked}
              className="mt-0.5"
            />
            <Label
              htmlFor="disclaimer-agree"
              className="cursor-pointer text-sm leading-snug"
            >
              {t("Disclaimer:checkboxLabel")}
            </Label>
          </div>

          <Button
            className="w-full"
            disabled={!checked || langLoading}
            onClick={handleProceed}
          >
            {t("Disclaimer:proceed")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
