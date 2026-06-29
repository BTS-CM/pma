import React from "react";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";
import { ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

import AssetPermission from "@/components/common/AssetPermission.tsx";
import AssetFlag from "@/components/common/AssetFlag.tsx";

export default function PermissionsStep({
  enabledPermissions,
  setEnabledPermissions,
  permChargeMarketFee, setPermChargeMarketFee,
  permWhiteList, setPermWhiteList,
  permOverrideAuthority, setPermOverrideAuthority,
  permTransferRestricted, setPermTransferRestricted,
  permDisableForceSettle, setPermDisableForceSettle,
  permGlobalSettle, setPermGlobalSettle,
  permDisableConfidential, setPermDisableConfidential,
  permWitnessFedAsset, setPermWitnessFedAsset,
  permCommitteeFedAsset, setPermCommitteeFedAsset,
  permLockMaxSupply, setPermLockMaxSupply,
  permDisableNewSupply, setPermDisableNewSupply,
  flagChargeMarketFee, setFlagChargeMarketFee,
  flagWhiteList, setFlagWhiteList,
  flagOverrideAuthority, setFlagOverrideAuthority,
  flagTransferRestricted, setFlagTransferRestricted,
  flagDisableForceSettle, setFlagDisableForceSettle,
  flagDisableConfidential, setFlagDisableConfidential,
  flagWitnessFedAsset, setFlagWitnessFedAsset,
  flagCommitteeFedAsset, setFlagCommitteeFedAsset,
  flagLockMaxSupply, setFlagLockMaxSupply,
  flagDisableNewSupply, setFlagDisableNewSupply,
  lockedPermissions,
}) {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });

  return (
    <Card
      className={
        "overflow-hidden border-border bg-card/60 backdrop-blur-xl shadow-lg shadow-black/20 transition-colors " +
        (enabledPermissions ? "ring-1 ring-rose-500/30" : "")
      }
    >
      <div className="flex items-start gap-3 border-b border-border px-6 py-4">
        <div
          className={
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ring-1 " +
            (enabledPermissions
              ? "bg-rose-500/15 text-rose-400 ring-rose-500/30"
              : "bg-foreground/5 text-muted-foreground ring-foreground/10")
          }
        >
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-400">
              {t("CreatePrediction:sectionHeader.step", { number: 5 })} · {t("CreatePrediction:sectionHeader.optional")}
            </span>
          </div>
          <h3 className="mt-0.5 text-base font-semibold leading-tight text-foreground">
            {t("CreatePrediction:steps.permissions.title")}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t("CreatePrediction:steps.permissions.description")}
          </p>
        </div>
        <Switch
          checked={enabledPermissions}
          onCheckedChange={setEnabledPermissions}
          className="mt-1 shrink-0 data-[state=checked]:bg-rose-500 data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-white/[0.12] [&>span]:bg-white"
        />
      </div>

      {enabledPermissions && (
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("AssetCommon:permissions.header")}
            </h4>
            <div className="rounded-lg border border-border bg-accent/30 dark:bg-white/[0.05] [&_button[role=checkbox]]:border-foreground/30 [&_button[role=checkbox]]:bg-foreground/5 [&_button[role=checkbox][data-state=checked]]:bg-violet-500 [&_button[role=checkbox][data-state=checked]]:border-violet-500 [&_button[role=checkbox][data-state=checked]]:text-foreground">
              <AssetPermission alreadyDisabled={lockedPermissions.charge_market_fee} id="charge_market_fee"
                allowedText={t("AssetCommon:permissions.charge_market_fee.about")} enabledInfo={t("AssetCommon:permissions.charge_market_fee.enabledInfo")}
                disabledText={t("AssetCommon:permissions.charge_market_fee.about")} disabledInfo={t("AssetCommon:permissions.charge_market_fee.disabledInfo")}
                permission={permChargeMarketFee} setPermission={setPermChargeMarketFee} flag={flagChargeMarketFee} setFlag={setFlagChargeMarketFee} />
              <AssetPermission alreadyDisabled={lockedPermissions.white_list} id="white_list"
                allowedText={t("AssetCommon:permissions.white_list.about")} enabledInfo={t("AssetCommon:permissions.white_list.enabledInfo")}
                disabledText={t("AssetCommon:permissions.white_list.about")} disabledInfo={t("AssetCommon:permissions.white_list.disabledInfo")}
                permission={permWhiteList} setPermission={setPermWhiteList} flag={flagWhiteList} setFlag={setFlagWhiteList} />
              <AssetPermission alreadyDisabled={lockedPermissions.override_authority} id="override_authority"
                allowedText={t("AssetCommon:permissions.override_authority.about")} enabledInfo={t("AssetCommon:permissions.override_authority.enabledInfo")}
                disabledText={t("AssetCommon:permissions.override_authority.about")} disabledInfo={t("AssetCommon:permissions.override_authority.disabledInfo")}
                permission={permOverrideAuthority} setPermission={setPermOverrideAuthority} flag={flagOverrideAuthority} setFlag={setFlagOverrideAuthority} />
              <AssetPermission alreadyDisabled={lockedPermissions.transfer_restricted} id="transfer_restricted"
                allowedText={t("AssetCommon:permissions.transfer_restricted.about")} enabledInfo={t("AssetCommon:permissions.transfer_restricted.enabledInfo")}
                disabledText={t("AssetCommon:permissions.transfer_restricted.about")} disabledInfo={t("AssetCommon:permissions.transfer_restricted.disabledInfo")}
                permission={permTransferRestricted} setPermission={setPermTransferRestricted} flag={flagTransferRestricted} setFlag={setFlagTransferRestricted} />
              
              <AssetPermission alreadyDisabled={lockedPermissions.disable_confidential} id="disable_confidential"
                allowedText={t("AssetCommon:permissions.disable_confidential.about")} enabledInfo={t("AssetCommon:permissions.disable_confidential.enabledInfo")}
                disabledText={t("AssetCommon:permissions.disable_confidential.about")} disabledInfo={t("AssetCommon:permissions.disable_confidential.disabledInfo")}
                permission={permDisableConfidential} setPermission={setPermDisableConfidential} flag={flagDisableConfidential} setFlag={setFlagDisableConfidential} />
              <AssetPermission alreadyDisabled={lockedPermissions.witness_fed_asset} id="witness_fed_asset"
                allowedText={t("AssetCommon:permissions.witness_fed_asset.about")} enabledInfo={t("AssetCommon:permissions.witness_fed_asset.enabledInfo")}
                disabledText={t("AssetCommon:permissions.witness_fed_asset.about")} disabledInfo={t("AssetCommon:permissions.witness_fed_asset.disabledInfo")}
                permission={permWitnessFedAsset} setPermission={setPermWitnessFedAsset} flag={flagWitnessFedAsset} setFlag={setFlagWitnessFedAsset} />
              <AssetPermission alreadyDisabled={lockedPermissions.committee_fed_asset} id="committee_fed_asset"
                allowedText={t("AssetCommon:permissions.committee_fed_asset.about")} enabledInfo={t("AssetCommon:permissions.committee_fed_asset.enabledInfo")}
                disabledText={t("AssetCommon:permissions.committee_fed_asset.about")} disabledInfo={t("AssetCommon:permissions.committee_fed_asset.disabledInfo")}
                permission={permCommitteeFedAsset} setPermission={setPermCommitteeFedAsset} flag={flagCommitteeFedAsset} setFlag={setFlagCommitteeFedAsset} />
              <AssetPermission alreadyDisabled={lockedPermissions.lock_max_supply} id="lock_max_supply"
                allowedText={t("AssetCommon:permissions.lock_max_supply.about")} enabledInfo={t("AssetCommon:permissions.lock_max_supply.enabledInfo")}
                disabledText={t("AssetCommon:permissions.lock_max_supply.about")} disabledInfo={t("AssetCommon:permissions.lock_max_supply.disabledInfo")}
                permission={permLockMaxSupply} setPermission={setPermLockMaxSupply} flag={flagLockMaxSupply} setFlag={setFlagLockMaxSupply} />
              <AssetPermission alreadyDisabled={lockedPermissions.disable_new_supply} id="disable_new_supply"
                allowedText={t("AssetCommon:permissions.disable_new_supply.about")} enabledInfo={t("AssetCommon:permissions.disable_new_supply.enabledInfo")}
                disabledText={t("AssetCommon:permissions.disable_new_supply.about")} disabledInfo={t("AssetCommon:permissions.disable_new_supply.disabledInfo")}
                permission={permDisableNewSupply} setPermission={setPermDisableNewSupply} flag={flagDisableNewSupply} setFlag={setFlagDisableNewSupply} />
              <AssetPermission alreadyDisabled={lockedPermissions.disable_force_settle} id="disable_force_settle" forceDisabled={true}
                allowedText={t("AssetCommon:permissions.disable_force_settle.about")} enabledInfo={t("AssetCommon:permissions.disable_force_settle.enabledInfo")}
                disabledText={t("AssetCommon:permissions.disable_force_settle.about")} disabledInfo={t("AssetCommon:permissions.disable_force_settle.disabledInfo")}
                permission={permDisableForceSettle} setPermission={setPermDisableForceSettle} flag={flagDisableForceSettle} setFlag={setFlagDisableForceSettle} />
              <AssetPermission alreadyDisabled={lockedPermissions.global_settle} id="global_settle" forceDisabled={true}
                allowedText={t("AssetCommon:permissions.global_settle.about")} enabledInfo={t("AssetCommon:permissions.global_settle.enabledInfo")}
                disabledText={t("AssetCommon:permissions.global_settle.about")} disabledInfo={t("AssetCommon:permissions.global_settle.disabledInfo")}
                permission={permGlobalSettle} setPermission={setPermGlobalSettle} flag={false} setFlag={() => {}} />
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("AssetCommon:flags.header")}
            </h4>
            <div className="rounded-lg border border-border bg-accent/30 dark:bg-white/[0.05] [&_button[role=checkbox]]:border-foreground/30 [&_button[role=checkbox]]:bg-foreground/5 [&_button[role=checkbox][data-state=checked]]:bg-violet-500 [&_button[role=checkbox][data-state=checked]]:border-violet-500 [&_button[role=checkbox][data-state=checked]]:text-foreground">
              <AssetFlag alreadyDisabled={lockedPermissions.charge_market_fee} id="charge_market_fee_flag" permission={permChargeMarketFee}
                allowedText={t("AssetCommon:flags.charge_market_fee.about")} enabledInfo={t("AssetCommon:flags.charge_market_fee.enabledInfo")}
                disabledText={t("AssetCommon:flags.charge_market_fee.about")} disabledInfo={t("AssetCommon:flags.charge_market_fee.disabledInfo")}
                flag={flagChargeMarketFee} setFlag={setFlagChargeMarketFee} />
              <AssetFlag alreadyDisabled={lockedPermissions.white_list} id="white_list_flag" permission={permWhiteList}
                allowedText={t("AssetCommon:flags.white_list.about")} enabledInfo={t("AssetCommon:flags.white_list.enabledInfo")}
                disabledText={t("AssetCommon:flags.white_list.about")} disabledInfo={t("AssetCommon:flags.white_list.disabledInfo")}
                flag={flagWhiteList} setFlag={setFlagWhiteList} />
              <AssetFlag alreadyDisabled={lockedPermissions.override_authority} id="override_authority_flag" permission={permOverrideAuthority}
                allowedText={t("AssetCommon:flags.override_authority.about")} enabledInfo={t("AssetCommon:flags.override_authority.enabledInfo")}
                disabledText={t("AssetCommon:flags.override_authority.about")} disabledInfo={t("AssetCommon:flags.override_authority.disabledInfo")}
                flag={flagOverrideAuthority} setFlag={setFlagOverrideAuthority} />
              <AssetFlag alreadyDisabled={lockedPermissions.transfer_restricted} id="transfer_restricted_flag" permission={permTransferRestricted}
                allowedText={t("AssetCommon:flags.transfer_restricted.about")} enabledInfo={t("AssetCommon:flags.transfer_restricted.enabledInfo")}
                disabledText={t("AssetCommon:flags.transfer_restricted.about")} disabledInfo={t("AssetCommon:flags.transfer_restricted.disabledInfo")}
                flag={flagTransferRestricted} setFlag={setFlagTransferRestricted} />
              <AssetFlag alreadyDisabled={lockedPermissions.disable_confidential} id="disable_confidential_flag" permission={permDisableConfidential}
                allowedText={t("AssetCommon:flags.disable_confidential.about")} enabledInfo={t("AssetCommon:flags.disable_confidential.enabledInfo")}
                disabledText={t("AssetCommon:flags.disable_confidential.about")} disabledInfo={t("AssetCommon:flags.disable_confidential.disabledInfo")}
                flag={flagDisableConfidential} setFlag={setFlagDisableConfidential} />
              <AssetFlag alreadyDisabled={lockedPermissions.witness_fed_asset} id="witness_fed_asset_flag" permission={permWitnessFedAsset}
                allowedText={t("AssetCommon:flags.witness_fed_asset.about")} enabledInfo={t("AssetCommon:flags.witness_fed_asset.enabledInfo")}
                disabledText={t("AssetCommon:flags.witness_fed_asset.about")} disabledInfo={t("AssetCommon:flags.witness_fed_asset.disabledInfo")}
                flag={flagWitnessFedAsset} setFlag={setFlagWitnessFedAsset} />
              <AssetFlag alreadyDisabled={lockedPermissions.committee_fed_asset} id="committee_fed_asset_flag" permission={permCommitteeFedAsset}
                allowedText={t("AssetCommon:flags.committee_fed_asset.about")} enabledInfo={t("AssetCommon:flags.committee_fed_asset.enabledInfo")}
                disabledText={t("AssetCommon:flags.committee_fed_asset.about")} disabledInfo={t("AssetCommon:flags.committee_fed_asset.disabledInfo")}
                flag={flagCommitteeFedAsset} setFlag={setFlagCommitteeFedAsset} />
              <AssetFlag alreadyDisabled={lockedPermissions.lock_max_supply} id="lock_max_supply_flag" permission={!permLockMaxSupply}
                allowedText={t("AssetCommon:flags.lock_max_supply.about")} enabledInfo={t("AssetCommon:flags.lock_max_supply.enabledInfo")}
                disabledText={t("AssetCommon:flags.lock_max_supply.about")} disabledInfo={t("AssetCommon:flags.lock_max_supply.disabledInfo")}
                flag={flagLockMaxSupply} setFlag={setFlagLockMaxSupply} />
              <AssetFlag alreadyDisabled={lockedPermissions.disable_new_supply} id="disable_new_supply_flag" permission={!permDisableNewSupply}
                allowedText={t("AssetCommon:flags.disable_new_supply.about")} enabledInfo={t("AssetCommon:flags.disable_new_supply.enabledInfo")}
                disabledText={t("AssetCommon:flags.disable_new_supply.about")} disabledInfo={t("AssetCommon:flags.disable_new_supply.disabledInfo")}
                flag={flagDisableNewSupply} setFlag={setFlagDisableNewSupply} />
              
              <AssetFlag alreadyDisabled={lockedPermissions.disable_force_settle} id="disable_force_settle_flag" permission={permDisableForceSettle}
                allowedText={t("AssetCommon:flags.disable_force_settle.about")} enabledInfo={t("AssetCommon:flags.disable_force_settle.enabledInfo")}
                disabledText={t("AssetCommon:flags.disable_force_settle.about")} disabledInfo={t("AssetCommon:flags.disable_force_settle.disabledInfo")}
                flag={flagDisableForceSettle} setFlag={setFlagDisableForceSettle} />
            </div>
          </div>
        </div>
      </CardContent>
      )}
    </Card>
  );
}
