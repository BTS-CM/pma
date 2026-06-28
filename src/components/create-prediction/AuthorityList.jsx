import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar } from "@/components/Avatar.tsx";
import AccountSearch from "@/components/AccountSearch.jsx";
import { Plus, X, UserCheck } from "lucide-react";
import Field from "./Field";

export default function AuthorityList({
  title,
  help,
  list,
  onRemove,
  dialogOpen,
  setDialogOpen,
  onChoose,
  chain,
}) {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });
  return (
    <Field label={title} help={help}>
      <div className="overflow-hidden rounded-lg border border-border bg-accent/30 dark:bg-white/[0.05]">
        {list.length > 0 ? (
          <div className="max-h-[210px] divide-y divide-white/10 overflow-auto">
            {list.map((res, i) => (
              <div
                key={`auth-${title}-${res.id}`}
                className="flex items-center gap-3 px-3 py-2 hover:bg-accent/30 dark:bg-white/[0.05]"
              >
                <Avatar
                  size={32}
                  name={res.name}
                  extra={title.replaceAll(" ", "")}
                  expression={{ eye: "normal", mouth: "open" }}
                  colors={[
                    "#92A1C6",
                    "#146A7C",
                    "#F0AB3D",
                    "#C271B4",
                    "#C20D90",
                  ]}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">
                    {res.name || `#${i + 1}`}
                  </div>
                  <div className="truncate font-mono text-[10px] text-muted-foreground">
                    {res.id}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(res.id)}
                  className="text-muted-foreground hover:text-rose-400"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center">
            <UserCheck className="mx-auto h-6 w-6 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">
              No accounts added yet
            </p>
          </div>
        )}
        <div className="border-t border-border p-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full border-border bg-accent/30 dark:bg-white/[0.05] text-foreground/70 hover:bg-accent/40 hover:text-accent-foreground">
                <Plus className="h-3.5 w-3.5" />
                {t("Favourites:addUser")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[375px]">
              <DialogHeader>
                <DialogTitle>
                  {!chain ? t("Transfer:bitsharesAccountSearch") : null}
                  {chain === "bitshares"
                    ? t("Transfer:bitsharesAccountSearchBTS")
                    : null}
                  {chain !== "bitshares"
                    ? t("Transfer:bitsharesAccountSearchTEST")
                    : null}
                </DialogTitle>
              </DialogHeader>
              <AccountSearch
                chain={chain || "bitshares"}
                excludedUsers={[]}
                setChosenAccount={(_account) => {
                  onChoose(_account);
                  setDialogOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Field>
  );
}
