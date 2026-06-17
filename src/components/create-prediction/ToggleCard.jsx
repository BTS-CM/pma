import { Switch } from "@/components/ui/switch";

export default function ToggleCard({ enabled, onToggle, title, description, enabledTitle, enabledDescription, icon: Icon, accent = "violet" }) {
  const accents = {
    violet: { border: "border-violet-500/30", bg: "bg-violet-500/10", iconBg: "bg-violet-500/20 text-violet-400" },
    cyan: { border: "border-cyan-500/30", bg: "bg-cyan-500/10", iconBg: "bg-cyan-500/20 text-cyan-400" },
    emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/10", iconBg: "bg-emerald-500/20 text-emerald-400" },
    rose: { border: "border-rose-500/30", bg: "bg-rose-500/10", iconBg: "bg-rose-500/20 text-rose-400" },
  };
  const a = accents[accent] || accents.violet;
  return (
    <div
      className={
        "flex items-center justify-between gap-4 rounded-lg border px-4 py-3 transition-colors " +
        (enabled
          ? a.border + " " + a.bg
          : "border-white/10 bg-white/[0.03] hover:border-white/20")
      }
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div
            className={
              "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors " +
              (enabled
                ? a.iconBg
                : "bg-white/5 text-white/40")
            }
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <div className="text-sm font-medium text-white">{enabled ? (enabledTitle || title) : title}</div>
          {description && (
            <div className="mt-0.5 text-xs text-white/50">
              {enabled ? (enabledDescription || description) : description}
            </div>
          )}
        </div>
      </div>
      <Switch checked={enabled} onCheckedChange={onToggle} className="shrink-0 data-[state=checked]:bg-violet-500 data-[state=unchecked]:bg-white/20 [&>span]:bg-white" />
    </div>
  );
}
