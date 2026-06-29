import React from "react";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";
import {
  Settings2,
  UserCheck,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Avatar } from "../Avatar.tsx";
import AccountSearch from "@/components/AccountSearch.jsx";
import Field from "./Field";
import SuffixInput from "./SuffixInput";
import ToggleCard from "./ToggleCard";

export default function ExtensionsStep({
  usr,
  enabledExtensions,
  setEnabledExtensions,
  enabledReferrerReward,
  setEnabledReferrerReward,
  referrerReward,
  setReferrerReward,
  debouncedPercent,
  enabledFeeSharingWhitelist,
  setEnabledFeeSharingWhitelist,
  feeSharingWhitelist,
  setFeeSharingWhitelist,
  whitelistMarketFeeSharingDialogOpen,
  setWhitelistMarketFeeSharingDialogOpen,
  enabledTakerFee,
  setEnabledTakerFee,
  takerFee,
  setTakerFee,
}) {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });

  return (
    <Card
      className={
        "overflow-hidden border-border bg-card/60 backdrop-blur-xl shadow-lg shadow-black/20 transition-colors " +
        (enabledExtensions ? "ring-1 ring-emerald-500/30" : "")
      }
    >
      <div className="flex items-start gap-3 border-b border-border px-6 py-4">
        <div
          className={
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ring-1 " +
            (enabledExtensions
              ? "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30"
              : "bg-foreground/5 text-muted-foreground ring-foreground/10")
          }
        >
          <Settings2 className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
              {t("CreatePrediction:sectionHeader.step", { number: 4 })} · {t("CreatePrediction:sectionHeader.optional")}
            </span>
          </div>
          <h3 className="mt-0.5 text-base font-semibold leading-tight text-foreground">
            {t("CreatePrediction:steps.extensions.title")}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t("CreatePrediction:steps.extensions.description")}
          </p>
        </div>
        <Switch
          checked={enabledExtensions}
          onCheckedChange={setEnabledExtensions}
          className="mt-1 shrink-0 data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-white/[0.12] [&>span]:bg-white"
        />
      </div>

      {enabledExtensions && (
      <CardContent className="space-y-4 pt-6">
        <ToggleCard
          icon={Settings2}
          enabled={enabledReferrerReward}
          onToggle={() => setEnabledReferrerReward(!enabledReferrerReward)}
          title={t("AssetCommon:extensions.reward_percent.disabled")}
          description={t(
            "AssetCommon:extensions.reward_percent.disabledInfo"
          )}
          enabledTitle={t("AssetCommon:extensions.reward_percent.enabled")}
          enabledDescription={t(
            "AssetCommon:extensions.reward_percent.enabledInfo"
          )}
        />
        {enabledReferrerReward && (
          <div className="ml-4 border-l-2 border-emerald-500/30 pl-4">
            <Field
              label={t(
                "AssetCommon:extensions.reward_percent.header"
              )}
              help={t(
                "AssetCommon:extensions.reward_percent.header_content"
              )}
              htmlFor="prediction-reward-percent"
            >
              <div className="max-w-[120px]">
                <SuffixInput
                  id="prediction-reward-percent"
                  suffix="%"
                  placeholder="0"
                  value={referrerReward}
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  onInput={(e) => {
                    setReferrerReward(e.currentTarget.value);
                    debouncedPercent(
                      e.currentTarget.value,
                      setReferrerReward
                    );
                  }}
                />
              </div>
            </Field>
          </div>
        )}

        <ToggleCard
          icon={UserCheck}
          enabled={enabledFeeSharingWhitelist}
          onToggle={() =>
            setEnabledFeeSharingWhitelist(!enabledFeeSharingWhitelist)
          }
          title={t(
            "AssetCommon:extensions.whitelist_market_fee_sharing.disabled"
          )}
          description={t(
            "AssetCommon:extensions.whitelist_market_fee_sharing.disabledInfo"
          )}
          enabledTitle={t(
            "AssetCommon:extensions.whitelist_market_fee_sharing.enabled"
          )}
          enabledDescription={t(
            "AssetCommon:extensions.whitelist_market_fee_sharing.enabledInfo"
          )}
        />
        {enabledFeeSharingWhitelist && (
          <div className="ml-4 space-y-3 border-l-2 border-emerald-500/30 pl-4">
            <p className="text-xs text-muted-foreground">
              {t(
                "AssetCommon:extensions.whitelist_market_fee_sharing.header_content"
              )}
            </p>
            <div className="overflow-hidden rounded-lg border border-border bg-accent/30 dark:bg-white/[0.05]">
              {feeSharingWhitelist.length > 0 && (
                <div className="max-h-[210px] divide-y divide-white/10 overflow-auto">
                  {feeSharingWhitelist.map((res, i) => (
                    <div
                      key={`fsw-${res.id}`}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-foreground/5"
                    >
                      <Avatar
                        size={32}
                        name={res.name}
                        extra="Whitelisted"
                        expression={{ eye: "normal", mouth: "open" }}
                        colors={[
                          "#92A1C6",
                          "#146A7C",
                          "#F0AB3D",
                          "#C271B4",
                          "#C20D90",
                        ]}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground">
                          {res.name}
                        </div>
                        <div className="truncate font-mono text-[10px] text-muted-foreground">
                          {res.id}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setFeeSharingWhitelist(
                            feeSharingWhitelist.filter(
                              (x) => x.id !== res.id
                            )
                          );
                        }}
                        className="text-muted-foreground hover:text-rose-400"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t border-border p-2">
                <Dialog
                  open={whitelistMarketFeeSharingDialogOpen}
                  onOpenChange={setWhitelistMarketFeeSharingDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full border-border bg-foreground/5 text-foreground/70 hover:bg-accent/40 hover:text-accent-foreground">
                      <Plus className="h-3.5 w-3.5" />
                      {t("Favourites:addUser")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[375px]">
                    <DialogHeader>
                      <DialogTitle>
                        {!usr || !usr.chain
                          ? t("Transfer:bitsharesAccountSearch")
                          : null}
                        {usr && usr.chain === "bitshares"
                          ? t("Transfer:bitsharesAccountSearchBTS")
                          : null}
                        {usr && usr.chain !== "bitshares"
                          ? t("Transfer:bitsharesAccountSearchTEST")
                          : null}
                      </DialogTitle>
                    </DialogHeader>
                    <AccountSearch
                      chain={
                        usr && usr.chain ? usr.chain : "bitshares"
                      }
                      excludedUsers={[]}
                      setChosenAccount={(_account) => {
                        if (
                          _account &&
                          !feeSharingWhitelist.find(
                            (_usr) => _usr.id === _account.id
                          )
                        ) {
                          setFeeSharingWhitelist(
                            feeSharingWhitelist && feeSharingWhitelist.length
                              ? [...feeSharingWhitelist, _account]
                              : [_account]
                          );
                        }
                        setWhitelistMarketFeeSharingDialogOpen(false);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        )}

        <ToggleCard
          icon={Settings2}
          enabled={enabledTakerFee}
          onToggle={() => setEnabledTakerFee(!enabledTakerFee)}
          title={t("AssetCommon:extensions.taker_fee_percent.disabled")}
          description={t(
            "AssetCommon:extensions.taker_fee_percent.disabledInfo"
          )}
          enabledTitle={t("AssetCommon:extensions.taker_fee_percent.enabled")}
          enabledDescription={t(
            "AssetCommon:extensions.taker_fee_percent.enabledInfo"
          )}
        />
        {enabledTakerFee && (
          <div className="ml-4 border-l-2 border-emerald-500/30 pl-4">
            <Field
              label={t("AssetCommon:extensions.taker_fee_percent.header")}
              help={t(
                "AssetCommon:extensions.taker_fee_percent.header_content"
              )}
              htmlFor="prediction-taker-fee"
            >
              <div className="max-w-[120px]">
                <SuffixInput
                  id="prediction-taker-fee"
                  suffix="%"
                  placeholder={t(
                    "AssetCommon:extensions.taker_fee_percent.placeholder"
                  )}
                  value={takerFee}
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  onInput={(e) => {
                    setTakerFee(e.currentTarget.value);
                    debouncedPercent(e.currentTarget.value, setTakerFee);
                  }}
                />
              </div>
            </Field>
          </div>
        )}
      </CardContent>
      )}
    </Card>
  );
}
