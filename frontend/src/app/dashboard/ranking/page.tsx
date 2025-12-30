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
  risk_status: string;
  last_updated: string;
}

const getRiskColor = (riskLevel: string) => {
  switch (riskLevel) {
    case "High": return "text-red-400 bg-red-500/10 border-red-500/20";
    case "Medium": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "Low": return "text-green-400 bg-green-500/10 border-green-500/20";
    default: return "text-slate-400 bg-slate-500/10 border-slate-500/20";
  }
};

const getPriorityIcon = (priority: number) => {
  if (priority === 1) return "🥇";
  if (priority === 2) return "🥈";
  if (priority === 3) return "🥉";
  return `#${priority}`;
};

export default function RankingPage() {
  const [ranking, setRanking] = useState<RegionRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        // Use the live ranking endpoint instead of historical data
        const response = await fetch("http://127.0.0.1:8000/live/ranking");
        if (!response.ok) throw new Error("Failed to fetch live ranking data");
        const data = await response.json();
        setRanking(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
    // Refresh every 10 seconds for live updates
    const interval = setInterval(fetchRanking, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-linear-to-b from-slate-950 via-slate-900 to-black" />
          <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-cyan-500/30 blur-[140px]" />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="mt-4 text-slate-300">Loading inspection priority ranking...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-linear-to-b from-slate-950 via-slate-900 to-black" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-400 text-lg">Error: {error}</p>
            <Link href="/dashboard" className="mt-4 inline-block px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition">
              Back to Dashboard
            </Link>
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
            <Link href="/dashboard" className="hover:text-white transition">
              Historical Analysis
            </Link>
            <span className="text-white font-semibold">Inspection Ranking</span>
          </nav>
        </header>

        {/* Main Content */}
        <main className="px-6 pb-24 pt-10 lg:px-16">
          {/* Title Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Link href="/dashboard" className="text-cyan-400 hover:text-white transition">
                ← Back to Dashboard
              </Link>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 px-4 py-1 text-xs uppercase tracking-[0.2em] text-cyan-400 mb-6">
              🔴 Live Inspection Priority Ranking
            </div>

            <h1 className="text-4xl font-semibold leading-tight md:text-5xl mb-4">
              Real-Time Regional Inspection Priorities
            </h1>

            <p className="text-lg text-slate-300 max-w-3xl mx-auto">
              Live ranking based on current risk analysis. Regions ranked by priority score combining
              recent peak risk, persistence, and current conditions. Updates every 10 seconds.
            </p>
          </div>

          {/* Priority Ranking Table */}
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden mb-12">
            <div className="p-8 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300">
                  Live Inspection Queue
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Live Updates • Last: {ranking.length > 0 ? new Date(ranking[0].last_updated).toLocaleTimeString() : 'Loading...'}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-6 text-sm font-medium uppercase tracking-[0.2em] text-slate-300">
                      Priority
                    </th>
                    <th className="text-left p-6 text-sm font-medium uppercase tracking-[0.2em] text-slate-300">
                      Region
                    </th>
                    <th className="text-left p-6 text-sm font-medium uppercase tracking-[0.2em] text-slate-300">
                      Risk Level
                    </th>
                    <th className="text-left p-6 text-sm font-medium uppercase tracking-[0.2em] text-slate-300">
                      Current Risk
                    </th>
                    <th className="text-left p-6 text-sm font-medium uppercase tracking-[0.2em] text-slate-300">
                      Peak Risk (14d)
                    </th>
                    <th className="text-left p-6 text-sm font-medium uppercase tracking-[0.2em] text-slate-300">
                      Persistence
                    </th>
                    <th className="text-left p-6 text-sm font-medium uppercase tracking-[0.2em] text-slate-300">
                      Priority Score
                    </th>
                    <th className="text-left p-6 text-sm font-medium uppercase tracking-[0.2em] text-slate-300">
                      Status
                    </th>
                    <th className="text-left p-6 text-sm font-medium uppercase tracking-[0.2em] text-slate-300">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((region, index) => (
                    <tr
                      key={region.region}
                      className={`border-b border-white/5 hover:bg-white/5 transition-colors ${index < 3 ? 'bg-white/2' : ''
                        }`}
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getPriorityIcon(region.inspection_priority)}</span>
                          <span className="font-bold text-lg">#{region.inspection_priority}</span>
                        </div>
                      </td>

                      <td className="p-6">
                        <Link
                          href={`/dashboard/${region.region}`}
                          className="font-semibold text-lg hover:text-cyan-400 transition-colors"
                        >
                          {region.region}
                        </Link>
                      </td>

                      <td className="p-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(region.risk_level)}`}>
                          {region.risk_level}
                        </span>
                      </td>

                      <td className="p-6">
                        <span className="font-semibold text-lg">
                          {region.current_risk?.toFixed(1) || '0.0'}
                        </span>
                      </td>

                      <td className="p-6">
                        <span className="font-semibold text-lg">
                          {region.recent_peak_risk?.toFixed(1) || '0.0'}
                        </span>
                      </td>

                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{region.persistence_days}</span>
                          <span className="text-sm text-slate-400">days</span>
                        </div>
                      </td>

                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-xl text-white">
                            {region.priority_score?.toFixed(1) || '0.0'}
                          </span>
                          <div className="w-20 bg-slate-800 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${region.priority_score >= 70 ? "bg-red-400" :
                                region.priority_score >= 40 ? "bg-amber-400" : "bg-green-400"
                                }`}
                              style={{ width: `${Math.min(region.priority_score, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      <td className="p-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${region.risk_status === "elevated" ? "text-amber-400 bg-amber-500/20 border-amber-500/30" :
                            region.risk_status === "new_elevation" ? "text-red-400 bg-red-500/20 border-red-500/30" :
                              "text-green-400 bg-green-500/20 border-green-500/30"
                          }`}>
                          {region.risk_status === "normal" ? "Normal" :
                            region.risk_status === "elevated" ? "⚠️ Elevated" : "🆕 New Alert"}
                        </span>
                      </td>

                      <td className="p-6">
                        <Link
                          href={`/dashboard/${region.region}`}
                          className="inline-flex items-center px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 hover:text-white transition-all"
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top 3 Priorities Highlight */}
          <div className="grid gap-6 lg:grid-cols-3 mb-12">
            {ranking.slice(0, 3).map((region, index) => (
              <Link
                key={region.region}
                href={`/dashboard/${region.region}`}
                className="group"
              >
                <div className={`rounded-3xl border p-8 backdrop-blur transition-all duration-300 hover:scale-105 ${index === 0 ? "border-red-500/30 bg-red-500/10" :
                  index === 1 ? "border-amber-500/30 bg-amber-500/10" :
                    "border-cyan-500/30 bg-cyan-500/10"
                  }`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{getPriorityIcon(region.inspection_priority)}</span>
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${index === 0 ? "bg-red-500/20 text-red-400" :
                      index === 1 ? "bg-amber-500/20 text-amber-400" :
                        "bg-cyan-500/20 text-cyan-400"
                      }`}>
                      {index === 0 ? "URGENT" : index === 1 ? "HIGH" : "ELEVATED"}
                    </span>
                  </div>

                  <h3 className="text-2xl font-semibold mb-2 group-hover:text-white transition-colors">
                    {region.region} Region
                  </h3>

                  <p className="text-slate-400 mb-4">
                    {index === 0 ? "Requires immediate inspection" :
                      index === 1 ? "Schedule inspection within 24-48 hours" :
                        "Monitor closely, prepare for inspection"}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-400">Priority Score</span>
                      <span className="font-bold text-lg">{region.priority_score?.toFixed(1) || '0.0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-400">Risk Level</span>
                      <span className={`font-semibold ${region.risk_level === "High" ? "text-red-400" :
                        region.risk_level === "Medium" ? "text-amber-400" : "text-green-400"
                        }`}>
                        {region.risk_level}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Explanation */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300 mb-6">
              Priority Scoring Methodology
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Scoring Components</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <span className="text-sm">
                      <strong>Recent Peak Risk (50%)</strong> - Highest risk in last 14 days
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                    <span className="text-sm">
                      <strong>Persistence (30%)</strong> - Days with elevated risk
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                    <span className="text-sm">
                      <strong>Current Risk (20%)</strong> - Most recent risk score
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Inspection Guidelines</h4>
                <div className="space-y-2 text-sm text-slate-300">
                  <p><strong className="text-red-400">Score 70+:</strong> Immediate inspection required</p>
                  <p><strong className="text-amber-400">Score 40-70:</strong> Schedule within 24-48 hours</p>
                  <p><strong className="text-green-400">Score 0-40:</strong> Continue monitoring</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
