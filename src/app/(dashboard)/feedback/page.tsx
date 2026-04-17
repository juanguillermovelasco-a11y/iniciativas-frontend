"use client";

import { useState } from "react";
import {
  MessageSquare,
  Send,
  AlertCircle,
  Lightbulb,
  MessageCircle,
  HelpCircle,
  CheckCircle2,
  Info,
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Priority = "low" | "medium" | "high";
type Category = "bug" | "feature" | "general" | "question";
type Status = "Under Review" | "Planned" | "Acknowledged" | "Answered";

interface FeedbackEntry {
  id: number;
  category: Category;
  priority: Priority;
  subject: string;
  message: string;
  author: string;
  timeAgo: string;
  status: Status;
}

const categoryConfig: Record<
  Category,
  { label: string; icon: typeof AlertCircle }
> = {
  bug: { label: "Bug Report", icon: AlertCircle },
  feature: { label: "Feature Request", icon: Lightbulb },
  general: { label: "General Feedback", icon: MessageCircle },
  question: { label: "Question", icon: HelpCircle },
};

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-emerald-500" },
  medium: { label: "Medium", color: "bg-amber-500" },
  high: { label: "High", color: "bg-red-500" },
};

const statusConfig: Record<Status, { variant: "default" | "secondary" | "outline"; className: string }> = {
  "Under Review": { variant: "secondary", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
  Planned: { variant: "secondary", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  Acknowledged: { variant: "secondary", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" },
  Answered: { variant: "secondary", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" },
};

const initialFeedback: FeedbackEntry[] = [
  {
    id: 1,
    category: "bug",
    priority: "high",
    subject: "Heatmap KPI values not updating",
    message:
      "When I change the date range on the performance heatmap, the KPI values remain the same. I've tried refreshing but the issue persists across multiple browsers.",
    author: "Maria Garcia",
    timeAgo: "2 days ago",
    status: "Under Review",
  },
  {
    id: 2,
    category: "feature",
    priority: "medium",
    subject: "Add export to PDF for dashboards",
    message:
      "It would be great to have a one-click export to PDF option for the CEO dashboard and financial controller views. Currently we screenshot and paste into presentations.",
    author: "Carlos Rodriguez",
    timeAgo: "5 days ago",
    status: "Planned",
  },
  {
    id: 3,
    category: "general",
    priority: "low",
    subject: "Love the new dark mode, works great!",
    message:
      "Just wanted to say the dark mode implementation is excellent. The colors are easy on the eyes and all charts remain readable. Great work by the team!",
    author: "Ana Martinez",
    timeAgo: "1 week ago",
    status: "Acknowledged",
  },
  {
    id: 4,
    category: "question",
    priority: "medium",
    subject: "How do I add KPIs to an initiative?",
    message:
      "I created a new initiative but can't figure out how to attach KPIs to it. Is there a specific section for this or does it need to be done from the tracking page?",
    author: "Pedro Lopez",
    timeAgo: "1 week ago",
    status: "Answered",
  },
  {
    id: 5,
    category: "feature",
    priority: "high",
    subject: "Slack integration for milestone alerts",
    message:
      "We need milestone deadline alerts sent to our Slack channels. Our team lives in Slack and often misses the email notifications for upcoming deadlines.",
    author: "Sofia Chen",
    timeAgo: "2 weeks ago",
    status: "Under Review",
  },
];

export default function FeedbackPage() {
  const [feedbackList, setFeedbackList] =
    useState<FeedbackEntry[]>(initialFeedback);
  const [category, setCategory] = useState<Category | "">("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (!category || !subject.trim() || !message.trim()) return;

    const newEntry: FeedbackEntry = {
      id: Date.now(),
      category: category as Category,
      priority,
      subject: subject.trim(),
      message: message.trim(),
      author: "You",
      timeAgo: "Just now",
      status: "Under Review",
    };

    setFeedbackList([newEntry, ...feedbackList]);
    setCategory("");
    setSubject("");
    setMessage("");
    setPriority("medium");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">
            Feedback &amp; Comments
          </h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Share your thoughts, report issues, or suggest improvements
        </p>
      </div>

      {/* Success message */}
      {submitted && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Thank you! Your feedback has been submitted.
        </div>
      )}

      {/* New Feedback Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Submit New Feedback</CardTitle>
          <CardDescription>
            Let us know what you think or what needs attention
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(val) => setCategory(val as Category)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="general">General Feedback</SelectItem>
                  <SelectItem value="question">Question</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Brief description of your feedback"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Describe your feedback in detail..."
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <div className="flex gap-1.5">
                {(["low", "medium", "high"] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors ${
                      priority === p
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background text-foreground hover:bg-muted dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${priorityConfig[p].color}`}
                    />
                    {priorityConfig[p].label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!category || !subject.trim() || !message.trim()}
            >
              <Send className="mr-1.5 h-4 w-4" />
              Submit Feedback
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Feedback */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Recent Feedback
        </h2>

        <div className="space-y-3">
          {feedbackList.map((entry) => {
            const catConfig = categoryConfig[entry.category];
            const CatIcon = catConfig.icon;
            const priConfig = priorityConfig[entry.priority];
            const statConfig = statusConfig[entry.status];

            return (
              <Card key={entry.id}>
                <CardContent className="pt-0">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-2">
                      {/* Top row: badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <CatIcon className="h-3 w-3" />
                          {catConfig.label}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span
                            className={`h-2 w-2 rounded-full ${priConfig.color}`}
                          />
                          {priConfig.label}
                        </span>
                      </div>

                      {/* Subject + message */}
                      <div>
                        <p className="font-medium leading-snug">
                          {entry.subject}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                          {entry.message}
                        </p>
                      </div>

                      {/* Author + time */}
                      <p className="text-xs text-muted-foreground">
                        {entry.author} &middot; {entry.timeAgo}
                      </p>
                    </div>

                    {/* Status badge */}
                    <Badge
                      variant={statConfig.variant}
                      className={`shrink-0 ${statConfig.className}`}
                    >
                      {entry.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Coming Soon */}
      <Card className="border-dashed">
        <CardContent className="flex items-center gap-3 py-4">
          <Info className="h-5 w-5 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              Full feedback system coming soon
            </span>{" "}
            &mdash; email notifications, threaded replies, and status tracking
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
