import React, {
  useState,
  useEffect,
  useSyncExternalStore,
  useMemo,
} from "react";
import { List } from "react-window";
import { useStore } from "@nanostores/react";

import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { useInitCache } from "@/nanoeffects/Init.ts";
import { createIssuedAssetsStore } from "@/nanoeffects/IssuedAssets.ts";
import { createObjectStore } from "@/nanoeffects/Objects.ts";

import { $currentUser } from "@/stores/users.ts";
import { $currentNode } from "@/stores/node.ts";

export default function IssuedAssets(properties) {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });
  const usr = useSyncExternalStore(
    $currentUser.subscribe,
    $currentUser.get,
    () => true
  );
  const currentNode = useStore($currentNode);

  const _chain = useMemo(() => {
    if (usr && usr.chain) {
      return usr.chain;
    }
    return "bitshares";
  }, [usr]);

  useInitCache(_chain ?? "bitshares", []);

  const { _assetsBTS, _assetsTEST } = properties;

  const assets = useMemo(() => {
    if (_chain && (_assetsBTS || _assetsTEST)) {
      return _chain === "bitshares" ? _assetsBTS : _assetsTEST;
    }
    return [];
  }, [_assetsBTS, _assetsTEST, _chain]);

  const [issuedAssets, setIssuedAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    async function fetching() {
      const requiredStore = createIssuedAssetsStore([
        usr.chain,
        usr.id,
        currentNode ? currentNode.url : null,
      ]);

      requiredStore.subscribe(({ data, error, loading }) => {
        if (data && !error && !loading) {
          setLoading(false);
          setIssuedAssets(data);
        }
      });
    }

    if (usr && usr.id && currentNode && currentNode.url) {
      setLoading(true);
      fetching();
    }
  }, [usr, currentNode]);

  const predictionMarkets = useMemo(() => {
    if (!issuedAssets || !issuedAssets.length) {
      return [];
    }

    return issuedAssets.filter(
      (asset) =>
        asset.bitasset_data_id &&
        asset.options.description.includes("condition") &&
        asset.options.description.includes("expiry")
    );
  }, [issuedAssets]);

  const dynamicDataIDs = useMemo(() => {
    if (!predictionMarkets) {
      return [];
    }

    return predictionMarkets.map((asset) => asset.dynamic_asset_data_id);
  }, [predictionMarkets]);

  const [dynamicData, setDynamicData] = useState([]);
  useEffect(() => {
    async function fetching() {
      const requiredStore = createObjectStore([
        usr.chain,
        JSON.stringify(dynamicDataIDs),
        currentNode ? currentNode.url : null,
      ]);

      requiredStore.subscribe(({ data, error, loading }) => {
        if (data && !error && !loading) {
          setDynamicData(data);
        }
      });
    }

    if (dynamicDataIDs && dynamicDataIDs.length) {
      fetching();
    }
  }, [dynamicDataIDs]);

  const bitassetDataIDs = useMemo(() => {
    if (!predictionMarkets) {
      return [];
    }

    const bitassetIDs = predictionMarkets
      .filter((asset) => asset.bitasset_data_id)
      .map((asset) => asset.bitasset_data_id);

    return bitassetIDs;
  }, [predictionMarkets]);

  const [bitassetData, setBitassetData] = useState([]);
  useEffect(() => {
    async function fetching() {
      const requiredStore = createObjectStore([
        usr.chain,
        JSON.stringify(bitassetDataIDs),
        currentNode ? currentNode.url : null,
      ]);

      requiredStore.subscribe(({ data, error, loading }) => {
        if (data && !error && !loading) {
          setBitassetData(data);
        }
      });
    }

    if (bitassetDataIDs && bitassetDataIDs.length) {
      fetching();
    }
  }, [bitassetDataIDs]);

  const AssetRow = ({ index, style }) => {
    const issuedAsset = predictionMarkets[index];
    if (!issuedAsset) {
      return null;
    }

    const relevantDynamicData = dynamicData.find(
      (data) => data.id === issuedAsset.dynamic_asset_data_id
    );

    const relevantBitassetData = issuedAsset.bitasset_data_id
      ? bitassetData.find((data) => data.id === issuedAsset.bitasset_data_id)
      : null;

    const description = issuedAsset.options.description;
    let parsedDescription;
    if (description && description.length) {
      let _desc;
      try {
        _desc = JSON.parse(description);
      } catch (e) {
        // description is not JSON
      }
      if (_desc && _desc.hasOwnProperty("main")) {
        parsedDescription = _desc;
      }
    }

    const [viewJSON, setViewJSON] = useState(false);
    const [json, setJSON] = useState();

    const issueThingsRow = (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button className="h-8 hover:shadow-inner" variant="outline">
              JSON
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              className="hover:shadow-inner"
              onClick={() => {
                setJSON(issuedAsset);
                setViewJSON(true);
              }}
            >
              {t("IssuedAssets:issuedAssetData")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:shadow-inner"
              onClick={() => {
                setJSON(relevantDynamicData);
                setViewJSON(true);
              }}
            >
              {t("IssuedAssets:issuedDynamicData")}
            </DropdownMenuItem>
            {relevantBitassetData ? (
              <DropdownMenuItem
                className="hover:shadow-inner"
                onClick={() => {
                  setJSON(relevantBitassetData);
                  setViewJSON(true);
                }}
              >
                {t("IssuedAssets:issuedSmartcoinData")}
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button className="h-8 hover:shadow-inner" variant="outline">
              {t("IssuedAssets:userActions")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <a
              href={`/dex/index.html?market=${issuedAsset.symbol}_${
                parsedDescription && parsedDescription.market
                  ? parsedDescription.market
                  : "BTS"
              }`}
            >
              <DropdownMenuItem className="hover:shadow-inner">
                {t("IssuedAssets:proceedToTrade")}
              </DropdownMenuItem>
            </a>

            <a
              href={`/borrow/index.html?tab=searchOffers&searchTab=borrow&searchText=${issuedAsset.symbol}`}
            >
              <DropdownMenuItem className="hover:shadow-inner">
                {t("IssuedAssets:creditBorrow")}
              </DropdownMenuItem>
            </a>

            <a href={`/lend/index.html?asset=${issuedAsset.symbol}`}>
              <DropdownMenuItem>
                {t("IssuedAssets:creditLend")}
              </DropdownMenuItem>
            </a>

            <a href={`/my-predictions/index.html?id=${issuedAsset.id}`}>
              <DropdownMenuItem className="hover:shadow-inner">
                {t("IssuedAssets:pmaBet")}
              </DropdownMenuItem>
            </a>
          </DropdownMenuContent>
        </DropdownMenu>

        {viewJSON && json ? (
          <Dialog
            open={viewJSON}
            onOpenChange={(open) => {
              setViewJSON(open);
            }}
          >
            <DialogContent className="sm:max-w-[750px] bg-white">
              <DialogHeader>
                <DialogTitle>{t("LiveBlocks:dialogContent.json")}</DialogTitle>
                <DialogDescription>
                  {t("LiveBlocks:dialogContent.jsonDescription")}
                </DialogDescription>
              </DialogHeader>
              <Textarea
                value={JSON.stringify(json, null, 2)}
                readOnly={true}
                rows={15}
              />
              <Button
                className="w-1/4 mt-2"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(json, null, 2));
                }}
              >
                {t("LiveBlocks:dialogContent.copy")}
              </Button>
            </DialogContent>
          </Dialog>
        ) : null}
      </>
    );

    return (
      <div style={{ ...style }} key={`acard-${issuedAsset.id}`}>
        <div className="hidden lg:block">
          <Card className="hidden lg:block ml-2 mr-2 cursor-pointer lg:cursor-default">
            <CardHeader className="pb-1">
              <CardTitle>
                <div className="lg:grid lg:grid-cols-2 lg:gap-5">
                  <div className="hidden lg:block pb-2">
                    {issuedAsset.symbol}
                    <br />
                    {" ("}
                    {issuedAsset.id}
                    {")"}
                  </div>
                  <div className="hidden lg:grid lg:grid-cols-3 lg:gap-3 text-right">
                    {issueThingsRow}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
        <div className="block lg:hidden">
          <Dialog>
            <DialogTrigger asChild>
              <Card className="lg:hidden ml-2 mr-2 cursor-pointer lg:cursor-default">
                <CardHeader className="pb-1">
                  <CardTitle>
                    <div className="text-sm pb-2">
                      {issuedAsset.symbol} ({issuedAsset.id})
                    </div>
                  </CardTitle>
                </CardHeader>
              </Card>
            </DialogTrigger>
            <DialogContent className="bg-white sm:max-w-[560px] lg:hidden">
              <DialogHeader>
                <DialogTitle>
                  {issuedAsset.symbol} ({issuedAsset.id})
                </DialogTitle>
                <DialogDescription>
                  {t("IssuedAssets:description")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-3 text-left justify-items-start">
                {issueThingsRow}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="container mx-auto mt-5 mb-5 w-3/4">
        <div className="grid grid-cols-1 gap-3">
          <Card>
            <CardHeader>
              <CardTitle>{t("IssuedAssets:title")}</CardTitle>
              <CardDescription>{t("IssuedAssets:description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {predictionMarkets.length > 0 ? (
                <h5 className="mb-2 text-center">
                  {t("IssuedAssets:listingPredictionMarkets", {
                    count: predictionMarkets.length,
                  })}
                </h5>
              ) : null}
              {loading ? (
                <div className="text-center mt-5">
                  {t("Market:loading")}
                </div>
              ) : null}
              {(!loading && !predictionMarkets) || !predictionMarkets.length ? (
                <Empty className="mt-5">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">❔</EmptyMedia>
                    <EmptyTitle>
                      {t("IssuedAssets:noPredictionMarkets")}
                    </EmptyTitle>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button asChild>
                      <a href="/create_prediction/index.html">
                        {t("PageHeader:createPrediction")}
                      </a>
                    </Button>
                  </EmptyContent>
                </Empty>
              ) : (
                <>
                  {dynamicData && dynamicData.length ? (
                    <>
                      <div className="w-full max-h-[500px] min-h-[500px] overflow-auto block md:hidden">
                        <List
                          rowComponent={AssetRow}
                          rowCount={predictionMarkets.length}
                          rowHeight={90}
                          rowProps={{}}
                        />
                      </div>
                      <div className="w-full max-h-[500px] min-h-[500px] overflow-auto hidden md:block">
                        <List
                          rowComponent={AssetRow}
                          rowCount={predictionMarkets.length}
                          rowHeight={90}
                          rowProps={{}}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="text-center mt-5">
                      {t("Market:loading")}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
