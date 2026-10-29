import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, FileText, Sparkles, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/dashboard',  label: 'Dashboard',        Icon: LayoutDashboard },
  { to: '/documents',  label: 'My Documents',     Icon: FileText },
  { to: '/renewal',    label: 'AI Renewal Guide',  Icon: Sparkles },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <>
      {/* Top bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-navy-700 flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-navy-800 text-sm">DocuGuard</span>
        </div>
        <button
          id="mobile-menu-toggle"
          onClick={() => setOpen(o => !o)}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />
          {/* Panel */}
          <nav className="relative w-64 bg-white h-full shadow-xl flex flex-col animate-slide-in">
            <div className="flex items-center gap-2 px-4 py-4 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-navy-700 flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-navy-800 text-sm">DocuGuard</span>
            </div>

            <div className="flex-1 px-3 py-4 space-y-0.5">
              {NAV_ITEMS.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    isActive ? 'sidebar-link-active' : 'sidebar-link'
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>

            <div className="px-3 py-4 border-t border-slate-100">
              <div className="px-3 py-2 mb-1">
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <button
                id="mobile-signout-btn"
                onClick={() => { setOpen(false); signOut(); }}
                className="sidebar-link w-full text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
