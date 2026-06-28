import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle, HelpCircle } from "lucide-react";

export default function Field({ label, help, required, htmlFor, children, className, error }) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center gap-1.5">
        <Label
          htmlFor={htmlFor}
          className="text-sm font-medium text-foreground/90"
        >
          {label}
        </Label>
        {required && <span className="text-rose-400">*</span>}
        {help && (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  tabIndex={-1}
                  className="inline-flex items-center justify-center text-muted-foreground/60 transition-colors hover:text-foreground/70 focus:outline-none"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-xs text-xs leading-relaxed bg-card border-border text-foreground/80"
              >
                <p>{help}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {children}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-rose-400">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}
