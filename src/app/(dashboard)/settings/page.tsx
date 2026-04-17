"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  PanelLeftClose,
  PanelLeft,
  User,
  Mail,
  Shield,
  LogOut,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function getStoredValue(key: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return localStorage.getItem(key) ?? fallback;
}

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Display preferences
  const [currency, setCurrency] = useState("$");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [itemsPerPage, setItemsPerPage] = useState("25");
  const [sidebarDefault, setSidebarDefault] = useState("expanded");

  // Notification toggles
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [milestoneReminders, setMilestoneReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    setMounted(true);
    setCurrency(getStoredValue("settings:currency", "$"));
    setDateFormat(getStoredValue("settings:dateFormat", "DD/MM/YYYY"));
    setItemsPerPage(getStoredValue("settings:itemsPerPage", "25"));
    setSidebarDefault(getStoredValue("settings:sidebarDefault", "expanded"));
    setEmailNotifs(getStoredValue("settings:emailNotifs", "true") === "true");
    setMilestoneReminders(
      getStoredValue("settings:milestoneReminders", "true") === "true"
    );
    setWeeklyDigest(
      getStoredValue("settings:weeklyDigest", "false") === "true"
    );
  }, []);

  function persist(key: string, value: string) {
    localStorage.setItem(`settings:${key}`, value);
  }

  function handleCurrency(val: string) {
    setCurrency(val);
    persist("currency", val);
  }

  function handleDateFormat(val: string | null) {
    if (val === null) return;
    setDateFormat(val);
    persist("dateFormat", val);
  }

  function handleItemsPerPage(val: string | null) {
    if (val === null) return;
    setItemsPerPage(val);
    persist("itemsPerPage", val);
  }

  function handleSidebar(val: string) {
    setSidebarDefault(val);
    persist("sidebarDefault", val);
  }

  function handleToggle(
    key: string,
    current: boolean,
    setter: (v: boolean) => void
  ) {
    const next = !current;
    setter(next);
    persist(key, String(next));
  }

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Application preferences and configuration
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
            <CardDescription>Customize the look and feel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="flex gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                >
                  <Sun className="mr-1.5 h-4 w-4" />
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="mr-1.5 h-4 w-4" />
                  Dark
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("system")}
                >
                  <Monitor className="mr-1.5 h-4 w-4" />
                  System
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Sidebar default state</Label>
              <div className="flex gap-2">
                <Button
                  variant={
                    sidebarDefault === "expanded" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleSidebar("expanded")}
                >
                  <PanelLeft className="mr-1.5 h-4 w-4" />
                  Expanded
                </Button>
                <Button
                  variant={
                    sidebarDefault === "collapsed" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleSidebar("collapsed")}
                >
                  <PanelLeftClose className="mr-1.5 h-4 w-4" />
                  Collapsed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Display */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Display</CardTitle>
            <CardDescription>
              Format and display preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency symbol</Label>
              <Input
                id="currency"
                value={currency}
                onChange={(e) => handleCurrency(e.target.value)}
                className="w-24"
              />
            </div>

            <div className="space-y-2">
              <Label>Date format</Label>
              <Select
                value={dateFormat}
                onValueChange={handleDateFormat}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Items per page</Label>
              <Select
                value={itemsPerPage}
                onValueChange={handleItemsPerPage}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notifications</CardTitle>
            <CardDescription>Manage alert preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-lg border border-input px-3 py-2 text-sm transition-colors hover:bg-muted"
              onClick={() =>
                handleToggle("emailNotifs", emailNotifs, setEmailNotifs)
              }
            >
              <span>Email notifications</span>
              <span
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                  emailNotifs ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    emailNotifs ? "translate-x-[18px]" : "translate-x-0.5"
                  }`}
                />
              </span>
            </button>

            <button
              type="button"
              className="flex w-full items-center justify-between rounded-lg border border-input px-3 py-2 text-sm transition-colors hover:bg-muted"
              onClick={() =>
                handleToggle(
                  "milestoneReminders",
                  milestoneReminders,
                  setMilestoneReminders
                )
              }
            >
              <span>Milestone reminders</span>
              <span
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                  milestoneReminders ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    milestoneReminders
                      ? "translate-x-[18px]"
                      : "translate-x-0.5"
                  }`}
                />
              </span>
            </button>

            <button
              type="button"
              className="flex w-full items-center justify-between rounded-lg border border-input px-3 py-2 text-sm transition-colors hover:bg-muted"
              onClick={() =>
                handleToggle("weeklyDigest", weeklyDigest, setWeeklyDigest)
              }
            >
              <span>Weekly digest</span>
              <span
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                  weeklyDigest ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    weeklyDigest ? "translate-x-[18px]" : "translate-x-0.5"
                  }`}
                />
              </span>
            </button>
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Username</span>
                <span className="ml-auto font-medium">admin</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email</span>
                <span className="ml-auto font-medium">admin@example.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Role</span>
                <span className="ml-auto font-medium">Administrator</span>
              </div>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button variant="outline" size="sm" disabled>
                      Change Password
                    </Button>
                  }
                />
                <TooltipContent>Coming soon</TooltipContent>
              </Tooltip>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => router.push("/login")}
              >
                <LogOut className="mr-1.5 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
