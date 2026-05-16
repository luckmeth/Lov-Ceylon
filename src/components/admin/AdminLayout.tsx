import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Aperture,
  BarChart3,
  Camera,
  ExternalLink,
  FolderOpen,
  Images,
  Link2,
  LogOut,
  Mail,
  Menu,
  Package,
  Settings,
  Star,
  X,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { submissionsQuery } from "@/lib/queries";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", to: "/admin", icon: BarChart3, exact: true },
  { label: "Hero Slides", to: "/admin/hero-slides", icon: Images },
  { label: "Photos", to: "/admin/photos", icon: Camera },
  { label: "Categories", to: "/admin/categories", icon: FolderOpen },
  { label: "Packages", to: "/admin/packages", icon: Package },
  { label: "Testimonials", to: "/admin/testimonials", icon: Star },
  { label: "Site Settings", to: "/admin/settings", icon: Settings },
  { label: "Social Links", to: "/admin/social", icon: Link2 },
  { label: "Submissions", to: "/admin/submissions", icon: Mail },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useRouterState({ select: (s) => s.location.pathname });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: submissions = [] } = useQuery(submissionsQuery());
  const unreadCount = submissions.filter((s) => !s.is_read).length;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  const isActive = (to: string, exact?: boolean) =>
    exact ? location === to : location.startsWith(to);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-[rgba(26,16,8,0.08)] px-5">
        <Aperture className="h-6 w-6 text-[#C9A96E]" />
        <span className="font-display text-[15px] font-semibold text-[#1a1008]">
          Dopamine Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-[#8B6B3D]">
          Content
        </div>
        {navItems.slice(0, 6).map((item) => (
          <NavLink
            key={item.to}
            item={item}
            active={isActive(item.to, item.exact)}
            badge={item.to === "/admin/submissions" ? unreadCount : 0}
            onClick={() => setSidebarOpen(false)}
          />
        ))}

        <div className="mb-1 mt-5 px-2 text-[10px] font-semibold uppercase tracking-widest text-[#8B6B3D]">
          Site
        </div>
        {navItems.slice(6, 8).map((item) => (
          <NavLink
            key={item.to}
            item={item}
            active={isActive(item.to)}
            onClick={() => setSidebarOpen(false)}
          />
        ))}

        <div className="mb-1 mt-5 px-2 text-[10px] font-semibold uppercase tracking-widest text-[#8B6B3D]">
          Inbox
        </div>
        <NavLink
          item={navItems[8]}
          active={isActive(navItems[8].to)}
          badge={unreadCount}
          onClick={() => setSidebarOpen(false)}
        />
      </nav>

      {/* Footer */}
      <div className="border-t border-[rgba(26,16,8,0.08)] p-3 space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-[#6b5a4a] hover:bg-[#f0ede8] hover:text-[#1a1008] transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View public site
        </a>
        <div className="flex items-center gap-2 rounded-md px-3 py-2">
          <div className="h-6 w-6 rounded-full bg-[#C9A96E]/20 flex items-center justify-center">
            <span className="text-[10px] font-bold text-[#C9A96E]">
              {user?.email?.[0]?.toUpperCase() ?? "A"}
            </span>
          </div>
          <span className="flex-1 truncate text-xs text-[#6b5a4a]">
            {user?.email ?? "Admin"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-6 w-6 text-[#6b5a4a] hover:text-red-600"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="admin-theme flex min-h-screen bg-[#f8f7f5]">
      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex md:w-60 md:flex-col border-r border-[rgba(26,16,8,0.08)] bg-white">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[rgba(26,16,8,0.08)] bg-white transition-transform duration-200 md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute right-3 top-4 rounded p-1 text-[#6b5a4a] hover:bg-[#f0ede8]"
        >
          <X className="h-4 w-4" />
        </button>
        {sidebarContent}
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col md:ml-60">
        {/* Mobile top bar */}
        <header className="flex h-14 items-center gap-3 border-b border-[rgba(26,16,8,0.08)] bg-white px-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded p-1.5 text-[#6b5a4a] hover:bg-[#f0ede8]"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Aperture className="h-5 w-5 text-[#C9A96E]" />
          <span className="font-display text-sm font-semibold text-[#1a1008]">Dopamine Admin</span>
          {unreadCount > 0 && (
            <Badge className="ml-auto h-4 min-w-4 px-1 text-[10px] bg-[#C9A96E] text-[#1a1008] hover:bg-[#C9A96E]">
              {unreadCount}
            </Badge>
          )}
        </header>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLink({
  item,
  active,
  badge,
  onClick,
}: {
  item: (typeof navItems)[0];
  active: boolean;
  badge?: number;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-[#C9A96E]/10 font-medium text-[#1a1008]"
          : "text-[#6b5a4a] hover:bg-[#f0ede8] hover:text-[#1a1008]"
      }`}
    >
      <Icon className={`h-4 w-4 flex-shrink-0 ${active ? "text-[#C9A96E]" : ""}`} />
      <span className="flex-1">{item.label}</span>
      {!!badge && (
        <Badge className="h-4 min-w-4 px-1 text-[10px] bg-[#C9A96E] text-[#1a1008] hover:bg-[#C9A96E]">
          {badge}
        </Badge>
      )}
    </Link>
  );
}
