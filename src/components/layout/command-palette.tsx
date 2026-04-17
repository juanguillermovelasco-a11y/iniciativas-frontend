"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Map,
  Grid3X3,
  DollarSign,
  List,
  Lightbulb,
  PlusCircle,
  CalendarCheck,
  Download,
  Settings,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";

const pages = [
  { title: "CEO Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Portfolio Roadmap", href: "/roadmap", icon: Map },
  { title: "Performance Heatmap", href: "/heatmap", icon: Grid3X3 },
  { title: "Financial Controller", href: "/financial", icon: DollarSign },
  { title: "All Initiatives", href: "/initiatives", icon: List },
  { title: "Draft Ideas", href: "/initiatives/drafts", icon: Lightbulb },
  { title: "Create Initiative", href: "/initiatives/create", icon: PlusCircle },
  { title: "Daily Tracking", href: "/tracking/daily", icon: CalendarCheck },
  { title: "Downloads", href: "/downloads", icon: Download },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const navigateTo = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
    setOpen(false);
  }, [theme, setTheme]);

  const handleLogout = useCallback(() => {
    setOpen(false);
    // TODO: wire up actual logout logic
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Pages">
          {pages.map((page) => (
            <CommandItem
              key={page.href}
              onSelect={() => navigateTo(page.href)}
            >
              <page.icon className="mr-2 h-4 w-4" />
              <span>{page.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem onSelect={toggleTheme}>
            {theme === "dark" ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Moon className="mr-2 h-4 w-4" />
            )}
            <span>Toggle dark mode</span>
          </CommandItem>
          <CommandItem onSelect={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
