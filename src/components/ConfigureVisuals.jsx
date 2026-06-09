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

import { Palette, RotateCcw } from "lucide-react";

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
      <Label className="text-sm text-white/70">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-md border border-white/[0.12] bg-transparent p-0"
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
          className="font-mono uppercase bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30"
          maxLength={7}
        />
      </div>
    </div>
  );
}

function SettingRow({ label, description, children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-start py-3 border-b border-white/[0.06] last:border-b-0">
      <div className="sm:col-span-1">
        <Label className="text-sm font-medium text-white/70">{label}</Label>
        {description ? (
          <p className="text-xs text-white/40 mt-1">{description}</p>
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
    <div className="container mx-auto mt-5 mb-5 text-white">
      <div className="grid grid-cols-1 gap-3">
        <Card className="bg-slate-900/60 border-white/[0.08] shadow-lg shadow-black/20 backdrop-blur-sm">
          <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-violet-500/15 flex-shrink-0">
                <Palette className="h-5 w-5 text-violet-400" />
              </span>
              {t("Visuals:pageTitle")}
            </CardTitle>
            <CardDescription className="text-white/50 ml-11">
              {t("Visuals:pageDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
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
                  variant="violet"
                />
                <span className="w-10 text-right text-sm font-mono tabular-nums text-white/70">
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
                  variant="cyan"
                />
                <span className="w-12 text-right text-sm font-mono tabular-nums text-white/70">
                  {safeWaveSpeed.toFixed(2)}x
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
                  variant="emerald"
                />
                <span className="w-12 text-right text-sm font-mono tabular-nums text-white/70">
                  {safeWaveThickness.toFixed(2)}x
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
                <SelectTrigger className="w-full sm:w-64 bg-white/[0.03] border-white/[0.08] text-white/70">
                  <SelectValue className="text-white/70" />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-white/[0.08] shadow-2xl shadow-black/40">
                  {PALETTES.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-white/70 focus:bg-white/[0.08] focus:text-white">
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
                <p className="text-xs text-white/40">
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
                  variant="amber"
                />
                <span className="w-12 text-right text-sm font-mono tabular-nums text-white/70">
                  {safeAurora.toFixed(2)}x
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
                  variant="rose"
                />
                <span className="w-10 text-right text-sm font-mono tabular-nums text-white/70">
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
                  className="data-[state=checked]:bg-violet-500"
                />
                <span className="ml-3 text-sm text-white/50">
                  {particlesEnabled
                    ? t("Visuals:on")
                    : t("Visuals:off")}
                </span>
              </div>
            </SettingRow>

            <div className="pt-6 pb-2">
              <h3 className="text-lg font-semibold tracking-tight text-white">
                {t("Visuals:externalServices.heading")}
              </h3>
              <p className="text-xs text-white/40 mt-1">
                {t("Visuals:externalServices.description")}
              </p>
            </div>

            <SettingRow
              label={t("Visuals:externalServices.ipfsGateway.header")}
              description={t("Visuals:externalServices.ipfsGateway.help")}
            >
              <Input
                type="text"
                value={settings.ipfsGateway ?? "https://ipfs.io/ipfs/"}
                onChange={(e) =>
                  setVisualSetting("ipfsGateway", e.target.value)
                }
                placeholder={t(
                  "Visuals:externalServices.ipfsGateway.placeholder"
                )}
                className="font-mono bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30"
              />
            </SettingRow>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={resetVisualSettings}
            className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t("Visuals:resetToDefaults")}
          </Button>
        </div>
      </div>
    </div>
  );
}
