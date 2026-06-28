import React, { useEffect, useState } from "react";
import { InView } from "react-intersection-observer";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";

import { Avatar } from "@/components/Avatar";
import { cn } from "@/lib/utils";
import { AVATAR_DEFAULT_COLORS, getAvatarAccent } from "@/lib/utilities";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import AccountSelect from "../AccountSelect.jsx";

export default function CurrentUser(properties) {
  const { usr } = properties;
  const { t, i18n } = useTranslation(locale.get(), { i18n: i18nInstance });

  const [inView, setInView] = React.useState(false);
  if (!usr || !usr.id || !usr.id.length) {
    return null;
  }

  const [open, setOpen] = useState(false);

  const avatarColor = getAvatarAccent(usr.username, AVATAR_DEFAULT_COLORS);
  const accentStyle = { "--avatar-accent": avatarColor };

  useEffect(() => {
    if (usr && usr.id && usr.id.length) {
      setOpen(false);
    }
  }, [usr]);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
      }}
    >
      <DialogTrigger asChild>
        <span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Item
                  variant="outline"
                  style={accentStyle}
                  className={cn(
                    "group/user relative overflow-hidden inline-flex w-auto",
                    "bg-card/55 backdrop-blur-xl",
                    "border border-[color:var(--avatar-accent)]/20 hover:border-[color:var(--avatar-accent)]/50",
                    "rounded-2xl",
                    "shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.04)]",
                    "hover:bg-accent/60",
                    "transition-all duration-200 ease-out",
                    "cursor-pointer"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-3 top-0 h-px"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${avatarColor}cc, transparent)`,
                    }}
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full blur-2xl opacity-0 group-hover/user:opacity-100 transition-opacity duration-300"
                    style={{ background: `${avatarColor}33` }}
                  />
                  <ItemMedia>
                    <div
                      className="relative h-[50px] w-[50px] rounded-full ring-2 overflow-hidden"
                      style={{
                        borderColor: `${avatarColor}66`,
                        boxShadow: `0 0 18px -2px ${avatarColor}80`,
                      }}
                    >
                      <InView onChange={setInView}>
                        {inView ? (
                          <Avatar
                            size={50}
                            name={usr.username}
                            extra=""
                            expression={{
                              eye: "normal",
                              mouth: "open",
                            }}
                            colors={AVATAR_DEFAULT_COLORS}
                          />
                        ) : null}
                      </InView>
                    </div>
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="text-card-foreground font-semibold tracking-tight">
                      {usr.username}
                    </ItemTitle>
                    <ItemDescription className="text-left">
                      <Breadcrumb>
                        <BreadcrumbList className="justify-end">
                          <BreadcrumbSeparator
                            style={{ color: `${avatarColor}b3` }}
                          />
                          <BreadcrumbItem className="text-right text-muted-foreground text-[12px]">
                            {usr.id}
                          </BreadcrumbItem>
                        </BreadcrumbList>
                      </Breadcrumb>

                      <Breadcrumb>
                        <BreadcrumbList className="justify-end">
                          <BreadcrumbSeparator
                            style={{ color: `${avatarColor}b3` }}
                          />
                          <BreadcrumbItem className="text-right text-muted-foreground text-[12px]">
                            {usr.chain}
                          </BreadcrumbItem>
                        </BreadcrumbList>
                      </Breadcrumb>
                    </ItemDescription>
                  </ItemContent>
                </Item>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("CurrentUser:dialogContent.switchAccountChain")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </span>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "sm:max-w-[600px] p-0 gap-0 overflow-hidden",
          "bg-background/95 backdrop-blur-xl",
          "border border-border",
          "shadow-2xl dark:shadow-black/50 shadow-black/20"
        )}
      >
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${avatarColor}66, transparent)`,
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-[300px] rounded-full blur-3xl opacity-20"
            style={{ background: avatarColor }}
          />
        </div>
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-foreground text-xl font-semibold tracking-tight">
            {t("CurrentUser:dialogContent.replacingUser")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {t("CurrentUser:dialogContent.selectChainAccount")}
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6">
          <AccountSelect accentColor={avatarColor} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
