import React from "react";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";
import { Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import SectionHeader from "./SectionHeader";
import Field from "./Field";

export default function AssetIdentityStep({
  isEditMode,
  creationMode,
  setCreationMode,
  selectedOrg,
  setSelectedOrg,
  subAssetName,
  setSubAssetName,
  symbol,
  setSymbol,
  symbolError,
  symbolExists,
  shortName,
  setShortName,
  maxSupply,
  setMaxSupply,
  sanitizeMaxSupply,
  fullSymbol,
  maxSubAssetLength,
  userOrgs,
  desc,
  setDesc,
}) {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });

  return (
    <Card className="overflow-hidden border-border bg-card/60 backdrop-blur-xl shadow-lg shadow-black/20">
      <SectionHeader
        step={1}
        icon={Hash}
        title={t("CreatePrediction:steps.asset.title")}
        description={t("CreatePrediction:steps.asset.description")}
        right={
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("CreatePrediction:creationMode.label")}
            </span>
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => {
                  setCreationMode("manual");
                  setSelectedOrg(null);
                  setSubAssetName("");
                }}
                disabled={isEditMode}
                className={`rounded-md px-3 py-1 text-[11px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  creationMode === "manual"
                    ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/40"
                    : "text-muted-foreground hover:text-foreground/70"
                }`}
              >
                {t("CreatePrediction:creationMode.manual")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreationMode("organization");
                  setSymbol("");
                }}
                disabled={isEditMode || userOrgs.length === 0}
                title={userOrgs.length === 0 ? t("CreatePrediction:creationMode.noOrgs") : ""}
                className={`rounded-md px-3 py-1 text-[11px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  creationMode === "organization"
                    ? "bg-fuchsia-500/20 text-fuchsia-300 ring-1 ring-fuchsia-500/40"
                    : "text-muted-foreground hover:text-foreground/70"
                }`}
              >
                {t("CreatePrediction:creationMode.organization")}
              </button>
            </div>
          </div>
        }
      />
      <CardContent className="space-y-5 pt-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {creationMode === "organization" ? (
            <>
              <Field
                label={t("CreatePrediction:fields.org.label")}
                help={t("CreatePrediction:fields.org.help")}
                htmlFor="prediction-org-select"
                required
              >
                <Select
                  value={selectedOrg?.symbol || ""}
                  disabled={isEditMode}
                  onValueChange={(val) => {
                    const org = userOrgs.find((o) => o.symbol === val);
                    setSelectedOrg(org || null);
                  }}
                >
                  <SelectTrigger
                    id="prediction-org-select"
                    className="bg-card/60 border-border text-foreground"
                  >
                    <SelectValue placeholder="Select an organization...">
                      {selectedOrg?.symbol}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectGroup>
                      <SelectLabel className="text-muted-foreground text-xs">
                        {t("CreatePrediction:fields.org.selectLabel")}
                      </SelectLabel>
                      {userOrgs.map((org) => (
                        <SelectItem key={org.symbol} value={org.symbol}>
                          {org.symbol}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field
                label={t("CreatePrediction:fields.subAssetName.label")}
                help={t("CreatePrediction:fields.subAssetName.help")}
                htmlFor="prediction-subassetname"
                required
                error={symbolError}
              >
                <div className="relative">
                  <Input
                    id="prediction-subassetname"
                    placeholder={t("CreatePrediction:fields.subAssetName.placeholder")}
                    value={subAssetName}
                    type="text"
                    disabled={isEditMode}
                    className="pr-14 font-mono bg-card/60 border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-fuchsia-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    onInput={(e) => {
                      const value = e.currentTarget.value;
                      const regex = /^[a-zA-Z0-9]*$/;
                      if (regex.test(value)) {
                        setSubAssetName(value);
                      }
                    }}
                    maxLength={maxSubAssetLength}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-xs text-muted-foreground">
                    {subAssetName.length}/{maxSubAssetLength}
                  </span>
                </div>
              </Field>
            </>
          ) : (
            <>
              <Field
                label={t("AssetCommon:asset_details.symbol.header")}
                help={t("AssetCommon:asset_details.symbol.header_content")}
                htmlFor="prediction-symbol"
                required
                error={symbolError}
              >
                <div className="relative">
                    <Input
                      id="prediction-symbol"
                      placeholder={t(
                        "AssetCommon:asset_details.symbol.placeholder"
                      )}
                      value={symbol}
                      type="text"
                      disabled={isEditMode}
                      className="pr-14 font-mono bg-card/60 border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      onInput={(e) => {
                        const value = e.currentTarget.value;
                        const regex = /^[a-zA-Z0-9]*\.?[a-zA-Z0-9]*$/;
                        if (regex.test(value)) {
                          setSymbol(value);
                        }
                      }}
                      maxLength={16}
                    />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-xs text-muted-foreground">
                    {symbol.length}/16
                  </span>
                </div>
                {!isEditMode && symbolExists === true && (
                  <p className="mt-1.5 text-sm text-red-400">
                    {t("CreatePrediction:symbolAlreadyExists", "This symbol already exists on-chain. Please choose a different one.")}
                  </p>
                )}
              </Field>

              <Field
                label={t("AssetCommon:asset_details.shortName.header")}
                help={t(
                  "AssetCommon:asset_details.shortName.header_content"
                )}
                htmlFor="prediction-shortname"
                required
              >
                <Input
                  id="prediction-shortname"
                  placeholder={t(
                    "AssetCommon:asset_details.shortName.placeholder"
                  )}
                  value={shortName}
                  type="text"
                  className="bg-card/60 border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-violet-500/50"
                  onInput={(e) => setShortName(e.currentTarget.value)}
                />
              </Field>
            </>
          )}
        </div>

        {creationMode === "organization" && fullSymbol && (
          <div className={"grid gap-2 rounded-lg border border-fuchsia-500/20 bg-fuchsia-500/5 px-4 py-2.5" + (!isEditMode && symbolExists === true ? " grid-cols-2" : "")}>
            <div>
              <span className="text-xs text-muted-foreground">
                {t("CreatePrediction:fields.fullSymbol.label")}:{" "}
              </span>
              <span className="font-mono text-sm font-medium text-fuchsia-300">
                {fullSymbol}
              </span>
              <span className="ml-2 text-xs text-muted-foreground/60">
                ({fullSymbol.length}/16)
              </span>
            </div>
            {!isEditMode && symbolExists === true && (
              <div className="flex items-center justify-end">
                <p className="text-sm text-red-400">
                  {t("CreatePrediction:symbolAlreadyExists", "This symbol already exists on-chain.")}
                </p>
              </div>
            )}
          </div>
        )}

        <Field
          label={t("AssetCommon:asset_details.description.header")}
          help={t(
            "AssetCommon:asset_details.description.header_content"
          )}
          htmlFor="prediction-desc"
        >
          <Textarea
            id="prediction-desc"
            placeholder={t(
              "AssetCommon:asset_details.description.placeholder"
            )}
            value={desc}
            rows={3}
            className="bg-card/60 border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-violet-500/50"
            onInput={(e) => setDesc(e.currentTarget.value)}
          />
        </Field>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field
            label={t("AssetCommon:asset_details.max_supply.header")}
            help={t(
              "AssetCommon:asset_details.max_supply.header_content"
            )}
            htmlFor="prediction-maxsupply"
          >
            <div className="relative">
              <Input
                id="prediction-maxsupply"
                placeholder={t(
                  "AssetCommon:asset_details.max_supply.placeholder"
                )}
                value={maxSupply}
                type="text"
                inputMode="decimal"
                className="pr-14 font-mono bg-card/60 border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-violet-500/50"
                onInput={(e) => {
                  setMaxSupply(sanitizeMaxSupply(e.currentTarget.value));
                }}
              />
              {parseFloat(maxSupply) > 0 && (
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-xs text-muted-foreground">
                  {parseFloat(maxSupply).toLocaleString()}
                </span>
              )}
            </div>
          </Field>
        </div>
      </CardContent>
    </Card>
  );
}
