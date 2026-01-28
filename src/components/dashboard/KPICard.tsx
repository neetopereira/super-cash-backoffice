import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  prefix?: string;
  variant?: 'default' | 'primary' | 'warning';
}

export function KPICard({ label, value, icon: Icon, prefix, variant = 'default' }: KPICardProps) {
  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between">
        <div>
          <div className="kpi-value">
            {prefix && <span className="text-lg font-normal text-muted-foreground mr-1">{prefix}</span>}
            {value}
          </div>
          <div className="kpi-label">{label}</div>
        </div>
        <div className={cn(
          "w-10 h-10 flex items-center justify-center",
          variant === 'primary' && "bg-primary/10 text-primary",
          variant === 'warning' && "bg-warning/10 text-warning",
          variant === 'default' && "bg-secondary text-muted-foreground"
        )}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}
