"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface RegionRisk {
  region: string;
  current_risk: number;
  recent_peak_risk: number;
  risk_level: "Low" | "Medium" | "High";
  persistence_days: number;
  priority_score: number;
  inspection_priority: number;
}

const getRiskColor = (riskLevel: string) => {
  switch (riskLevel) {
    case "High": return "text-red-400 bg-red-500/10 border-red-500/20";
    case "Medium": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "Low": return "text-green-400 bg-green-500/10 border-green-500/20";
    default: return "text-slate-400 bg-slate-500/10 border-slate-500/20";
  }
};

const getRiskIcon = (riskLevel: string) => {
  switch (riskLevel) {
    case "High": return "🔴";
    case "Medium": return "🟡";
    case "Low": return "🟢";
    default: return "⚪";
  }
};

export default function DashboardHome() {
  const [ranking, setRanking] = useState<RegionRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/ranking");
        if (!response.ok) throw new Error("Failed to fetch ranking data");
        const data = await response.json();
        setRanking(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
    // Refresh every 30 seconds
    const interval = setInterval(fetchRanking, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-linear-to-b from-slate-950 via-slate-900 to-black" />
          <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-cyan-500/30 blur-[140px]" />
          <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-fuchsia-500/30 blur-[140px]" />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="mt-4 text-slate-300">Loading regional risk data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-linear-to-b from-slate-950 via-slate-900 to-black" />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-400 text-lg">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-b from-slate-950 via-slate-900 to-black" />
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-cyan-500/30 blur-[140px]" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-fuchsia-500/30 blur-[140px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="flex flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between lg:px-16">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <div className="h-8 w-8 rounded-lg bg-white/10 text-center text-sm leading-8">
              AG
            </div>
            AquaGuard — Smart Water Monitoring
          </Link>
          <nav className="flex flex-wrap items-center gap-6 text-sm text-slate-300">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
            <Link href="/live" className="hover:text-white transition">
              🔴 Live Monitoring
            </Link>
            <Link href="/dashboard" className="text-white font-semibold">
              Historical Analysis
            </Link>
            <Link href="/dashboard/ranking" className="hover:text-white transition">
              Ranking
            </Link>
          </nav>
        </header>

        {/* Main Content */}
        <main className="px-6 pb-24 pt-10 lg:px-16">
          {/* Title Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.2em] text-slate-200 mb-6">
              Regional Risk Overview
            </div>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl mb-4">
              Water Consumption Risk Dashboard
            </h1>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto">
              AquaGuard monitors water consumption patterns to identify regions with sustained abnormal behavior and prioritize inspection efforts.
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300 mb-2">
                Total Regions
              </div>
              <div className="text-3xl font-semibold text-white">{ranking.length}</div>
            </div>

            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 backdrop-blur">
              <div className="text-sm font-medium uppercase tracking-[0.3em] text-red-300 mb-2">
                High Risk
              </div>
              <div className="text-3xl font-semibold text-red-400">
                {ranking.filter(r => r.risk_level === "High").length}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6 backdrop-blur">
              <div className="text-sm font-medium uppercase tracking-[0.3em] text-amber-300 mb-2">
                Medium Risk
              </div>
              <div className="text-3xl font-semibold text-amber-400">
                {ranking.filter(r => r.risk_level === "Medium").length}
              </div>
            </div>

            <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-6 backdrop-blur">
              <div className="text-sm font-medium uppercase tracking-[0.3em] text-green-300 mb-2">
                Low Risk
              </div>
              <div className="text-3xl font-semibold text-green-400">
                {ranking.filter(r => r.risk_level === "Low").length}
              </div>
            </div>
          </div>

          {/* Regional Risk Cards */}
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {ranking.map((region) => (
              <Link
                key={region.region}
                href={`/dashboard/${region.region}`}
                className="group"
              >
                <div className={`rounded-3xl border p-6 backdrop-blur transition-all duration-300 hover:scale-105 hover:border-white/30 ${getRiskColor(region.risk_level)}`}>
                  {/* Priority Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getRiskIcon(region.risk_level)}</span>
                      <span className="text-xs uppercase tracking-[0.2em] font-medium">
                        Priority #{region.inspection_priority}
                      </span>
                    </div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {region.risk_level} Risk
                    </div>
                  </div>

                  {/* Region Name */}
                  <h3 className="text-2xl font-semibold mb-4 group-hover:text-white transition-colors">
                    {region.region} Region
                  </h3>

                  {/* Risk Metrics */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Current Risk</span>
                      <span className="font-semibold">{region.current_risk?.toFixed(1) || '0.0'}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Peak Risk (14d)</span>
                      <span className="font-semibold">{region.recent_peak_risk?.toFixed(1) || '0.0'}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Persistence</span>
                      <span className="font-semibold">{region.persistence_days || 0} days</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <span className="text-sm text-slate-400">Priority Score</span>
                      <span className="font-bold text-lg">{region.priority_score?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>

                  {/* Action Indicator */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">
                        {region.risk_level === "High" ? "Immediate inspection recommended" :
                          region.risk_level === "Medium" ? "Monitor closely" :
                            "Normal operation"}
                      </span>
                      <span className="text-cyan-400 group-hover:text-white transition-colors">
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Explanation Panel */}
          <div className="mt-16 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300 mb-4">
              Understanding Risk Scores
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Priority Ranking</h4>
                <p className="text-sm text-slate-400">
                  Regions are ranked by a combination of recent peak risk (50%), persistence (30%), and current risk (20%). Higher scores indicate greater need for inspection.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Risk Levels</h4>
                <p className="text-sm text-slate-400">
                  <span className="text-red-400">High (70+)</span>: Immediate attention needed<br />
                  <span className="text-amber-400">Medium (40-70)</span>: Monitor closely<br />
                  <span className="text-green-400">Low (0-40)</span>: Normal operation
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Persistence</h4>
                <p className="text-sm text-slate-400">
                  Number of consecutive days with elevated risk. Sustained abnormal behavior is more concerning than single-day spikes.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
