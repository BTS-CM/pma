import React, { useState } from "react";
import { List } from "react-window";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/Avatar.tsx";
import HoverInfo from "@/components/common/HoverInfo.tsx";
import DeepLinkDialog from "@/components/common/DeepLinkDialog.jsx";
import AccountSearch from "@/components/AccountSearch.jsx";

export function PricefeederDialog({ res, usr, isExpired, statusKey, t }) {
  const [pricefeederPrompt, setPricefeederPrompt] = useState(false);
  const [priceFeeders, setPriceFeeders] = useState([]);
  const [priceSearchDialog, setPriceSearchDialog] = useState(false);
  const [pricefeederDialog, setPricefeederDialog] = useState(false);

  const pricefeederRow = ({ index, style }) => {
    let feeder = priceFeeders[index];
    if (!feeder) return null;
    return (
      <div style={style} key={`acard-${feeder.id}`}>
        <Card className="ml-2 mr-2 mt-1 bg-slate-900/80 border-white/[0.08]">
          <CardHeader className="pb-3 pt-3">
            <span className="flex items-center w-full">
              <span className="flex-shrink-0">
                <Avatar size={40} name={feeder.name} extra="Borrower" expression={{ eye: "normal", mouth: "open" }} colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]} />
              </span>
              <span className="flex-grow ml-3 text-white">#{index + 1}: {feeder.name} ({feeder.id})</span>
              <span className="flex-shrink-0">
                <Button variant="outline" className="mr-2" onClick={(e) => { e.preventDefault(); setPriceFeeders(priceFeeders.filter((x) => x.id !== feeder.id)); }}>
                  ❌
                </Button>
              </span>
            </span>
          </CardHeader>
        </Card>
      </div>
    );
  };

  const canSetFeeders = !isExpired || (isExpired && statusKey === "awaiting");

  return (
    <Dialog open={pricefeederPrompt} onOpenChange={setPricefeederPrompt}>
      <DialogTrigger asChild>
        {!canSetFeeders ? (
          <Button disabled className="bg-amber-600 text-white cursor-not-allowed">{t("Predictions:pricefeeder")}</Button>
        ) : (
          <Button onClick={() => setPricefeederPrompt(true)} className="bg-amber-600 hover:bg-amber-700 text-white">{t("Predictions:pricefeeder")}</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-slate-950 border-white/[0.08] text-white shadow-2xl shadow-black/40">
        <DialogHeader>
          <DialogTitle>{t("Predictions:priceFeederDialog.title")}</DialogTitle>
          <DialogDescription>{t("Predictions:priceFeederDialog.description")}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-2">
          <HoverInfo content={t("Predictions:priceFeederDialog.priceFeedersContent")} header={t("Predictions:priceFeederDialog.priceFeedersHeader")} type="header" />
          <div className="grid grid-cols-12 mt-1">
            <span className="col-span-9 border border-white/[0.08] rounded-lg overflow-hidden">
              <div className="w-full max-h-[210px] overflow-auto">
                <List rowComponent={pricefeederRow} rowCount={priceFeeders.length} rowHeight={100} rowProps={{}} />
              </div>
            </span>
            <span className="col-span-3 ml-3 text-center">
              <Dialog open={priceSearchDialog} onOpenChange={setPriceSearchDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="ml-3 mt-1">➕ {t("Favourites:addUser")}</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[375px] bg-slate-950 border-white/[0.08] text-white shadow-2xl shadow-black/40">
                  <DialogHeader>
                    <DialogTitle>
                      {!usr || !usr.chain ? t("Transfer:bitsharesAccountSearch") : null}
                      {usr?.chain === "bitshares" ? t("Transfer:bitsharesAccountSearchBTS") : null}
                      {usr?.chain !== "bitshares" ? t("Transfer:bitsharesAccountSearchTEST") : null}
                    </DialogTitle>
                  </DialogHeader>
                  <AccountSearch
                    chain={usr?.chain || "bitshares"}
                    excludedUsers={[]}
                    setChosenAccount={(_account) => {
                      if (_account && !priceFeeders.find((_usr) => _usr.id === _account.id)) {
                        setPriceFeeders(priceFeeders?.length ? [...priceFeeders, _account] : [_account]);
                      }
                      setPriceSearchDialog(false);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button className="h-6 mt-1 w-1/2 bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setPricefeederDialog(true)}>{t("Predictions:submit")}</Button>
          </div>
        </div>
        {pricefeederDialog ? (
          <DeepLinkDialog
            operationNames={["asset_update_feed_producers"]}
            username={usr.username}
            usrChain={usr.chain}
            userID={usr.id}
            dismissCallback={setPricefeederDialog}
            key={`deeplink-pricefeeddialog-${res.id}`}
            headerText={t("Predictions:dialogContent.header_pricefeeder")}
            trxJSON={[{
              issuer: usr.id,
              asset_to_update: res.id,
              new_feed_producers: priceFeeders.map((_usr) => _usr.id),
            }]}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}