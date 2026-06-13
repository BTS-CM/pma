import React, { useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ExclamationTriangleIcon, CalendarIcon } from "@radix-ui/react-icons";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import HoverInfo from "@/components/common/HoverInfo.tsx";
import DeepLinkDialog from "@/components/common/DeepLinkDialog.jsx";
import { assetAmountRegex, blockchainFloat } from "@/lib/common.js";
import { cn } from "@/lib/utils";

function ExpirySelector({ expiryType, setExpiryType, date, setDate, t }) {
  return (
    <>
      <Select
        onValueChange={(selectedExpiry) => {
          setExpiryType(selectedExpiry);
          const oneHour = 60 * 60 * 1000;
          const oneDay = 24 * oneHour;
          if (selectedExpiry !== "specific" && selectedExpiry !== "fkill") {
            let expiryDate;
            if (selectedExpiry === "1hr") expiryDate = new Date(Date.now() + oneHour);
            else if (selectedExpiry === "12hr") expiryDate = new Date(Date.now() + oneHour * 12);
            else if (selectedExpiry === "24hr") expiryDate = new Date(Date.now() + oneDay);
            else if (selectedExpiry === "7d") expiryDate = new Date(Date.now() + oneDay * 7);
            else if (selectedExpiry === "30d") expiryDate = new Date(Date.now() + oneDay * 30);
            if (expiryDate) setDate(expiryDate);
          } else if (selectedExpiry === "fkill") {
            setDate(new Date(Date.now() + oneDay));
          }
        }}
      >
        <SelectTrigger className="mb-3 mt-1 w-1/2"><SelectValue placeholder="1hr" /></SelectTrigger>
        <SelectContent className="bg-slate-950 border-white/[0.08] shadow-2xl shadow-black/40">
          <SelectItem value="1hr">{t("LimitOrderCard:expiry.1hr")}</SelectItem>
          <SelectItem value="12hr">{t("LimitOrderCard:expiry.12hr")}</SelectItem>
          <SelectItem value="24hr">{t("LimitOrderCard:expiry.24hr")}</SelectItem>
          <SelectItem value="7d">{t("LimitOrderCard:expiry.7d")}</SelectItem>
          <SelectItem value="30d">{t("LimitOrderCard:expiry.30d")}</SelectItem>
          <SelectItem value="specific">{t("LimitOrderCard:expiry.specific")}</SelectItem>
          <SelectItem value="fkill">{t("LimitOrderCard:expiry.fkill")}</SelectItem>
        </SelectContent>
      </Select>
      {expiryType === "specific" ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !date && "text-white/40")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>{t("LimitOrderCard:expiry.pickDate")}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(e) => {
                if (new Date(e) < new Date()) {
                  setDate(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000));
                  return;
                }
                setDate(e);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      ) : null}
      {expiryType === "fkill" ? t("LimitOrderCard:expiry.fkillDescription") : null}
      {expiryType !== "specific" && expiryType !== "fkill" ? t("LimitOrderCard:expiry.generalDescription", { expiryType }) : null}
    </>
  );
}

export function BuyDialog({ res, usr, humanReadableBackingAssetBalance, _backingAssetID, _backingPrecision, market, t }) {
  const [buyPrompt, setBuyPrompt] = useState(false);
  const [buyAmount, setBuyAmount] = useState(0);
  const [buyDialog, setBuyDialog] = useState(false);
  const [expiryType, setExpiryType] = useState("1hr");
  const [date, setDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

  return (
    <Dialog open={buyPrompt} onOpenChange={setBuyPrompt}>
      <DialogTrigger asChild>
        <Button onClick={() => setBuyPrompt(true)}>{t("Predictions:buy")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-slate-950 border-white/[0.08] text-white shadow-2xl shadow-black/40">
        <DialogHeader>
          <DialogTitle>{t("Predictions:buyDialog.title")}</DialogTitle>
          <DialogDescription>{t("Predictions:buyDialog.description")}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-2">
          <div className="grid grid-cols-2 gap-2">
            <HoverInfo content={t("Predictions:issueDialog.qtyContent")} header={t("Predictions:issueDialog.qtyHeader")} type="header" />
            <Button className="h-6 mt-1 ml-3 hover:shadow-md" onClick={() => setBuyAmount(humanReadableBackingAssetBalance || 0)} variant="outline">
              {t("Predictions:issueDialog.balance")}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" value={buyAmount} min={1} step={1} onInput={(e) => { if (assetAmountRegex({ precision: res.precision }).test(e.currentTarget.value)) setBuyAmount(e.currentTarget.value); }} />
            <Input type="text" value={`${res.backingAsset.symbol} (${res.backingAsset.id})`} disabled />
          </div>
          <div>
            <HoverInfo content={t("Predictions:issueDialog.receivingContent")} header={t("Predictions:issueDialog.receivingHeader")} type="header" />
            <div className="grid grid-cols-1 gap-2">
              <Input type="text" value={`${buyAmount} ${res.symbol} (${res.id})`} disabled className="w-1/2" />
            </div>
          </div>
          <div>
            <HoverInfo content={t("Predictions:sellDialog.expiryContent")} header={t("Predictions:sellDialog.expiryHeader")} type="header" />
            <ExpirySelector expiryType={expiryType} setExpiryType={setExpiryType} date={date} setDate={setDate} t={t} />
          </div>
        </div>
        <div>
          <div className="grid grid-cols-2 gap-2">
            <Button className="h-6 mt-1 w-1/2" onClick={() => setBuyDialog(true)}>{t("Predictions:submit")}</Button>
            {buyAmount > humanReadableBackingAssetBalance ? (
              <Badge variant="destructive"><ExclamationTriangleIcon className="mr-2" /> {t("Predictions:insufficient_funds")}</Badge>
            ) : null}
          </div>
        </div>
        {buyDialog ? (
          <DeepLinkDialog
            operationNames={["limit_order_create"]}
            username={usr.username}
            usrChain={usr.chain}
            userID={usr.id}
            dismissCallback={setBuyDialog}
            key={`deeplink-buydialog-${res.id}`}
            headerText={t("Predictions:dialogContent.header_buy")}
            trxJSON={[{
              seller: usr.id,
              amount_to_sell: { amount: blockchainFloat(buyAmount, _backingPrecision).toFixed(0), asset_id: _backingAssetID },
              min_to_receive: { amount: blockchainFloat(buyAmount, res.precision).toFixed(0), asset_id: res.id },
              expiration: date,
              fill_or_kill: expiryType === "fkill",
              extensions: {},
            }]}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}