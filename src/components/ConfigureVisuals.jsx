import React, { useMemo } from "react";
import { useStore } from "@nanostores/react";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";

import {
  $visualSettings,
  setVisualSetting,
  resetVisualSettings,
} from "@/stores/visuals.ts";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PALETTES = [
  { id: "rainbow", labelKey: "Visuals:palettes.rainbow" },
  { id: "ocean", labelKey: "Visuals:palettes.ocean" },
  { id: "sunset", labelKey: "Visuals:palettes.sunset" },
  { id: "mono", labelKey: "Visuals:palettes.mono" },
  { id: "custom", labelKey: "Visuals:palettes.custom" },
];

const HEX_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function isValidHex(value) {
  return HEX_PATTERN.test(value);
}

function normalizeHex(value) {
  if (!value) return value;
  if (value.startsWith("#")) value = value.slice(1);
  if (value.length === 3) {
    value = value.split("").map((c) => c + c).join("");
  }
  if (value.length !== 6) return null;
  return `#${value.toLowerCase()}`;
}

function ColorField({ label, value, onChange }) {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });
  const [draft, setDraft] = React.useState(value);

  React.useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-md border border-input bg-transparent p-0"
          aria-label={label}
        />
        <Input
          type="text"
          value={draft}
          onChange={(e) => {
            const v = e.target.value;
            setDraft(v);
            const normalized = normalizeHex(v);
            if (normalized) onChange(normalized);
          }}
          onBlur={() => {
            if (!isValidHex(draft)) setDraft(value);
          }}
          className="font-mono uppercase"
          maxLength={7}
        />
      </div>
    </div>
  );
}

function SettingRow({ label, description, children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-start py-3">
      <div className="sm:col-span-1">
        <Label className="text-sm font-medium">{label}</Label>
        {description ? (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        ) : null}
      </div>
      <div className="sm:col-span-2">{children}</div>
    </div>
  );
}

export default function ConfigureVisuals() {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });
  const settings = useStore($visualSettings);

  const {
    waveCount,
    waveSpeed,
    waveThickness,
    wavePalette,
    customColor1,
    customColor2,
    auroraIntensity,
    particlesEnabled,
    blurAmount,
  } = settings;

  const safeWaveCount = Number.isFinite(Number(waveCount))
    ? Math.round(Number(waveCount))
    : 10;
  const safeWaveSpeed = Number.isFinite(Number(waveSpeed))
    ? Number(waveSpeed)
    : 1.0;
  const safeWaveThickness = Number.isFinite(Number(waveThickness))
    ? Number(waveThickness)
    : 1.0;
  const safeAurora = Number.isFinite(Number(auroraIntensity))
    ? Number(auroraIntensity)
    : 1.0;
  const safeBlur = Number.isFinite(Number(blurAmount))
    ? Math.round(Number(blurAmount))
    : 2;

  return (
    <div className="container mx-auto mt-3 mb-5 px-3 sm:px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {t("Visuals:pageTitle")}
          </CardTitle>
          <CardDescription>{t("Visuals:pageDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 divide-y divide-border">
          <SettingRow
            label={t("Visuals:waveCount")}
            description={t("Visuals:waveCountDesc")}
          >
            <div className="flex items-center gap-4">
              <Slider
                value={[safeWaveCount]}
                min={3}
                max={15}
                step={1}
                onValueChange={(v) => setVisualSetting("waveCount", v[0])}
                className="flex-1"
              />
              <span className="w-10 text-right text-sm font-mono tabular-nums">
                {safeWaveCount}
              </span>
            </div>
          </SettingRow>

          <SettingRow
            label={t("Visuals:waveSpeed")}
            description={t("Visuals:waveSpeedDesc")}
          >
            <div className="flex items-center gap-4">
              <Slider
                value={[Math.round(safeWaveSpeed * 100)]}
                min={30}
                max={200}
                step={5}
                onValueChange={(v) =>
                  setVisualSetting("waveSpeed", v[0] / 100)
                }
                className="flex-1"
              />
              <span className="w-12 text-right text-sm font-mono tabular-nums">
                {safeWaveSpeed.toFixed(2)}×
              </span>
            </div>
          </SettingRow>

          <SettingRow
            label={t("Visuals:waveThickness")}
            description={t("Visuals:waveThicknessDesc")}
          >
            <div className="flex items-center gap-4">
              <Slider
                value={[Math.round(safeWaveThickness * 100)]}
                min={50}
                max={200}
                step={5}
                onValueChange={(v) =>
                  setVisualSetting("waveThickness", v[0] / 100)
                }
                className="flex-1"
              />
              <span className="w-12 text-right text-sm font-mono tabular-nums">
                {safeWaveThickness.toFixed(2)}×
              </span>
            </div>
          </SettingRow>

          <SettingRow
            label={t("Visuals:palette")}
            description={t("Visuals:paletteDesc")}
          >
            <Select
              value={wavePalette}
              onValueChange={(v) => setVisualSetting("wavePalette", v)}
            >
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PALETTES.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {t(p.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>

          {wavePalette === "custom" && (
            <div className="py-3 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ColorField
                  label={t("Visuals:customColor1")}
                  value={customColor1}
                  onChange={(v) => setVisualSetting("customColor1", v)}
                />
                <ColorField
                  label={t("Visuals:customColor2")}
                  value={customColor2}
                  onChange={(v) => setVisualSetting("customColor2", v)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t("Visuals:customColorDesc")}
              </p>
            </div>
          )}

          <SettingRow
            label={t("Visuals:auroraIntensity")}
            description={t("Visuals:auroraIntensityDesc")}
          >
            <div className="flex items-center gap-4">
              <Slider
                value={[Math.round(safeAurora * 100)]}
                min={0}
                max={200}
                step={5}
                onValueChange={(v) =>
                  setVisualSetting("auroraIntensity", v[0] / 100)
                }
                className="flex-1"
              />
              <span className="w-12 text-right text-sm font-mono tabular-nums">
                {safeAurora.toFixed(2)}×
              </span>
            </div>
          </SettingRow>

          <SettingRow
            label={t("Visuals:blurAmount")}
            description={t("Visuals:blurAmountDesc")}
          >
            <div className="flex items-center gap-4">
              <Slider
                value={[safeBlur]}
                min={0}
                max={5}
                step={1}
                onValueChange={(v) =>
                  setVisualSetting("blurAmount", v[0])
                }
                className="flex-1"
              />
              <span className="w-10 text-right text-sm font-mono tabular-nums">
                {safeBlur}
              </span>
            </div>
          </SettingRow>

          <SettingRow
            label={t("Visuals:particles")}
            description={t("Visuals:particlesDesc")}
          >
            <div className="flex items-center">
              <Switch
                checked={particlesEnabled}
                onCheckedChange={(v) =>
                  setVisualSetting("particlesEnabled", v)
                }
              />
              <span className="ml-3 text-sm text-muted-foreground">
                {particlesEnabled
                  ? t("Visuals:on")
                  : t("Visuals:off")}
              </span>
            </div>
          </SettingRow>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end">
        <Button variant="destructive" onClick={resetVisualSettings}>
          {t("Visuals:resetToDefaults")}
        </Button>
      </div>
    </div>
  );
}
