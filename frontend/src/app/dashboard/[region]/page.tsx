"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Props {
  params: Promise<{ region: string }>;
}

interface TimeSeriesData {
  date: string;
  actual_usage: number;
  predicted_usage: number;
  risk_score: number;
  is_anomaly: boolean;
}

interface RiskAnalysis {
  region: string;
  current_risk_score: number;
  recent_peak_risk: number;
  average_risk_7d: number;
  recent_anomalies_30d: number;
  risk_trend: string;
  last_updated: string;
}

const getRiskColor = (score: number) => {
  if (score >= 70) return "text-red-400";
  if (score >= 40) return "text-amber-400";
  return "text-green-400";
};

const getRiskLevel = (score: number) => {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
};

export default function RegionDashboard({ params }: Props) {
  const [region, setRegion] = useState<string>("");
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const resolvedParams = await params;
        setRegion(resolvedParams.region);

        // Fetch time series data
        const timeSeriesResponse = await fetch(`http://127.0.0.1:8000/timeseries/${resolvedParams.region}`);
        if (!timeSeriesResponse.ok) throw new Error("Failed to fetch time series data");
        const timeSeriesData = await timeSeriesResponse.json();
        setTimeSeriesData(timeSeriesData);

        // Fetch risk analysis
        const riskResponse = await fetch(`http://127.0.0.1:8000/risk/${resolvedParams.region}`);
        if (!riskResponse.ok) throw new Error("Failed to fetch risk analysis");
        const riskData = await riskResponse.json();

        // Use the risk analysis data directly (it's already in the correct format)
        setRiskAnalysis(riskData);

      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [params]);

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
            <p className="mt-4 text-slate-300">Loading {region} region data...</p>
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

  const recentData = timeSeriesData?.slice(-30) || []; // Last 30 days
  const anomalies = recentData.filter(d => d?.is_anomaly) || [];

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
            <Link href="/dashboard" className="hover:text-white transition">
              Dashboard
            </Link>
            <span className="text-white font-semibold">{region} Region</span>
          </nav>
        </header>

        {/* Main Content */}
        <main className="px-6 pb-24 pt-10 lg:px-16">
          {/* Title Section */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <Link href="/dashboard" className="text-cyan-400 hover:text-white transition">
                ← Back to Dashboard
              </Link>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.2em] text-slate-200 mb-6">
              Regional Analysis
            </div>

            <h1 className="text-4xl font-semibold leading-tight md:text-5xl mb-4">
              {region} Region Overview
            </h1>

            {riskAnalysis && (
              <div className="flex items-center gap-4">
                <span className={`text-2xl font-bold ${getRiskColor(riskAnalysis.current_risk_score)}`}>
                  {getRiskLevel(riskAnalysis.current_risk_score)} Risk
                </span>
                <span className="text-slate-400">
                  Current Score: {riskAnalysis.current_risk_score?.toFixed(1) || '0.0'}
                </span>
              </div>
            )}
          </div>

          {/* Risk Summary Cards */}
          {riskAnalysis && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300 mb-2">
                  Current Risk
                </div>
                <div className={`text-3xl font-semibold ${getRiskColor(riskAnalysis.current_risk_score)}`}>
                  {riskAnalysis.current_risk_score?.toFixed(1) || '0.0'}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300 mb-2">
                  Peak Risk (14d)
                </div>
                <div className={`text-3xl font-semibold ${getRiskColor(riskAnalysis.recent_peak_risk)}`}>
                  {riskAnalysis.recent_peak_risk?.toFixed(1) || '0.0'}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300 mb-2">
                  Avg Risk (7d)
                </div>
                <div className={`text-3xl font-semibold ${getRiskColor(riskAnalysis.average_risk_7d)}`}>
                  {riskAnalysis.average_risk_7d?.toFixed(1) || '0.0'}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300 mb-2">
                  Anomalies (30d)
                </div>
                <div className="text-3xl font-semibold text-red-400">
                  {riskAnalysis.recent_anomalies_30d || 0}
                </div>
              </div>
            </div>
          )}

          {/* Time Series Visualization */}
          <div className="grid gap-8 lg:grid-cols-2 mb-12">
            {/* Usage Chart */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
              <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300 mb-4">
                Water Usage Trends (Last 30 Days)
              </div>

              <div className="space-y-4">
                {recentData.slice(-10).map((data, index) => {
                  const date = data?.date ? new Date(data.date).toLocaleDateString() : 'Unknown';
                  const actualPercent = recentData.length > 0 ?
                    ((data?.actual_usage || 0) / Math.max(...recentData.map(d => d?.actual_usage || 0))) * 100 : 0;
                  const predictedPercent = recentData.length > 0 ?
                    ((data?.predicted_usage || 0) / Math.max(...recentData.map(d => d?.actual_usage || 0))) * 100 : 0;

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">{date}</span>
                        <span className={data?.is_anomaly ? "text-red-400" : "text-slate-300"}>
                          {data?.is_anomaly ? "⚠️ Anomaly" : "Normal"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                          <span className="text-xs text-slate-400">Actual: {data.actual_usage?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div
                            className="bg-cyan-400 h-2 rounded-full"
                            style={{ width: `${actualPercent}%` }}
                          ></div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-fuchsia-400 rounded-full"></div>
                          <span className="text-xs text-slate-400">Predicted: {data.predicted_usage?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div
                            className="bg-fuchsia-400 h-2 rounded-full"
                            style={{ width: `${predictedPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Risk Score Chart */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
              <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300 mb-4">
                Risk Score Trends (Last 30 Days)
              </div>

              <div className="space-y-4">
                {recentData.slice(-10).map((data, index) => {
                  const date = data?.date ? new Date(data.date).toLocaleDateString() : 'Unknown';
                  const riskPercent = ((data?.risk_score || 0) / 100) * 100;

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">{date}</span>
                        <span className={`font-semibold ${getRiskColor(data?.risk_score || 0)}`}>
                          {data.risk_score?.toFixed(1) || '0.0'}
                        </span>
                      </div>

                      <div className="w-full bg-slate-800 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${(data?.risk_score || 0) >= 70 ? "bg-red-400" :
                            (data?.risk_score || 0) >= 40 ? "bg-amber-400" : "bg-green-400"
                            }`}
                          style={{ width: `${Math.max(riskPercent, 5)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Anomaly Analysis */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur mb-12">
            <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300 mb-6">
              Recent Anomaly Analysis
            </div>

            {anomalies.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {anomalies.slice(-6).map((anomaly, index) => (
                  <div key={index} className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-red-400">⚠️</span>
                      <span className="text-sm font-semibold text-red-400">Anomaly Detected</span>
                    </div>
                    <div className="text-xs text-slate-400 mb-2">
                      {anomaly?.date ? new Date(anomaly.date).toLocaleDateString() : 'Unknown'}
                    </div>
                    <div className="space-y-1 text-sm">
                      <div>Actual: {anomaly.actual_usage?.toLocaleString() || '0'}</div>
                      <div>Expected: {anomaly.predicted_usage?.toLocaleString() || '0'}</div>
                      <div className="text-red-400">
                        Deviation: {anomaly.actual_usage && anomaly.predicted_usage ?
                          ((anomaly.actual_usage - anomaly.predicted_usage) / anomaly.predicted_usage * 100).toFixed(1) : '0.0'}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-green-400 text-4xl mb-4">✅</div>
                <p className="text-slate-300">No anomalies detected in the last 30 days</p>
                <p className="text-sm text-slate-400 mt-2">Water consumption patterns appear normal</p>
              </div>
            )}
          </div>

          {/* Recommendations */}
          {riskAnalysis && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
              <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300 mb-6">
                Recommendations
              </div>

              <div className="space-y-4">
                {riskAnalysis && riskAnalysis.current_risk_score >= 70 && (
                  <div className="flex items-start gap-3 p-4 rounded-2xl border border-red-500/20 bg-red-500/10">
                    <span className="text-red-400 text-xl">🚨</span>
                    <div>
                      <h4 className="font-semibold text-red-400 mb-1">Immediate Inspection Required</h4>
                      <p className="text-sm text-slate-300">
                        High risk score detected. Schedule immediate field inspection to identify potential issues.
                      </p>
                    </div>
                  </div>
                )}

                {riskAnalysis && riskAnalysis.current_risk_score >= 40 && riskAnalysis.current_risk_score < 70 && (
                  <div className="flex items-start gap-3 p-4 rounded-2xl border border-amber-500/20 bg-amber-500/10">
                    <span className="text-amber-400 text-xl">⚠️</span>
                    <div>
                      <h4 className="font-semibold text-amber-400 mb-1">Enhanced Monitoring</h4>
                      <p className="text-sm text-slate-300">
                        Medium risk detected. Increase monitoring frequency and prepare for potential inspection.
                      </p>
                    </div>
                  </div>
                )}

                {riskAnalysis && riskAnalysis.recent_anomalies_30d > 3 && (
                  <div className="flex items-start gap-3 p-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
                    <span className="text-cyan-400 text-xl">📊</span>
                    <div>
                      <h4 className="font-semibold text-cyan-400 mb-1">Pattern Analysis</h4>
                      <p className="text-sm text-slate-300">
                        Multiple anomalies detected. Consider analyzing consumption patterns for systematic issues.
                      </p>
                    </div>
                  </div>
                )}

                {riskAnalysis && riskAnalysis.current_risk_score < 40 && riskAnalysis.recent_anomalies_30d <= 1 && (
                  <div className="flex items-start gap-3 p-4 rounded-2xl border border-green-500/20 bg-green-500/10">
                    <span className="text-green-400 text-xl">✅</span>
                    <div>
                      <h4 className="font-semibold text-green-400 mb-1">Normal Operation</h4>
                      <p className="text-sm text-slate-300">
                        Water consumption patterns are within normal ranges. Continue routine monitoring.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
