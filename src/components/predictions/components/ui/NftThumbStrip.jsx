import React from "react";
import { ImageIcon } from "@radix-ui/react-icons";
import { ipfsUrl } from "@/lib/common.js";
import { cn } from "@/lib/utils";

export function NftThumbStrip({ images, heroIndex, setHeroIndex, ipfsGateway }) {
  if (!images || images.length <= 1) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {images.map((img, idx) => {
        const src = ipfsUrl(img.url, ipfsGateway);
        const active = idx === heroIndex;
        return (
          <button
            key={`thumb-${idx}-${img.url}`}
            type="button"
            onClick={() => setHeroIndex(idx)}
            className={cn(
              "h-14 w-14 rounded-md overflow-hidden border-2 transition-colors",
              active
                ? "border-violet-500 ring-2 ring-violet-500/30"
                : "border-white/[0.08] hover:border-violet-500/40",
            )}
            aria-label={`Image ${idx + 1}`}
          >
            {src ? (
              <img
                src={src}
                alt={img.type}
                loading="lazy"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-white/10 text-white/40">
                <ImageIcon className="h-4 w-4" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}