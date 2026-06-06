import React, {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { List } from "react-window";

import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";

import { Ban, ShieldOff, Trash2 } from "lucide-react";

import {
  $blockList,
  $userBlockList,
  addBlockedUser,
  removeBlockedUser,
} from "@/stores/blocklist.ts";

import { $currentUser } from "@/stores/users.ts";

import AccountSearch from "@/components/AccountSearch.jsx";

function RemoveButton({ onClick, label }) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={label}
            onClick={onClick}
            className="h-8 w-8 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function BlockedUsers() {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });

  const blocklist = useSyncExternalStore(
    $blockList.subscribe,
    $blockList.get,
    () => true
  );

  const userBlockList = useSyncExternalStore(
    $userBlockList.subscribe,
    $userBlockList.get,
    () => true
  );

  const currentUser = useSyncExternalStore(
    $currentUser.subscribe,
    $currentUser.get,
    () => true
  );

  const _chain = useMemo(() => {
    if (currentUser && currentUser.chain) return currentUser.chain;
    return "bitshares";
  }, [currentUser]);

  const committeeCount = useMemo(() => {
    if (!blocklist || !blocklist.users) return 0;
    return blocklist.users.length;
  }, [blocklist]);

  const chainUserBlockList = useMemo(() => {
    if (!userBlockList) return [];
    return userBlockList[_chain] ?? [];
  }, [userBlockList, _chain]);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState();

  useEffect(() => {
    if (!selectedUser) return;
    addBlockedUser(_chain, { name: selectedUser.name, id: selectedUser.id });
    setSelectedUser(undefined);
    setAddDialogOpen(false);
  }, [selectedUser, _chain]);

  const renderCard = (item, style) => {
    if (!item) return null;
    return (
      <Card className="mb-3 group bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all rounded-xl">
        <CardHeader className="px-4 py-4 flex flex-row items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <CardTitle className="text-base text-slate-900 truncate">
              <span className="font-semibold">{item.name}</span>
              <span className="ml-2 text-xs font-mono font-normal text-slate-400">
                {item.id}
              </span>
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <RemoveButton
              onClick={() => removeBlockedUser(_chain, item)}
              label={t("Blocklist:remove")}
            />
          </div>
        </CardHeader>
      </Card>
    );
  };

  const Row = ({ index, style }) => {
    const item = chainUserBlockList[index];
    return <div style={{ ...style, paddingRight: "10px" }}>{renderCard(item, style)}</div>;
  };

  return (
    <div className="container mx-auto mt-5 mb-10 max-w-4xl">
      <Card className="mb-8 rounded-xl overflow-hidden">
        <CardHeader className="px-5 py-4 flex flex-row items-center justify-between bg-slate-50 border-b">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
              <ShieldOff className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
                {t("Blocklist:committeeHeader")}
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                {t("Blocklist:committeeCount", { count: committeeCount })}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            {t("Blocklist:committeeDescription")}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-xl overflow-hidden">
        <CardHeader className="px-5 py-4 flex flex-row items-center justify-between bg-slate-50 border-b">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
              <Ban className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
                {t("Blocklist:usersHeader")}
              </CardTitle>
              {chainUserBlockList && chainUserBlockList.length ? (
                <p className="text-xs text-slate-500 mt-0.5">
                  {chainUserBlockList.length}
                </p>
              ) : null}
            </div>
          </div>
          <Dialog
            open={addDialogOpen}
            onOpenChange={(open) => setAddDialogOpen(open)}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="hover:shadow-md">
                {t("Blocklist:addUser")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px] bg-white">
              <DialogHeader>
                <DialogTitle>{t("Blocklist:addUserDialogTitle")}</DialogTitle>
                <DialogDescription>
                  {t("Blocklist:addUserDialogDescription")}
                </DialogDescription>
              </DialogHeader>
              <AccountSearch
                chain={_chain}
                excludedUsers={[]}
                setChosenAccount={setSelectedUser}
                skipCheck={true}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-4">
          {chainUserBlockList && chainUserBlockList.length ? (
            <>
              <div className="w-full max-h-[420px] overflow-auto block md:hidden">
                <List
                  rowComponent={Row}
                  rowCount={chainUserBlockList.length}
                  rowHeight={88}
                  rowProps={{}}
                />
              </div>
              <div className="w-full max-h-[420px] overflow-auto hidden md:block">
                <List
                  rowComponent={Row}
                  rowCount={chainUserBlockList.length}
                  rowHeight={72}
                  rowProps={{}}
                />
              </div>
            </>
          ) : (
            <Empty className="mt-2 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <EmptyHeader>
                <EmptyMedia variant="icon">🚫</EmptyMedia>
                <EmptyTitle>{t("Blocklist:usersEmptyTitle")}</EmptyTitle>
                <EmptyDescription>
                  {t("Blocklist:usersEmptyDescription")}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
