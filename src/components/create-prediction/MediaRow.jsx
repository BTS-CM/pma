import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function MediaRow({ index, style, nftMedia, setNFTMedia }) {
  if (!nftMedia || !nftMedia.length || !nftMedia[index]) {
    return;
  }

  let res = nftMedia[index];

  return (
    <div
      style={{ ...style }}
      key={`dialogrow-${index}`}
      className="grid grid-cols-4"
    >
      <div className="col-span-1 text-muted-foreground">{res.type}</div>
      <div className="col-span-1">
        <Dialog>
          <DialogTrigger>
            <Button className="h-5 border-border bg-foreground/5 text-foreground/70 hover:bg-accent/40" variant="outline">
              Full URL
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-4xl backdrop-blur-2xl">
            <DialogHeader>
              <DialogTitle>Full IPFS URL</DialogTitle>
            </DialogHeader>
            <p className="text-foreground/70 font-mono text-sm">{res.url}</p>
          </DialogContent>
        </Dialog>
      </div>
      <div className="col-span-1 text-muted-foreground text-sm">{res.url.split("/").pop()}</div>
      <div className="col-span-1 flex items-center justify-end">
        <Button
          variant="outline"
          className="w-6 h-6 bg-rose-600 text-white border-rose-600 hover:bg-rose-500"
          onClick={() => {
            setNFTMedia(nftMedia.filter((x) => x.url !== res.url));
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
