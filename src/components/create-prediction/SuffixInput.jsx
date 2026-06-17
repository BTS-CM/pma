import { Input } from "@/components/ui/input";

export default function SuffixInput({ suffix, ...props }) {
  return (
    <div className="relative">
      <Input {...props} className={(props.className || "") + " pr-10 bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50"} />
      {suffix && (
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-white/40">
          {suffix}
        </span>
      )}
    </div>
  );
}
