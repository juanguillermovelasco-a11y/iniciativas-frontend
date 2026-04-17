"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Map,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Animated counter hook                                              */
/* ------------------------------------------------------------------ */
function useCountUp(end: number, duration = 2000, startOnView = true) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!startOnView) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * end));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration, startOnView]);

  return { value, ref };
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function WelcomePage() {
  const stat1 = useCountUp(16);
  const stat2 = useCountUp(73); // will display as $7.3M
  const stat3 = useCountUp(4);
  const stat4 = useCountUp(85);

  return (
    <div className="relative overflow-hidden bg-background text-foreground">
      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <section
        className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"
        style={{
          background:
            "linear-gradient(170deg, oklch(0.17 0.04 155) 0%, oklch(0.10 0.02 155) 60%, oklch(0.05 0.01 0) 100%)",
        }}
      >
        {/* Subtle grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Animated glow behind icon */}
        <div className="relative mb-8">
          <div className="landing-glow absolute -inset-6 rounded-full bg-[oklch(0.55_0.15_150_/_0.25)] blur-2xl" />
          <BarChart3 className="relative h-16 w-16 text-[oklch(0.55_0.15_150)]" />
        </div>

        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
          Iniciativas
        </h1>

        <p className="mt-4 text-lg font-medium text-white/60">
          Strategic Initiative Management Platform
        </p>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/45">
          Monitor, track, and optimize your organization&apos;s strategic
          portfolio with real-time analytics and actionable insights.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "h-12 gap-2 rounded-xl bg-[oklch(0.45_0.12_150)] px-8 text-base font-semibold text-white hover:bg-[oklch(0.50_0.14_150)]"
            )}
          >
            Enter Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 rounded-xl border-white/20 bg-transparent px-8 text-base font-semibold text-white/80 hover:bg-white/10 hover:text-white"
            )}
          >
            View Demo
          </Link>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 flex flex-col items-center gap-2 text-white/30">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="landing-bounce h-6 w-px bg-white/30" />
        </div>
      </section>

      {/* ============================================================ */}
      {/*  STATS BAR                                                   */}
      {/* ============================================================ */}
      <section
        className="relative border-y border-white/5"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.12 0.02 155) 0%, oklch(0.15 0.03 155) 100%)",
        }}
      >
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px sm:grid-cols-4">
          {[
            { ref: stat1.ref, value: `${stat1.value}`, label: "Active Initiatives" },
            { ref: stat2.ref, value: `$${(stat2.value / 10).toFixed(1)}M`, label: "Total Benefits" },
            { ref: stat3.ref, value: `${stat3.value}`, label: "Workstreams" },
            { ref: stat4.ref, value: `${stat4.value}%`, label: "Data Quality" },
          ].map((stat, i) => (
            <div
              key={i}
              ref={stat.ref}
              className="landing-fade-in flex flex-col items-center justify-center px-6 py-10"
            >
              <span className="text-3xl font-bold tracking-tight text-white">
                {stat.value}
              </span>
              <span className="mt-1 text-sm text-white/50">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FEATURES GRID                                               */}
      {/* ============================================================ */}
      <section className="bg-background py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Everything you need to lead
          </h2>
          <p className="mt-3 text-center text-muted-foreground">
            A complete toolkit for strategic initiative management.
          </p>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: BarChart3,
                title: "Executive Analytics",
                desc: "CEO-level dashboards with real-time KPIs, portfolio health, and financial projections.",
              },
              {
                icon: Map,
                title: "Portfolio Roadmap",
                desc: "Interactive Gantt timeline with milestone tracking and overdue alerts across all initiatives.",
              },
              {
                icon: TrendingUp,
                title: "Performance Tracking",
                desc: "Heatmap analytics, completeness scoring, and data quality monitoring.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border bg-card p-8 transition-shadow hover:shadow-lg"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  BOTTOM CTA                                                  */}
      {/* ============================================================ */}
      <section
        className="px-6 py-24 text-center"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.15 0.03 155) 0%, oklch(0.17 0.04 155) 100%)",
        }}
      >
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Ready to get started?
        </h2>
        <p className="mt-3 text-white/50">
          Dive into your strategic portfolio now.
        </p>
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "mt-8 h-12 gap-2 rounded-xl bg-[oklch(0.45_0.12_150)] px-8 text-base font-semibold text-white hover:bg-[oklch(0.50_0.14_150)]"
          )}
        >
          Enter Dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* ============================================================ */}
      {/*  FOOTER                                                      */}
      {/* ============================================================ */}
      <footer className="border-t border-white/5 bg-[oklch(0.10_0.01_155)] px-6 py-10 text-center">
        <p className="text-sm text-white/40">
          Built with Next.js + Django REST Framework
        </p>
        <p className="mt-1 text-xs text-white/25">
          Iniciativas v2.0 — Strategic Initiative Management
        </p>
      </footer>

      {/* ============================================================ */}
      {/*  CSS ANIMATIONS (scoped keyframes)                           */}
      {/* ============================================================ */}
      <style jsx global>{`
        @keyframes landing-glow-pulse {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.15); }
        }
        .landing-glow {
          animation: landing-glow-pulse 3s ease-in-out infinite;
        }

        @keyframes landing-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        .landing-bounce {
          animation: landing-bounce 2s ease-in-out infinite;
        }

        @keyframes landing-fade-in-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .landing-fade-in {
          animation: landing-fade-in-up 0.8s ease-out both;
        }
      `}</style>
    </div>
  );
}
