import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function JsonDetailsDialog({
  open,
  onOpenChange,
  data,
  title,
  description,
  copyLabel,
  copiedLabel,
  namespace = "Predictions",
  titleKey = "json.title",
  descriptionKey = "json.description",
  copyKey = "json.copy",
}) {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });
  const [copied, setCopied] = useState(false);

  const resolvedTitle = title ?? t(`${namespace}:${titleKey}`);
  const resolvedDescription = description ?? t(`${namespace}:${descriptionKey}`);
  const resolvedCopy = copyLabel ?? t(`${namespace}:${copyKey}`);
  const resolvedCopied = copiedLabel ?? t(`${namespace}:json.copied`);

  const jsonString = data !== undefined && data !== null
    ? JSON.stringify(data, null, 2)
    : "";

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setCopied(false);
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-[750px] bg-slate-950 border-white/[0.08] text-white shadow-2xl shadow-black/40">
        <DialogHeader>
          <DialogTitle className="text-white">{resolvedTitle}</DialogTitle>
          {resolvedDescription ? (
            <DialogDescription className="text-white/60">{resolvedDescription}</DialogDescription>
          ) : null}
        </DialogHeader>
        <Textarea
          value={jsonString}
          readOnly={true}
          rows={15}
          className="font-mono text-xs bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30"
        />
        <Button
          className="w-1/4 mt-2 bg-white/10 hover:bg-white/15 text-white border-white/[0.08]"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(jsonString);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch (err) {
              // clipboard blocked; silently fail
            }
          }}
        >
          {copied ? resolvedCopied : resolvedCopy}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
