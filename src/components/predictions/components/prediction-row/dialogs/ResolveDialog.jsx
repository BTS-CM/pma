import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { HoverInfo } from "@/components/common/HoverInfo.tsx";
import { DeepLinkDialog } from "@/components/common/DeepLinkDialog.jsx";
import { prettifyDate } from "../../../../utils/formatters";

export function ResolveDialog({ res, usr, isExpired, expirationHours, expiration, cleanedPrediction, _backingAssetID, t }) {
  const [resolvePrompt, setResolvePrompt] = useState(false);
  const [chosenOutcome, setChosenOutcome] = useState();
  const [resolveDialog, setResolveDialog] = useState(false);

  return (
    <>
      {!isExpired ? (
        <HoverCard>
          <HoverCardTrigger>
            <Button disabled>{t("Predictions:resolve")}</Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 mt-1 bg-slate-950 border-white/[0.08] text-white z-[9999]" align="start">
            <p className="leading-6 text-sm [&:not(:first-child)]:mt-1">
              {t("Predictions:not_expired")}
              <br />
              {t("Predictions:time_till_expiration", { hours: expirationHours })}
            </p>
          </HoverCardContent>
        </HoverCard>
      ) : (
        <Dialog open={resolvePrompt} onOpenChange={setResolvePrompt}>
          <DialogTrigger asChild>
            <Button onClick={() => setResolvePrompt(true)}>{t("Predictions:resolve")}</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-slate-950 border-white/[0.08] text-white shadow-2xl shadow-black/40">
            <DialogHeader>
              <DialogTitle>{t("Predictions:resolveDialog.title")}</DialogTitle>
              <DialogDescription>{t("Predictions:resolveDialog.description")}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-2">
              <b>{t("Predictions:prediction")}</b>
              <Textarea placeholder={cleanedPrediction} value={cleanedPrediction} disabled className="max-h-[80px] mt-1" />
              <div>
                <b>{t(`Predictions:${expirationHours >= 0 ? "expiration" : "expired_at"}`)}</b>: {prettifyDate(expiration)}
              </div>
              {expirationHours >= 0 ? (
                <>{t("Predictions:time_till_expiration", { hours: expirationHours })}<br /></>
              ) : null}
              <HoverInfo content={t("Predictions:resolveDialog.outcomeContent")} header={t("Predictions:resolveDialog.outcomeHeader")} type="header" />
              <div className="grid grid-cols-2 gap-2">
                <RadioGroup
                  defaultValue={chosenOutcome ?? ""}
                  onClick={(e) => { const value = e.target.value; if (value) setChosenOutcome(value); }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="resolve-1" />
                    <Label htmlFor="resolve-1">{t("Predictions:outcome.yes")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="resolve-2" />
                    <Label htmlFor="resolve-2">{t("Predictions:outcome.no")}</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button className="h-6 mt-1 w-1/2" onClick={() => setResolveDialog(true)}>
                  {t("Predictions:submit")}
                </Button>
              </div>
            </div>
            {resolveDialog && chosenOutcome ? (
              <DeepLinkDialog
                operationNames={["asset_global_settle"]}
                username={usr.username}
                usrChain={usr.chain}
                userID={usr.id}
                dismissCallback={setResolveDialog}
                key={`deeplink-resolvedialog-${res.id}`}
                headerText={t("Predictions:dialogContent.header_resolve")}
                trxJSON={[{
                  issuer: usr.id,
                  asset_to_settle: res.id,
                  settle_price: {
                    base: { amount: 1, asset_id: res.id },
                    quote: { amount: chosenOutcome === "1" ? 1 : 0, asset_id: _backingAssetID },
                  },
                  extensions: {},
                }]}
              />
            ) : null}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}