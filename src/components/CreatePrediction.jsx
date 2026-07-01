import React from "react";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";
import { Sparkles, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

import DeepLinkDialog from "@/components/common/DeepLinkDialog.jsx";

import usePredictionForm from "@/hooks/usePredictionForm.js";

import AssetIdentityStep from "./create-prediction/AssetIdentityStep";
import PredictionDetailsStep from "./create-prediction/PredictionDetailsStep";
import NFTSection from "./create-prediction/NFTSection";
import ExtensionsStep from "./create-prediction/ExtensionsStep";
import PermissionsStep from "./create-prediction/PermissionsStep";
import AuthorizationStep from "./create-prediction/AuthorizationStep";
import SummaryStep from "./create-prediction/SummaryStep";

export default function Prediction(properties) {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });

  const form = usePredictionForm(properties);

  const {
    usr,
    _chain,
    isEditMode,
    feeSchedule,
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
    effectiveUserOrgs: userOrgs,
    desc,
    setDesc,
    condition,
    setCondition,
    commission,
    setCommission,
    sanitizeCommission,
    commissionNum,
    commissionError,
    backingAsset,
    backingAssetData,
    date,
    setDate,
    isExpiredInEditMode,
    isResolvedInEditMode,
    category,
    setCategory,
    subcategory,
    setSubcategory,
    enabledNFT,
    setEnabledNFT,
    nftMedia,
    setNFTMedia,
    newMediaType,
    setNewMediaType,
    newMediaUrl,
    setNewMediaUrl,
    title,
    setTitle,
    artist,
    setArtist,
    narrative,
    setNarrative,
    tags,
    setTags,
    type,
    setType,
    attestation,
    setAttestation,
    acknowledgements,
    setAcknowledgements,
    holderLicense,
    setHolderLicense,
    license,
    setLicense,
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
    whitelistAuthorities, setWhitelistAuthorities,
    blacklistAuthorities, setBlacklistAuthorities,
    whitelistAuthorityDialogOpen, setWhitelistAuthorityDialogOpen,
    blacklistAuthorityDialogOpen, setBlacklistAuthorityDialogOpen,
    description,
    trx,
    hasExpiredWithPrize,
    daysUntil,
    isFormValid,
    estimatedFee,
    feeCalculating,
    showDialog, setShowDialog,
    expiryWarningDialog, setExpiryWarningDialog,
    originalExpiryRef,
    summaryRef,
  } = form;

  return (
    <div className="min-h-screen pb-16">
      {/* Page header */}
      <div className="container mx-auto max-w-4xl px-4 pt-6 sm:pt-8">
        <div className="rounded-xl border border-border bg-card/60 backdrop-blur-xl px-6 py-5 shadow-lg shadow-black/20 ring-1 dark:ring-white/[0.06] ring-border">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400 shadow-md shadow-violet-500/10 ring-1 ring-violet-500/30">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {isEditMode ? t("CreatePrediction:card.updateTitle") : t("CreatePrediction:card.title")}
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {isEditMode ? t("CreatePrediction:card.updateDescription") : t("CreatePrediction:card.description")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form sections */}
      <div className="container mx-auto max-w-4xl space-y-6 px-4 py-6">
        <AssetIdentityStep
          isEditMode={isEditMode}
          creationMode={creationMode}
          setCreationMode={setCreationMode}
          selectedOrg={selectedOrg}
          setSelectedOrg={setSelectedOrg}
          subAssetName={subAssetName}
          setSubAssetName={setSubAssetName}
          symbol={symbol}
          setSymbol={setSymbol}
          symbolError={symbolError}
          symbolExists={symbolExists}
          shortName={shortName}
          setShortName={setShortName}
          maxSupply={maxSupply}
          setMaxSupply={setMaxSupply}
          sanitizeMaxSupply={sanitizeMaxSupply}
          fullSymbol={fullSymbol}
          maxSubAssetLength={maxSubAssetLength}
          userOrgs={userOrgs}
          desc={desc}
          setDesc={setDesc}
        />

        <PredictionDetailsStep
          isEditMode={isEditMode}
          condition={condition}
          setCondition={setCondition}
          commission={commission}
          setCommission={setCommission}
          sanitizeCommission={sanitizeCommission}
          backingAsset={backingAsset}
          backingAssetData={backingAssetData}
          date={date}
          setDate={setDate}
          isExpiredInEditMode={isExpiredInEditMode}
          isResolvedInEditMode={isResolvedInEditMode}
          commissionError={commissionError}
          category={category}
          setCategory={setCategory}
          subcategory={subcategory}
          setSubcategory={setSubcategory}
        />

        <NFTSection
          enabledNFT={enabledNFT}
          setEnabledNFT={setEnabledNFT}
          nftMedia={nftMedia}
          setNFTMedia={setNFTMedia}
          newMediaType={newMediaType}
          setNewMediaType={setNewMediaType}
          newMediaUrl={newMediaUrl}
          setNewMediaUrl={setNewMediaUrl}
          title={title}
          setTitle={setTitle}
          artist={artist}
          setArtist={setArtist}
          narrative={narrative}
          setNarrative={setNarrative}
          tags={tags}
          setTags={setTags}
          type={type}
          setType={setType}
          attestation={attestation}
          setAttestation={setAttestation}
          acknowledgements={acknowledgements}
          setAcknowledgements={setAcknowledgements}
          holderLicense={holderLicense}
          setHolderLicense={setHolderLicense}
          license={license}
          setLicense={setLicense}
        />

        <ExtensionsStep
          usr={usr}
          enabledExtensions={enabledExtensions}
          setEnabledExtensions={setEnabledExtensions}
          enabledReferrerReward={enabledReferrerReward}
          setEnabledReferrerReward={setEnabledReferrerReward}
          referrerReward={referrerReward}
          setReferrerReward={setReferrerReward}
          debouncedPercent={debouncedPercent}
          enabledFeeSharingWhitelist={enabledFeeSharingWhitelist}
          setEnabledFeeSharingWhitelist={setEnabledFeeSharingWhitelist}
          feeSharingWhitelist={feeSharingWhitelist}
          setFeeSharingWhitelist={setFeeSharingWhitelist}
          whitelistMarketFeeSharingDialogOpen={whitelistMarketFeeSharingDialogOpen}
          setWhitelistMarketFeeSharingDialogOpen={setWhitelistMarketFeeSharingDialogOpen}
          enabledTakerFee={enabledTakerFee}
          setEnabledTakerFee={setEnabledTakerFee}
          takerFee={takerFee}
          setTakerFee={setTakerFee}
        />

        <PermissionsStep
          enabledPermissions={enabledPermissions}
          setEnabledPermissions={setEnabledPermissions}
          permChargeMarketFee={permChargeMarketFee} setPermChargeMarketFee={setPermChargeMarketFee}
          permWhiteList={permWhiteList} setPermWhiteList={setPermWhiteList}
          permOverrideAuthority={permOverrideAuthority} setPermOverrideAuthority={setPermOverrideAuthority}
          permTransferRestricted={permTransferRestricted} setPermTransferRestricted={setPermTransferRestricted}
          permDisableForceSettle={permDisableForceSettle} setPermDisableForceSettle={setPermDisableForceSettle}
          permGlobalSettle={permGlobalSettle} setPermGlobalSettle={setPermGlobalSettle}
          permDisableConfidential={permDisableConfidential} setPermDisableConfidential={setPermDisableConfidential}
          permWitnessFedAsset={permWitnessFedAsset} setPermWitnessFedAsset={setPermWitnessFedAsset}
          permCommitteeFedAsset={permCommitteeFedAsset} setPermCommitteeFedAsset={setPermCommitteeFedAsset}
          permLockMaxSupply={permLockMaxSupply} setPermLockMaxSupply={setPermLockMaxSupply}
          permDisableNewSupply={permDisableNewSupply} setPermDisableNewSupply={setPermDisableNewSupply}
          flagChargeMarketFee={flagChargeMarketFee} setFlagChargeMarketFee={setFlagChargeMarketFee}
          flagWhiteList={flagWhiteList} setFlagWhiteList={setFlagWhiteList}
          flagOverrideAuthority={flagOverrideAuthority} setFlagOverrideAuthority={setFlagOverrideAuthority}
          flagTransferRestricted={flagTransferRestricted} setFlagTransferRestricted={setFlagTransferRestricted}
          flagDisableForceSettle={flagDisableForceSettle} setFlagDisableForceSettle={setFlagDisableForceSettle}
          flagDisableConfidential={flagDisableConfidential} setFlagDisableConfidential={setFlagDisableConfidential}
          flagWitnessFedAsset={flagWitnessFedAsset} setFlagWitnessFedAsset={setFlagWitnessFedAsset}
          flagCommitteeFedAsset={flagCommitteeFedAsset} setFlagCommitteeFedAsset={setFlagCommitteeFedAsset}
          flagLockMaxSupply={flagLockMaxSupply} setFlagLockMaxSupply={setFlagLockMaxSupply}
          flagDisableNewSupply={flagDisableNewSupply} setFlagDisableNewSupply={setFlagDisableNewSupply}
          lockedPermissions={lockedPermissions}
        />

        <AuthorizationStep
          usr={usr}
          flagWhiteList={flagWhiteList}
          whitelistAuthorities={whitelistAuthorities}
          setWhitelistAuthorities={setWhitelistAuthorities}
          blacklistAuthorities={blacklistAuthorities}
          setBlacklistAuthorities={setBlacklistAuthorities}
          whitelistAuthorityDialogOpen={whitelistAuthorityDialogOpen}
          setWhitelistAuthorityDialogOpen={setWhitelistAuthorityDialogOpen}
          blacklistAuthorityDialogOpen={blacklistAuthorityDialogOpen}
          setBlacklistAuthorityDialogOpen={setBlacklistAuthorityDialogOpen}
        />

        <SummaryStep
          summaryRef={summaryRef}
          isEditMode={isEditMode}
          _chain={_chain}
          feeSchedule={feeSchedule}
          fullSymbol={fullSymbol}
          shortName={shortName}
          condition={condition}
          backingAsset={backingAsset}
          backingAssetData={backingAssetData}
          maxSupply={maxSupply}
          commissionNum={commissionNum}
          date={date}
          daysUntil={daysUntil}
          category={category}
          subcategory={subcategory}
          isFormValid={isFormValid}
          estimatedFee={estimatedFee}
          feeCalculating={feeCalculating}
          hasExpiredWithPrize={hasExpiredWithPrize}
          setShowDialog={setShowDialog}
          setExpiryWarningDialog={setExpiryWarningDialog}
          originalExpiryRef={originalExpiryRef}
        />
      </div>

      {/* Expiry edit warning dialog */}
      {expiryWarningDialog ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setExpiryWarningDialog(false)}>
          <div className="mx-4 w-full max-w-md rounded-xl border border-amber-500/30 bg-card p-6 shadow-2xl dark:shadow-black/40 shadow-black/15" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{t("CreatePrediction:expiryWarning.title")}</h3>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-foreground/70">{t("CreatePrediction:expiryWarning.description")}</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" className="border-border bg-foreground/5 text-foreground/70 hover:bg-accent/40 hover:text-accent-foreground" onClick={() => setExpiryWarningDialog(false)}>
                {t("CreatePrediction:expiryWarning.cancel")}
              </Button>
              <Button className="bg-amber-600 hover:bg-amber-700 text-foreground" onClick={() => { setExpiryWarningDialog(false); setShowDialog(true); }}>
                {t("CreatePrediction:expiryWarning.confirm")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {showDialog ? (
        <DeepLinkDialog
          operationNames={[isEditMode ? "asset_update" : "asset_create"]}
          username={usr.username}
          usrChain={usr.chain}
          userID={usr.id}
          dismissCallback={setShowDialog}
          key={`${isEditMode ? "Updating" : "Creating"}PMA-${usr.id}-${fullSymbol}`}
          headerText={t(isEditMode ? "CreatePrediction:dialogContent.updateHeaderText" : "CreatePrediction:dialogContent.headerText", {
            symbol: fullSymbol,
          })}
          trxJSON={[trx]}
        />
      ) : null}
    </div>
  );
}
