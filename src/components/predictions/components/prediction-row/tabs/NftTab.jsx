import React from "react";
import { NftHero, NftThumbStrip, StatBlock, LongText, MonoBlock } from "../../ui";
import { ImageIcon } from "@radix-ui/react-icons";
import { ExternalLink as ExternalLinkIcon } from "lucide-react";
import { ipfsUrl } from "@/lib/common.js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DOMPurify from "dompurify";

export function NftTab({ res, _desc, nftImages, heroIndex, setHeroIndex, ipfsGateway, t }) {
  if (!nftImages || !nftImages.length) {
    return (
      <div className="flex items-center justify-center h-32 rounded-md border border-dashed border-border dark:border-white/20 text-muted-foreground text-sm">
        <ImageIcon className="mr-2 h-4 w-4" />
        {t("Predictions:nft.noImage")}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      <div>
        <NftHero images={nftImages} heroIndex={heroIndex} ipfsGateway={ipfsGateway} />
        {nftImages.length > 1 ? (
          <NftThumbStrip images={nftImages} heroIndex={heroIndex} setHeroIndex={setHeroIndex} ipfsGateway={ipfsGateway} />
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {_desc.nft_object.title ? <StatBlock label={t("Predictions:nft.title")} value={_desc.nft_object.title} /> : null}
        {_desc.nft_object.artist ? <StatBlock label={t("Predictions:nft.artist")} value={_desc.nft_object.artist} /> : null}
        {_desc.nft_object.type ? (
          <StatBlock label={t("Predictions:nft.type")} value={
            <span className="inline-flex items-center rounded-full bg-accent/50 border border-border px-2 py-0.5 text-xs font-medium text-foreground/70">
              {_desc.nft_object.type}
            </span>
          } />
        ) : null}
        {_desc.nft_object.encoding ? <StatBlock label={t("Predictions:nft.encoding")} value={<span className="font-mono text-xs">{_desc.nft_object.encoding}</span>} /> : null}
        {_desc.nft_object.license ? <StatBlock label={t("Predictions:nft.license")} value={<span className="text-xs">{_desc.nft_object.license}</span>} /> : null}
        {_desc.nft_object.holder_license ? <StatBlock label={t("Predictions:nft.holderLicense")} value={<span className="text-xs">{_desc.nft_object.holder_license}</span>} /> : null}
      </div>

      {_desc.nft_object.tags ? (
        <div>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">{t("Predictions:nft.tags")}</div>
          <div className="flex flex-wrap gap-1">
            {String(_desc.nft_object.tags).split(",").map((s) => s.trim()).filter(Boolean).map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px] py-0">{tag}</Badge>
            ))}
          </div>
        </div>
      ) : null}

      {_desc.nft_object.narrative ? <LongText label={t("Predictions:nft.narrative")} value={DOMPurify.sanitize(_desc.nft_object.narrative)} /> : null}
      {_desc.nft_object.acknowledgements ? <LongText label={t("Predictions:nft.acknowledgements")} value={DOMPurify.sanitize(_desc.nft_object.acknowledgements)} /> : null}
      {_desc.nft_object.attestation ? <LongText label={t("Predictions:nft.attestation")} value={DOMPurify.sanitize(_desc.nft_object.attestation)} /> : null}

      {nftImages && nftImages.length ? (
        <Button variant="outline" size="sm" asChild className="self-start">
          <a href={ipfsUrl(nftImages[heroIndex].url, ipfsGateway)} target="_blank" rel="noopener noreferrer">
            <ExternalLinkIcon className="mr-2 h-3.5 w-3.5" />
            {t("Predictions:nft.viewOnIpfs")}
          </a>
        </Button>
      ) : null}

      {(_desc.nft_signature || _desc.sig_pubkey_or_address) ? (
        <div className="rounded-md border border-border bg-accent/30 dark:bg-white/5 p-3 grid grid-cols-1 gap-2 text-xs">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-0.5">{t("Predictions:nft.signature")}</div>
            <MonoBlock value={_desc.nft_signature} truncate={32} copyable label={t("Predictions:nft.copySig")} />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-0.5">{t("Predictions:nft.sigPubkey")}</div>
            <MonoBlock value={_desc.sig_pubkey_or_address} truncate={32} copyable label={t("Predictions:nft.copyPubkey")} />
          </div>
          <div className="text-[10px] text-muted-foreground italic">{t("Predictions:nft.verifyNote")}</div>
        </div>
      ) : null}
    </div>
  );
}