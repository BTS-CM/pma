import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";
import { InfoCircledIcon } from "@radix-ui/react-icons";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  HoverCardPortal,
} from "@/components/ui/hover-card";

interface Props {
  alreadyDisabled: boolean;
  id: string;
  allowedText: string;
  enabledInfo: string;
  disabledText: string;
  disabledInfo: string;
  permission: boolean;
  setPermission: (permission: boolean) => void;
  flag: boolean;
  setFlag: (flag: boolean) => void;
  className?: string;
}

interface MakeHoverProps {
  children: React.ReactNode;
}

export default function AssetPermission({
  alreadyDisabled,
  id,
  allowedText,
  enabledInfo,
  disabledText,
  disabledInfo,
  permission,
  setPermission,
  flag,
  setFlag,
  className,
}: Props) {
  const { t, i18n } = useTranslation(locale.get(), { i18n: i18nInstance });

  const MakeHover: React.FC<MakeHoverProps> = ({ children }) => {
    return (
      <HoverCard>
        <HoverCardTrigger>{children}</HoverCardTrigger>
        <HoverCardPortal>
          <HoverCardContent className={"w-80 mt-1 bg-slate-950 border-white/10 text-white z-[9999]"} align="start">
            <h4 className="scroll-m-20 text-md font-semibold tracking-tight">
              {t("Predictions:about")}: {id}
            </h4>
            <p className="leading-6 text-sm text-white/70 [&:not(:first-child)]:mt-1">
              {alreadyDisabled || !permission ? disabledInfo : enabledInfo}
            </p>
          </HoverCardContent>
        </HoverCardPortal>
      </HoverCard>
    );
  };

  if (alreadyDisabled) {
    return (
      <span className={"grid grid-cols-12 items-center gap-2 pl-3 " + (className || "")}>
        <span>
          <Checkbox
            checked={false}
            id={id}
            disabled
          />
        </span>
        <span className="col-span-10 text-white/70">
          <MakeHover>
            <Label htmlFor={id}>{permission || disabledText}</Label>
          </MakeHover>
        </span>
        <MakeHover>
          <InfoCircledIcon className="text-white/40" />
        </MakeHover>
      </span>
    );
  }

  return (
    <span className={"grid grid-cols-12 items-center gap-2 pl-3 " + (className || "")}>
      <span>
        <Checkbox
          onClick={(e) => {
            const target = e.target as Element;
            const isChecked = target.getAttribute("aria-checked") === "true";
            setPermission(!isChecked);
            if (!isChecked && flag) {
              setFlag(false);
            }
          }}
          id={id}
          checked={permission}
        />
      </span>
      <span className="col-span-10 text-white/70">
        <MakeHover>
          <Label htmlFor={id}>{permission ? allowedText : disabledText}</Label>
        </MakeHover>
      </span>
      <MakeHover>
        <InfoCircledIcon className="text-white/40" />
      </MakeHover>
    </span>
  );
}
