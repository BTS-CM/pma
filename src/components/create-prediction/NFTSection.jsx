import React from "react";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";
import {
  Image as ImageIcon,
  Link2,
  ImagePlus,
} from "lucide-react";
import { List } from "react-window";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

import ExternalLink from "../common/ExternalLink.jsx";
import Field from "./Field";
import MediaRow from "./MediaRow";

export default function NFTSection({
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
}) {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });

  return (
    <Card
      className={
        "overflow-hidden border-border bg-card/60 backdrop-blur-xl shadow-lg shadow-black/20 transition-colors " +
        (enabledNFT ? "ring-1 ring-amber-500/30" : "")
      }
    >
      <div className="flex items-start gap-3 border-b border-border px-6 py-4">
        <div
          className={
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ring-1 " +
            (enabledNFT
              ? "bg-amber-500/15 text-amber-400 ring-amber-500/30"
              : "bg-foreground/5 text-muted-foreground ring-foreground/10")
          }
        >
          <ImageIcon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
              {t("CreatePrediction:sectionHeader.step", { number: 3 })} · {t("CreatePrediction:sectionHeader.optional")}
            </span>
          </div>
          <h3 className="mt-0.5 text-base font-semibold leading-tight text-foreground">
            {t("CreatePrediction:steps.nft.title")}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t("CreatePrediction:steps.nft.description")}
          </p>
        </div>
        <Switch
          checked={enabledNFT}
          onCheckedChange={setEnabledNFT}
          className="mt-1 shrink-0 data-[state=checked]:bg-amber-500 data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-white/[0.12] [&>span]:bg-white"
        />
      </div>

      {enabledNFT && (
        <CardContent className="space-y-5 pt-6">
          {/* Media section */}
          <div className="rounded-lg border border-border bg-accent/30 dark:bg-white/[0.05] p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <ImagePlus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {t("AssetCommon:nft.currentIPFSFiles", {
                      count: nftMedia.length,
                    })}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("AssetCommon:nft.supportedFiletypes")}
                </p>
              </div>
              <Dialog
                onOpenChange={(open) => {
                  if (!open) setNewMediaUrl("");
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-border bg-foreground/5 text-foreground/70 hover:bg-accent/40 hover:text-accent-foreground">
                    {t("AssetCommon:nft.modifyMultimediaContents")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-full max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>
                      {t("AssetCommon:nft.modifyingMultimediaContents")}
                    </DialogTitle>
                  </DialogHeader>
                  <Card className="bg-card/60 border-border">
                    <CardHeader>
                      <CardTitle>
                        {t("AssetCommon:nft.currentIPFSMedia")}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {t("AssetCommon:nft.referencesIPFSObjects", {
                          count: nftMedia.length,
                        })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!nftMedia || !nftMedia.length ? (
                        <p className="text-sm text-muted-foreground">
                          {t("AssetCommon:nft.noIPFSMediaFound")}
                        </p>
                      ) : (
                        <>
                          <div className="grid grid-cols-4 gap-2 border-b border-border pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <div className="col-span-1">
                              {t("AssetCommon:nft.type")}
                            </div>
                            <div className="col-span-1">
                              {t("AssetCommon:nft.contentIdentifier")}
                            </div>
                            <div className="col-span-1">
                              {t("AssetCommon:nft.filename")}
                            </div>
                            <div className="col-span-1 text-right">
                              {t("AssetCommon:nft.delete")}
                            </div>
                          </div>
                          <div className="max-h-[125px] w-full overflow-auto">
                            <List
                              rowComponent={MediaRow}
                              rowCount={nftMedia.length}
                              rowHeight={25}
                              rowProps={{ nftMedia, setNFTMedia }}
                            />
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-card/60 border-border">
                    <CardHeader>
                      <CardTitle>
                        {t("AssetCommon:nft.addNewIPFSMedia")}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {t("AssetCommon:nft.noIPFSGateway")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="col-span-3">
                          <Input
                            placeholder={t(
                              "AssetCommon:nft.mediaURLPlaceholder"
                            )}
                            type="text"
                            className="bg-card/60 border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-violet-500/50"
                            onInput={(e) =>
                              setNewMediaUrl(e.currentTarget.value)
                            }
                            onKeyDown={(e) => {
                              if (
                                e.key === "Enter" &&
                                newMediaUrl &&
                                newMediaType
                              ) {
                                const temp_urls = nftMedia.map(
                                  (x) => x.url
                                );
                                if (temp_urls.includes(newMediaUrl)) {
                                  setNewMediaUrl("");
                                  return;
                                }
                                setNFTMedia(
                                  nftMedia && nftMedia.length
                                    ? [
                                        ...nftMedia,
                                        {
                                          url: newMediaUrl,
                                          type: newMediaType,
                                        },
                                      ]
                                    : [
                                        {
                                          url: newMediaUrl,
                                          type: newMediaType,
                                        },
                                      ]
                                );
                                setNewMediaUrl("");
                              }
                            }}
                            value={newMediaUrl}
                          />
                        </div>
                        <div className="col-span-1">
                          <Select onValueChange={setNewMediaType}>
                            <SelectTrigger className="w-full bg-card/60 border-border text-foreground">
                              <SelectValue
                                placeholder={t(
                                  "AssetCommon:nft.fileTypePlaceholder"
                                )}
                              />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border text-foreground" style={{ maxHeight: '12.5rem', overflowY: 'auto' }}>
                              <SelectGroup>
                                <SelectLabel>
                                  {t("AssetCommon:nft.imageFormats")}
                                </SelectLabel>
                                <SelectItem value="PNG">PNG</SelectItem>
                                <SelectItem value="WEBP">WEBP</SelectItem>
                                <SelectItem value="JPEG">JPEG</SelectItem>
                                <SelectItem value="GIF">GIF</SelectItem>
                                <SelectItem value="TIFF">TIFF</SelectItem>
                                <SelectItem value="BMP">BMP</SelectItem>
                                <SelectLabel>
                                  {t("AssetCommon:nft.audioFormats")}
                                </SelectLabel>
                                <SelectItem value="MP3">MP3</SelectItem>
                                <SelectItem value="MP4">MP4</SelectItem>
                                <SelectItem value="M4A">M4A</SelectItem>
                                <SelectItem value="OGG">OGG</SelectItem>
                                <SelectItem value="FLAC">FLAC</SelectItem>
                                <SelectItem value="WAV">WAV</SelectItem>
                                <SelectItem value="WMA">WMA</SelectItem>
                                <SelectItem value="AAC">AAC</SelectItem>
                                <SelectLabel>
                                  {t("AssetCommon:nft.videoFormats")}
                                </SelectLabel>
                                <SelectItem value="WEBM">WEBM</SelectItem>
                                <SelectItem value="MOV">MOV</SelectItem>
                                <SelectItem value="QT">QT</SelectItem>
                                <SelectItem value="AVI">AVI</SelectItem>
                                <SelectItem value="WMV">WMV</SelectItem>
                                <SelectItem value="MPEG">MPEG</SelectItem>
                                <SelectLabel>
                                  {t("AssetCommon:nft.documentFormats")}
                                </SelectLabel>
                                <SelectItem value="PDF">PDF</SelectItem>
                                <SelectItem value="DOCX">DOCX</SelectItem>
                                <SelectItem value="ODT">ODT</SelectItem>
                                <SelectItem value="XLSX">XLSX</SelectItem>
                                <SelectItem value="ODS">ODS</SelectItem>
                                <SelectItem value="PPTX">PPTX</SelectItem>
                                <SelectItem value="TXT">TXT</SelectItem>
                                <SelectLabel>
                                  {t("AssetCommon:nft.threeDFormats")}
                                </SelectLabel>
                                <SelectItem value="OBJ">OBJ</SelectItem>
                                <SelectItem value="FBX">FBX</SelectItem>
                                <SelectItem value="GLTF">GLTF</SelectItem>
                                <SelectItem value="3DS">3DS</SelectItem>
                                <SelectItem value="STL">STL</SelectItem>
                                <SelectItem value="COLLADA">
                                  COLLADA
                                </SelectItem>
                                <SelectItem value="3MF">3MF</SelectItem>
                                <SelectItem value="BLEND">BLEND</SelectItem>
                                <SelectItem value="SKP">SKP</SelectItem>
                                <SelectItem value="VOX">VOX</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-4 flex flex-wrap gap-2">
                          {newMediaType &&
                          newMediaType.length &&
                          newMediaUrl &&
                          newMediaUrl.length ? (
                            <Button
                              className="bg-gradient-to-r from-violet-500 to-purple-600 text-foreground hover:brightness-110"
                              onClick={() => {
                                const temp_urls = nftMedia.map(
                                  (x) => x.url
                                );
                                if (temp_urls.includes(newMediaUrl)) {
                                  setNewMediaUrl("");
                                  return;
                                }
                                setNFTMedia([
                                  ...nftMedia,
                                  {
                                    url: newMediaUrl,
                                    type: newMediaType,
                                  },
                                ]);
                                setNewMediaUrl("");
                              }}
                            >
                              {t("AssetCommon:nft.submit")}
                            </Button>
                          ) : (
                            <Button disabled className="bg-accent/40 dark:bg-white/[0.08] text-muted-foreground cursor-not-allowed">
                              {t("AssetCommon:nft.submit")}
                            </Button>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="border-border bg-foreground/5 text-foreground/70 hover:bg-accent/40 hover:text-accent-foreground">
                                {t("AssetCommon:nft.ipfsHostingSolutions")}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-card backdrop-blur-2xl border-border text-foreground">
                              <DialogHeader>
                                <DialogTitle>
                                  {t("AssetCommon:nft.ipfsHostingSolutions")}
                                </DialogTitle>
                                <DialogDescription className="text-muted-foreground">
                                  {t(
                                    "AssetCommon:nft.ipfsHostingDescription"
                                  )}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                <ExternalLink
                                  classnamecontents="hover:text-violet-400 text-muted-foreground"
                                  type="button"
                                  text={"Pinata.cloud"}
                                  hyperlink={"https://www.pinata.cloud/"}
                                />
                                <ExternalLink
                                  classnamecontents="hover:text-violet-400 text-muted-foreground"
                                  type="button"
                                  text={"NFT.storage"}
                                  hyperlink={"https://nft.storage/"}
                                />
                                <ExternalLink
                                  classnamecontents="hover:text-violet-400 text-muted-foreground"
                                  type="button"
                                  text={"Web3.storage"}
                                  hyperlink={"https://web3.storage/"}
                                />
                                <ExternalLink
                                  classnamecontents="hover:text-violet-400 text-muted-foreground"
                                  type="button"
                                  text={"Fleek.co"}
                                  hyperlink={
                                    "https://fleek.co/ipfs-gateway/"
                                  }
                                />
                                <ExternalLink
                                  classnamecontents="hover:text-violet-400 text-muted-foreground"
                                  type="button"
                                  text={"Infura.io"}
                                  hyperlink={"https://infura.io/product/ipfs"}
                                />
                                <ExternalLink
                                  classnamecontents="hover:text-violet-400 text-muted-foreground"
                                  type="button"
                                  text={"StorJ"}
                                  hyperlink={
                                    "https://landing.storj.io/permanently-pin-with-storj-dcs"
                                  }
                                />
                                <ExternalLink
                                  classnamecontents="hover:text-violet-400 text-muted-foreground"
                                  type="button"
                                  text={"Eternum.io"}
                                  hyperlink={"https://www.eternum.io/"}
                                />
                                <ExternalLink
                                  classnamecontents="hover:text-violet-400 text-muted-foreground"
                                  type="button"
                                  text={"IPFS Docs"}
                                  hyperlink={
                                    "https://blog.ipfs.io/2021-04-05-storing-nfts-on-ipfs/"
                                  }
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </DialogContent>
              </Dialog>
            </div>
            {nftMedia.length > 0 ? (
              <div className="space-y-1.5">
                {nftMedia.map((m) => (
                  <div
                    key={m.url}
                    className="flex items-center gap-2 rounded-md border border-border bg-accent/30 dark:bg-white/[0.05] px-3 py-2 text-sm"
                  >
                    <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="rounded bg-accent/40 dark:bg-white/[0.08] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
                      {m.type}
                    </span>
                    <span className="truncate font-mono text-xs text-foreground">
                      {m.url}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {t("AssetCommon:nft.noIPFSMediaFound")}
              </p>
            )}
          </div>

          {/* NFT metadata fields */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field
              label={t("AssetCommon:nft.NFTTitleHeader")}
              help={t("AssetCommon:nft.NFTTitleContent")}
              htmlFor="prediction-nft-title"
            >
              <Input
                id="prediction-nft-title"
                placeholder={t("AssetCommon:nft.TitlePlaceholder")}
                value={title}
                className="bg-card/60 border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-violet-500/50"
                onInput={(e) => setTitle(e.currentTarget.value)}
              />
            </Field>
            <Field
              label={t("AssetCommon:nft.NFTArtistHeader")}
              help={t("AssetCommon:nft.NFTArtistContent")}
              htmlFor="prediction-nft-artist"
            >
              <Input
                id="prediction-nft-artist"
                placeholder={t("AssetCommon:nft.ArtistPlaceholder")}
                value={artist}
                className="bg-card/60 border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-violet-500/50"
                onInput={(e) => setArtist(e.currentTarget.value)}
              />
            </Field>
            <Field
              label={t("AssetCommon:nft.NFTNarrativeHeader")}
              help={t("AssetCommon:nft.NFTNarrativeContent")}
              htmlFor="prediction-nft-narrative"
            >
              <Input
                id="prediction-nft-narrative"
                placeholder={t("AssetCommon:nft.NarrativePlaceholder")}
                value={narrative}
                className="bg-card/60 border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-violet-500/50"
                onInput={(e) => setNarrative(e.currentTarget.value)}
              />
            </Field>
            <Field
              label={t("AssetCommon:nft.NFTTagsHeader")}
              help={t("AssetCommon:nft.NFTTagsContent")}
              htmlFor="prediction-nft-tags"
            >
              <Input
                id="prediction-nft-tags"
                placeholder={t("AssetCommon:nft.TagsPlaceholder")}
                value={tags}
                className="bg-card/60 border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-violet-500/50"
                onInput={(e) => setTags(e.currentTarget.value)}
              />
            </Field>
            <Field
              label={t("AssetCommon:nft.NFTTypeHeader")}
              help={t("AssetCommon:nft.NFTTypeContent")}
              htmlFor="prediction-nft-type"
            >
              <Input
                id="prediction-nft-type"
                placeholder={t("AssetCommon:nft.TypePlaceholder")}
                value={type}
                className="bg-card/60 border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-violet-500/50"
                onInput={(e) => setType(e.currentTarget.value)}
              />
            </Field>
            <Field
              label={t("AssetCommon:nft.NFTAttestationHeader")}
              help={t("AssetCommon:nft.NFTAttestationContent")}
              htmlFor="prediction-nft-attestation"
            >
              <Input
                id="prediction-nft-attestation"
                placeholder={t("AssetCommon:nft.AttestationPlaceholder")}
                value={attestation}
                className="bg-card/60 border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-violet-500/50"
                onInput={(e) => setAttestation(e.currentTarget.value)}
              />
            </Field>
            <Field
              label={t("AssetCommon:nft.NFTAcknowledgementsHeader")}
              help={t("AssetCommon:nft.NFTAcknowledgementsContent")}
              htmlFor="prediction-nft-ack"
            >
              <Input
                id="prediction-nft-ack"
                placeholder={t(
                  "AssetCommon:nft.AcknowledgementsPlaceholder"
                )}
                value={acknowledgements}
                className="bg-card/60 border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-violet-500/50"
                onInput={(e) =>
                  setAcknowledgements(e.currentTarget.value)
                }
              />
            </Field>
            <Field
              label={t("AssetCommon:nft.NFTHolderLicenseHeader")}
              help={t("AssetCommon:nft.NFTHolderLicenseContent")}
              htmlFor="prediction-nft-holderlic"
            >
              <Input
                id="prediction-nft-holderlic"
                placeholder={t(
                  "AssetCommon:nft.HolderLicensePlaceholder"
                )}
                value={holderLicense}
                className="bg-card/60 border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-violet-500/50"
                onInput={(e) => setHolderLicense(e.currentTarget.value)}
              />
            </Field>
            <Field
              label={t("AssetCommon:nft.NFTLicenseHeader")}
              help={t("AssetCommon:nft.NFTLicenseContent")}
              htmlFor="prediction-nft-license"
            >
              <Input
                id="prediction-nft-license"
                placeholder={t(
                  "AssetCommon:nft.LicensePlaceholder"
                )}
                value={license}
                className="bg-card/60 border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-violet-500/50"
                onInput={(e) => setLicense(e.currentTarget.value)}
              />
            </Field>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
