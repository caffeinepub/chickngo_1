import { useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import {
  LayoutDashboard,
  UserPlus,
  QrCode,
  Users,
  Gift,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { ReactNode } from 'react';

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Add Customer', path: '/add-customer', icon: <UserPlus size={18} /> },
  { label: 'Scan QR', path: '/scan', icon: <QrCode size={18} /> },
  { label: 'Customers', path: '/customers', icon: <Users size={18} /> },
  { label: 'Offers', path: '/offers', icon: <Gift size={18} /> },
];

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isActive = (path: string) => currentPath === path;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'oklch(0.65 0.19 45)' }}
        >
          <span className="text-white font-display font-bold text-lg">🐔</span>
        </div>
        <div>
          <div className="font-display font-bold text-white text-lg leading-tight">ChickNGo</div>
          <div className="text-xs" style={{ color: 'oklch(0.60 0.01 240)' }}>Loyalty System</div>
        </div>
      </div>

      <Separator className="mx-4 mb-3" style={{ backgroundColor: 'oklch(0.30 0.02 240)' }} />

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={`sidebar-nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="shrink-0">{item.icon}</span>
            <span>{item.label}</span>
            {isActive(item.path) && (
              <ChevronRight size={14} className="ml-auto opacity-70" />
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 mt-auto">
        <Separator className="mb-3" style={{ backgroundColor: 'oklch(0.30 0.02 240)' }} />
        <button
          onClick={logout}
          className="sidebar-nav-item w-full text-left"
          style={{ color: 'oklch(0.65 0.18 25)' }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 shrink-0 h-full"
        style={{ backgroundColor: 'oklch(0.22 0.015 240)' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="absolute left-0 top-0 h-full w-72 flex flex-col z-10"
            style={{ backgroundColor: 'oklch(0.22 0.015 240)' }}
          >
            <div className="flex justify-end p-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="text-white hover:bg-white/10"
              >
                <X size={20} />
              </Button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="shrink-0 h-16 bg-card border-b border-border flex items-center px-4 lg:px-6 gap-4 shadow-xs">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </Button>

          <div className="flex-1">
            {title && (
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={18} />
            </Button>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                style={{ backgroundColor: 'oklch(0.65 0.19 45)' }}
              >
                A
              </div>
              <span className="hidden sm:block text-sm font-medium">Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
