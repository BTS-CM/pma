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
      <DialogContent className="sm:max-w-[750px]">
        <DialogHeader>
          <DialogTitle>{resolvedTitle}</DialogTitle>
          {resolvedDescription ? (
            <DialogDescription className="text-muted-foreground">{resolvedDescription}</DialogDescription>
          ) : null}
        </DialogHeader>
        <Textarea
          value={jsonString}
          readOnly={true}
          rows={15}
          className="font-mono text-xs bg-accent/30 dark:bg-white/[0.05] border-border text-foreground placeholder:text-muted-foreground/60"
        />
        <Button
          className="w-1/4 mt-2 bg-accent/40 hover:bg-accent/60 text-foreground border-border"
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
