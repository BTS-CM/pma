import React, { useState, useEffect, useSyncExternalStore } from "react";
import { List } from "react-window";
import { useStore } from "@nanostores/react";

import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";
import { useInitCache } from "@/nanoeffects/Init.ts";

import {
  $currentNode,
  $nodes,
  setCurrentNode,
  updateNodes,
} from "@/stores/node";
import { $currentUser } from "@/stores/users.ts";
import { chains } from "@/config/chains";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Server, ChevronUp, Wifi, XCircle, Plus, RotateCcw, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Nodes(properties) {
  const { t, i18n } = useTranslation(locale.get(), { i18n: i18nInstance });
  const currentNode = useStore($currentNode);
  const nodes = useStore($nodes);
  const usr = useSyncExternalStore(
    $currentUser.subscribe,
    $currentUser.get,
    () => true
  );
  useInitCache(usr && usr.chain ? usr.chain : "bitshares", []);

  const [inputURL, setInputURL] = useState("");

  const NodeRow = ({ index, style }) => {
    const [open, setOpen] = useState(false);
    const [pinging, setPinging] = useState(false);
    const [pingResult, setPingResult] = useState(null);
    const [attempt, setAttempt] = useState(0);

    const nodeUrl = nodes[usr.chain][index].url;
    const isTop = index === 0;

    useEffect(() => {
      let cancelled = false;

      async function runPing() {
        if (!open) return;
        setPinging(true);
        setPingResult(null);

        try {
          let res;
          if (window?.electron?.ping) {
            res = await window.electron.ping(nodeUrl);
          } else {
            res = { ok: false, error: "no_bridge" };
          }

          if (cancelled) return;
          setPingResult(res);
        } catch (err) {
          if (cancelled) return;
          setPingResult({ ok: false, error: err?.message || String(err) });
        } finally {
          if (!cancelled) setPinging(false);
        }
      }

      runPing();

      return () => {
        cancelled = true;
      };
    }, [open, index, attempt]);

    return (
      <div style={{ ...style }} key={`acard-${index}`}>
        <Card className={cn(
          "mx-2 transition-all",
          isTop
            ? "bg-emerald-500/[0.06] border-emerald-500/20"
            : "bg-card/60 border-border hover:bg-accent/30 hover:border-border"
        )}>
          <CardHeader className="pb-0 pt-0 px-4 py-3">
            <CardTitle>
              <div className="grid grid-cols-4 gap-2 items-center">
                <div className={cn(
                  "col-span-4 md:col-span-3 text-sm font-mono truncate",
                  isTop ? "text-emerald-400" : "text-foreground/70"
                )}>
                  {isTop && <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-emerald-400/60 mr-2">Active</span>}
                  {nodeUrl}
                </div>
                <div className="col-span-4 md:col-span-1 text-right flex items-center justify-end gap-1">
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10"
                          onClick={() => {
                            const updatedNodes = [...nodes[usr.chain]];
                            const [selectedNode] = updatedNodes.splice(index, 1);
                            updateNodes(usr.chain, [selectedNode, ...updatedNodes]);
                          }}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Move to top</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-cyan-400 hover:bg-cyan-500/10">
                        <Wifi className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[420px]">
                      <DialogHeader>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/15">
                            <Wifi className="h-4 w-4 text-cyan-400" />
                          </div>
                          <div>
                            <DialogTitle>Ping node</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                              Checking reachability for{" "}
                              <span className="font-mono text-foreground/70">{nodeUrl}</span>
                            </DialogDescription>
                          </div>
                        </div>
                      </DialogHeader>
                      <div className="py-4">
                        {pinging ? (
                          <div className="flex items-center gap-3 rounded-lg border border-border bg-accent/30 dark:bg-white/[0.05] p-3">
                            <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                            <div className="text-foreground/70 text-sm">Pinging...</div>
                          </div>
                        ) : pingResult && pingResult.ok ? (
                          <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] p-3">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            <div className="text-emerald-400 text-sm">
                              Node is reachable!
                              {typeof pingResult.ms !== "undefined" ? (
                                <span className="ml-2 text-emerald-400/70">
                                  Ping: {pingResult.ms} ms
                                </span>
                              ) : null}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/[0.06] p-3">
                              <AlertCircle className="h-4 w-4 text-rose-400" />
                              <div className="text-rose-400 text-sm">
                                Node appears temporarily unreachable.
                              </div>
                            </div>
                            {pingResult && pingResult.error ? (
                              <div className="text-xs text-muted-foreground font-mono pl-7">
                                {pingResult.error}
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          className="border-border text-muted-foreground hover:bg-accent/60"
                          onClick={() => setAttempt((a) => a + 1)}
                          disabled={pinging}
                        >
                          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                          Retry
                        </Button>
                        <Button
                          className="bg-accent/40 dark:bg-white/10 text-foreground hover:bg-accent/50 dark:hover:bg-white/15"
                          onClick={() => setOpen(false)}
                        >
                          Close
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
                          onClick={() => {
                            const updatedNodes = [...nodes[usr.chain]];
                            updatedNodes.splice(index, 1);
                            updateNodes(usr.chain, updatedNodes);
                          }}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Remove node</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  };

  return (
    <div className="container mx-auto mt-5 mb-5 w-full lg:w-3/4 text-foreground">
      <div className="grid grid-cols-1 gap-3">
        <Card className="bg-card/60 border-border shadow-lg shadow-black/20 backdrop-blur-sm">
          <div className="h-1 w-full bg-gradient-to-r from-teal-500 to-cyan-500" />
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-teal-500/15 flex-shrink-0">
                <Server className="h-5 w-5 text-teal-400" />
              </span>
              {t("Nodes:cardTitle")}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {t("Nodes:cardDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usr &&
            usr.chain &&
            nodes[usr.chain] &&
            nodes[usr.chain].length ? (
              <>
                <div className="hidden md:block w-full max-h-[300px] overflow-auto">
                  <List
                    rowComponent={NodeRow}
                    rowCount={nodes[usr.chain].length}
                    rowHeight={55}
                    rowProps={{}}
                  />
                </div>
                <div className="md:hidden w-full max-h-[300px] overflow-auto">
                  <List
                    rowComponent={NodeRow}
                    rowCount={nodes[usr.chain].length}
                    rowHeight={80}
                    rowProps={{}}
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-muted-foreground text-sm">
                {t("Nodes:none")}
              </div>
            )}
            <div className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">{t("Nodes:addDescription")}</p>
              <div className="flex gap-2">
                <Input
                  name="searchInput"
                  placeholder="wss://url/ws"
                  className="flex-1 bg-accent/30 dark:bg-white/[0.05] border-border text-foreground placeholder:text-muted-foreground/60"
                  onChange={(event) => {
                    setInputURL(event.target.value);
                  }}
                  onKeyPress={(event) => {
                    if (
                      event.key !== "Enter" ||
                      !inputURL ||
                      nodes[usr.chain].findIndex(
                        (node) => node.url === inputURL
                      ) !== -1 ||
                      !/^wss?:\/\/[a-zA-Z0-9.-]+\/ws$/.test(inputURL)
                    ) {
                      return;
                    }

                    updateNodes(usr.chain, [
                      ...nodes[usr.chain],
                      { url: inputURL },
                    ]);
                  }}
                />
                <Button
                  className="bg-teal-600 hover:bg-teal-500 text-foreground gap-1.5"
                  onClick={() => {
                    if (
                      !inputURL ||
                      nodes[usr.chain].findIndex(
                        (node) => node.url === inputURL
                      ) !== -1 ||
                      !/^wss?:\/\/[a-zA-Z0-9.:\/\-]+$/.test(inputURL) ||
                      inputURL.includes("..")
                    ) {
                      return;
                    }
                    updateNodes(usr.chain, [
                      ...nodes[usr.chain],
                      { url: inputURL },
                    ]);
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t("Nodes:add")}
                </Button>
                <Button
                  variant="outline"
                  className="border-border text-muted-foreground hover:bg-accent/60"
                  onClick={() =>
                    updateNodes(usr.chain, chains[usr.chain].nodeList)
                  }
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  {t("Nodes:reset")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
