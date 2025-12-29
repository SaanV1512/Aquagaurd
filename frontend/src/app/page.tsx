"use client";

import Link from "next/link";

const featureHighlights = [
  {
    title: "One-click workflows",
    description:
      "Launch campaigns, blogs, newsroom recaps, and YouTube repurposing from a single canvas.",
  },
  {
    title: "Context-aware AI",
    description:
      "Upcoming: Train on your brand voice, pull real-time references, and keep every asset on-message.",
  },
  {
    title: "Infinite scale",
    description:
      "Upcoming: Collaborate across teams with version history, approval flows, and shareable AI briefs.",
  },
];

const stats = [
  { label: "Teams onboarded (not really)", value: "230+" },
  { label: "Campaigns launched", value: "12k" },
  { label: "Avg. time saved", value: "18 hrs" },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-b from-slate-950 via-slate-900 to-black" />
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-cyan-500/30 blur-[140px]" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-fuchsia-500/30 blur-[140px]" />
      </div>

      <div className="relative z-10">
        <header className="flex flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between lg:px-16">
          <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <div className="h-8 w-8 rounded-lg bg-white/10 text-center text-sm leading-8">
              AG
            </div>
            AquaGuard — Smart Water Monitoring
          </div>
          <nav className="flex flex-wrap items-center gap-6 text-sm text-slate-300">
            <Link href="#features" className="hover:text-white transition">
              Features
            </Link>
            <Link href="#automation" className="hover:text-white transition">
              Monitoring
            </Link>
            <Link href="/dashboard" className="hover:text-white transition">
              Dashboards
            </Link>
          </nav>
        </header>

        <main className="px-6 pb-24 pt-10 lg:px-16 lg:pt-20">
          <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.2em] text-slate-200">
                Early Warning System
              </div>

              <h1 className="mt-6 text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
                Detect abnormal water usage before losses escalate.
              </h1>

              <p className="mt-6 max-w-2xl text-lg text-slate-300">
                ML-powered monitoring for urban water networks that flags
                statistically abnormal consumption patterns and prioritizes
                inspection efforts.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link href="/dashboard">
                  <button className="rounded-full bg-white px-6 py-3 font-semibold text-slate-900">
                    View Dashboard
                  </button>
                </Link>
                <button className="rounded-full border border-white/30 px-6 py-3 font-semibold">
                  Learn More
                </button>
              </div>

              <div className="mt-12 grid gap-6 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-3xl font-semibold">{stat.value}</p>
                    <p className="text-sm uppercase tracking-wide text-slate-400">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
              <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300">
                Monitoring Preview
              </div>

              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-white/15 bg-slate-900/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                    Time Series
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    Actual vs Predicted Usage
                  </p>
                  <p className="text-sm text-slate-400">
                    Forecast-based anomaly detection
                  </p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-slate-900/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-300">
                    Residuals
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    Deviation Tracking
                  </p>
                  <p className="text-sm text-slate-400">
                    Persistent abnormal behavior detection
                  </p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-slate-900/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-amber-300">
                    Risk Scoring
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    Zone-wise Risk Ranking
                  </p>
                  <p className="text-sm text-slate-400">
                    Inspection prioritization support
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section
            id="features"
            className="mt-24 grid gap-8 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur md:grid-cols-3"
          >
            {featureHighlights.map((feature) => (
              <div key={feature.title}>
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
                  {feature.title}
                </div>
                <p className="mt-4 text-base text-slate-200">
                  {feature.description}
                </p>
              </div>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
