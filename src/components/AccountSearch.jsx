import React, { useState, useEffect, useSyncExternalStore } from "react";
import { useStore } from "@nanostores/react";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex as toHex, utf8ToBytes } from "@noble/hashes/utils.js";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/Avatar.tsx";

import { accountSearch } from "@/nanoeffects/UserSearch.ts";
import { $currentUser } from "@/stores/users.ts";
import { $blockList } from "@/stores/blocklist.ts";
import { $currentNode } from "@/stores/node.ts";

export default function AccountSearch(properties) {
  const { chain, excludedUsers, setChosenAccount, skipCheck } = properties;
  const { t, i18n } = useTranslation(locale.get(), { i18n: i18nInstance });
  const usr = useSyncExternalStore(
    $currentUser.subscribe,
    $currentUser.get,
    () => true
  );
  const blocklist = useSyncExternalStore(
    $blockList.subscribe,
    $blockList.get,
    () => true
  );
  const currentNode = useStore($currentNode);

  const [accountInput, setAccountInput] = useState();
  const [errorMessage, setErrorMessage] = useState();

  const [inProgress, setInProgress] = useState(false);
  const [searchResponse, setSearchResponse] = useState();

  async function lookupAccount() {
    const excludedUsernames = excludedUsers.map((user) => user.username);
    const excludedIds = excludedUsers.map((user) => user.id);

    if (
      excludedUsernames.includes(accountInput) ||
      excludedIds.includes(accountInput)
    ) {
      setInProgress(false);
      setErrorMessage(t("AccountSearch:noSearch.selfError"));
      return;
    }

    let response;
    try {
      response = await accountSearch(
        chain,
        accountInput,
        currentNode ? currentNode.url : null
      );
    } catch (error) {
      console.log({ error, msg: t("AccountSearch:noSearch.error") });
      setErrorMessage(t("AccountSearch:noSearch.error"));
      setInProgress(false);
      return;
    }

    setInProgress(false);

    if (response && response.id) {
      //console.log({ skipCheck, id: response.id, blocklist: blocklist });
      if (usr.chain === "bitshares" && !skipCheck) {
        let hashedID;
        try {
          hashedID = toHex(sha256(utf8ToBytes(response.id)));
        } catch (error) {
          console.log({ error });
        }
        if (hashedID && blocklist.users.includes(hashedID)) {
          setErrorMessage(t("AccountSelect:noAccount"));
          return;
        }
      }
    } else {
      setErrorMessage(t("AccountSelect:noAccount"));
    }

    setSearchResponse(response);
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 text-white">
        {!searchResponse ? (
          <>
            <div className="col-span-1 text-sm text-white/70">
              {t("AccountSearch:noSearch.prompt")}
            </div>
            <div className="col-span-1">
              <Input
                value={accountInput || ""}
                placeholder={t("AccountSearch:noSearch.placeholder")}
                className="bg-slate-950/60 border-white/[0.08] text-white placeholder:text-white/35 focus-visible:ring-violet-400/50"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !inProgress) {
                    setInProgress(true);
                    lookupAccount();
                  }
                }}
                onChange={(event) => {
                  const regex = /^[a-zA-Z0-9.-]*$/;
                  if (regex.test(event.target.value)) {
                    setAccountInput(event.target.value);
                    setErrorMessage();
                    setSearchResponse();
                  }
                }}
              />
              {errorMessage ? (
                <p className="text-rose-400 text-xs italic mt-1">
                  {errorMessage || "ERROR"}
                </p>
              ) : null}
            </div>
            <div className="col-span-1">
              {accountInput ? (
                <Button
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-violet-900/30"
                  onClick={() => lookupAccount()}
                >
                  {t("AccountSearch:noSearch.continue")}
                </Button>
              ) : (
                <Button
                  disabled
                  className="border-white/[0.06] text-white/30"
                  variant="outline"
                >
                  {t("AccountSearch:noSearch.continue")}
                </Button>
              )}
            </div>
          </>
        ) : null}
        {searchResponse ? (
          <>
            <div className="col-span-1 text-sm text-white/70">
              {chain === "bitshares"
                ? t("AccountSearch:searchResponse.promptBTS")
                : t("AccountSearch:searchResponse.promptTEST")}
            </div>
            <div className="col-span-1">
              <div
                className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-950/60 backdrop-blur-xl shadow-md shadow-black/30 cursor-pointer hover:border-violet-500/30 transition-colors"
                onClick={() => {
                  setChosenAccount({
                    name: searchResponse.name,
                    id: searchResponse.id,
                  });
                }}
              >
                <div className="grid grid-cols-4">
                  <div className="col-span-1 pt-6 pl-7">
                    <Avatar
                      size={40}
                      name={searchResponse.name}
                      extra="AS"
                      expression={{
                        eye: "normal",
                        mouth: "open",
                      }}
                      colors={[
                        "#92A1C6",
                        "#146A7C",
                        "#F0AB3D",
                        "#C271B4",
                        "#C20D90",
                      ]}
                    />
                  </div>
                  <div className="col-span-3">
                    <div className="p-4 sm:p-5">
                      <h4
                        className="font-semibold text-white/90 text-sm tracking-tight"
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {searchResponse.name}
                      </h4>
                      <p className="text-xs text-white/45">{searchResponse.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Button
                    variant="outline"
                    className="border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.06] w-full"
                    onClick={() => {
                      setErrorMessage();
                      setSearchResponse();
                    }}
                  >
                    {t("AccountSearch:searchResponse.back")}
                  </Button>
                </div>
                <div className="text-right">
                  <Button
                    variant="outline"
                    className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10 hover:text-violet-200 hover:border-violet-400/50 w-full"
                    onClick={() => {
                      setChosenAccount({
                        name: searchResponse.name,
                        id: searchResponse.id,
                      });
                    }}
                  >
                    {t("AccountSearch:searchResponse.proceed")}
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
