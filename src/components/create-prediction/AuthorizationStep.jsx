import React from "react";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";
import { UserCheck } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

import SectionHeader from "./SectionHeader";
import AuthorityList from "./AuthorityList";

export default function AuthorizationStep({
  usr,
  flagWhiteList,
  whitelistAuthorities,
  setWhitelistAuthorities,
  blacklistAuthorities,
  setBlacklistAuthorities,
  whitelistAuthorityDialogOpen,
  setWhitelistAuthorityDialogOpen,
  blacklistAuthorityDialogOpen,
  setBlacklistAuthorityDialogOpen,
}) {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });

  if (!flagWhiteList) {
    return null;
  }

  return (
    <Card className="overflow-hidden border-border bg-card/60 backdrop-blur-xl shadow-lg shadow-black/20">
      <SectionHeader
        step={6}
        icon={UserCheck}
        title={t("CreatePrediction:steps.authorization.title")}
        description={t(
          "CreatePrediction:steps.authorization.description"
        )}
      />
      <CardContent className="space-y-6 pt-6">
        <AuthorityList
          title={t("AssetCommon:whitelist.header")}
          help={t("AssetCommon:whitelist.header_content")}
          list={whitelistAuthorities}
          onRemove={(id) =>
            setWhitelistAuthorities(
              whitelistAuthorities.filter((x) => x.id !== id)
            )
          }
          dialogOpen={whitelistAuthorityDialogOpen}
          setDialogOpen={setWhitelistAuthorityDialogOpen}
          onChoose={(_account) => {
            if (
              _account &&
              !whitelistAuthorities.find(
                (_usr) => _usr.id === _account.id
              )
            ) {
              setWhitelistAuthorities(
                whitelistAuthorities && whitelistAuthorities.length
                  ? [...whitelistAuthorities, _account]
                  : [_account]
              );
            }
          }}
          chain={usr && usr.chain ? usr.chain : "bitshares"}
        />
        <AuthorityList
          title={t("AssetCommon:blacklist.header")}
          help={t("AssetCommon:blacklist.header_content")}
          list={blacklistAuthorities}
          onRemove={(id) =>
            setBlacklistAuthorities(
              blacklistAuthorities.filter((x) => x.id !== id)
            )
          }
          dialogOpen={blacklistAuthorityDialogOpen}
          setDialogOpen={setBlacklistAuthorityDialogOpen}
          onChoose={(_account) => {
            if (
              _account &&
              !blacklistAuthorities.find(
                (_usr) => _usr.id === _account.id
              )
            ) {
              setBlacklistAuthorities(
                blacklistAuthorities && blacklistAuthorities.length
                  ? [...blacklistAuthorities, _account]
                  : [_account]
              );
            }
          }}
          chain={usr && usr.chain ? usr.chain : "bitshares"}
        />
      </CardContent>
    </Card>
  );
}
