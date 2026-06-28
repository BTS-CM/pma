import { Input } from "@/components/ui/input";

export default function SuffixInput({ suffix, ...props }) {
  return (
    <div className="relative">
      <Input {...props} className={(props.className || "") + " pr-10 bg-card/60 border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-violet-500/50"} />
      {suffix && (
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
  );
}
