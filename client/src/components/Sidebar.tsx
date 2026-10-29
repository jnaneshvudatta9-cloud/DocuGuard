import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Sparkles, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/dashboard',  label: 'Dashboard',        Icon: LayoutDashboard },
  { to: '/documents',  label: 'My Documents',     Icon: FileText },
  { to: '/renewal',    label: 'AI Renewal Guide',  Icon: Sparkles },
];

export function Sidebar() {
  const { user, signOut } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-white border-r border-slate-200 shadow-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-navy-700 flex items-center justify-center shadow-sm">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-bold text-navy-800 text-sm leading-tight">DocuGuard</p>
          <p className="text-xs text-slate-400 leading-tight">Document Tracker</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive ? 'sidebar-link-active' : 'sidebar-link'
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User + Sign out */}
      <div className="px-3 py-4 border-t border-slate-100">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs font-medium text-slate-500 truncate">Signed in as</p>
          <p className="text-xs text-slate-700 font-semibold truncate">{user?.email}</p>
        </div>
        <button
          id="sidebar-signout-btn"
          onClick={signOut}
          className="sidebar-link w-full text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
