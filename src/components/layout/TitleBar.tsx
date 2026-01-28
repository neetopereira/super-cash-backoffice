import { Minus, Square, X } from 'lucide-react';

export function TitleBar() {
  return (
    <div className="app-titlebar border-b border-border select-none">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-primary rounded-sm" />
          <div className="w-1.5 h-1.5 bg-primary/60 rounded-sm" />
          <div className="w-1 h-1 bg-primary/30 rounded-sm" />
        </div>
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Super Cash
        </span>
        <span className="text-xs text-muted-foreground/50">·</span>
        <span className="text-xs text-muted-foreground/70">
          Private Credit Backoffice
        </span>
      </div>
      
      <div className="flex items-center">
        <button className="w-10 h-8 flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button className="w-10 h-8 flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
          <Square className="w-3 h-3" />
        </button>
        <button className="w-10 h-8 flex items-center justify-center text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
