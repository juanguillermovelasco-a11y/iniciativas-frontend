"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  Map,
  Grid3X3,
  DollarSign,
  Lightbulb,
  List,
  PlusCircle,
  CalendarCheck,
  ClipboardList,
  MessageSquare,
  Bot,
  Download,
  Settings,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const navItems = [
  {
    group: "Analytics",
    items: [
      { title: "CEO Dashboard", href: "/", icon: LayoutDashboard },
      { title: "Portfolio Roadmap", href: "/roadmap", icon: Map },
      { title: "Performance Heatmap", href: "/heatmap", icon: Grid3X3 },
      { title: "Financial Controller", href: "/financial", icon: DollarSign },
    ],
  },
  {
    group: "Initiatives",
    items: [
      { title: "All Initiatives", href: "/initiatives", icon: List },
      { title: "Draft Ideas", href: "/initiatives/drafts", icon: Lightbulb },
      { title: "Create New", href: "/initiatives/create", icon: PlusCircle },
    ],
  },
  {
    group: "Tracking",
    items: [
      { title: "Daily Tracking", href: "/tracking/daily", icon: CalendarCheck },
      { title: "Initiative Tracking", href: "/tracking/initiatives", icon: ClipboardList },
    ],
  },
  {
    group: "Collaborate",
    items: [
      { title: "Feedback", href: "/feedback", icon: MessageSquare },
      { title: "AI Assistant", href: "/assistant", icon: Bot },
    ],
  },
  {
    group: "Tools",
    items: [
      { title: "Downloads", href: "/downloads", icon: Download },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-3">
          <BarChart3 className="h-7 w-7 text-sidebar-primary" />
          <span className="text-lg font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            Iniciativas
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {navItems.map((group) => (
          <SidebarGroup key={group.group}>
            <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={
                        item.href === "/"
                          ? pathname === "/"
                          : pathname.startsWith(item.href)
                      }
                      tooltip={item.title}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarSeparator />
        <div className="flex items-center justify-between pt-2 group-data-[collapsible=icon]:justify-center">
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
              "relative inline-flex h-8 w-8 items-center justify-center rounded-lg",
              "text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </button>
          <button
            type="button"
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-lg",
              "text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
              "group-data-[collapsible=icon]:hidden"
            )}
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Log out</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
