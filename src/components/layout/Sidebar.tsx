import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Wallet,
  Users,
  FileStack,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Emitir Guia', href: '/emitir', icon: FileText },
  { name: 'Arrecadação', href: '/arrecadacao', icon: Wallet },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Contratos', href: '/contratos', icon: FileStack },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-56 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo Section */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">SC</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-sidebar-accent-foreground">
              Super Cash
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Backoffice v1.0
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <div className="px-3 mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Operações
          </span>
        </div>
        <div className="space-y-0.5">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  'nav-item mx-2',
                  isActive && 'active'
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <button className="nav-item w-full justify-start">
          <Settings className="w-4 h-4" />
          <span>Configurações</span>
        </button>
        <div className="mt-3 px-3">
          <div className="text-[10px] text-muted-foreground/50">
            © 2024 Super Cash Ltda.
          </div>
          <div className="text-[10px] text-muted-foreground/30">
            Sistema de uso interno
          </div>
        </div>
      </div>
    </aside>
  );
}
