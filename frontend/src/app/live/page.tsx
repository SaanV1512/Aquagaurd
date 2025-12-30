"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface LiveRiskData {
    region: string;
    timestamp: string;
    consumption: number;
    risk_status: "normal" | "elevated" | "new_elevation";
    risk_score: number;
    risk_info: {
        type?: string;
        severity?: string;
        start_time?: string;
        duration_hours?: number;
        pattern?: string;
    };
}

interface LiveRanking {
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

interface ElevatedRisk {
    region: string;
    type: string;
    start_time: string;
    estimated_end: string;
    severity: "Low" | "Medium" | "High";
    pattern: string;
}

const getRiskColor = (score: number) => {
    if (score >= 70) return "text-red-400";
    if (score >= 50) return "text-amber-400";
    if (score >= 30) return "text-yellow-400";
    return "text-green-400";
};

const getRiskBgColor = (score: number) => {
    if (score >= 70) return "bg-red-400";
    if (score >= 50) return "bg-amber-400";
    if (score >= 30) return "bg-yellow-400";
    return "bg-green-400";
};

const getRiskLevel = (score: number) => {
    if (score >= 70) return "High Risk";
    if (score >= 50) return "Medium Risk";
    if (score >= 30) return "Elevated";
    return "Normal";
};

const getRiskStatusColor = (status: string) => {
    switch (status) {
        case "elevated": return "text-amber-400 bg-amber-500/20 border-amber-500/30";
        case "new_elevation": return "text-red-400 bg-red-500/20 border-red-500/30";
        default: return "text-green-400 bg-green-500/20 border-green-500/30";
    }
};

const getPriorityColor = (priority: number) => {
    if (priority <= 2) return "text-red-400 bg-red-500/20";
    if (priority <= 4) return "text-amber-400 bg-amber-500/20";
    return "text-green-400 bg-green-500/20";
};

export default function LiveRiskMonitoring() {
    const [liveData, setLiveData] = useState<LiveRiskData[]>([]);
    const [liveRanking, setLiveRanking] = useState<LiveRanking[]>([]);
    const [elevatedRisks, setElevatedRisks] = useState<ElevatedRisk[]>([]);
    const [historicalData, setHistoricalData] = useState<{ [key: string]: LiveRiskData[] }>({});
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<string>("");

    const fetchLiveData = async () => {
        try {
            // Fetch current risk data
            const liveResponse = await fetch("http://127.0.0.1:8000/live/current");
            const liveData = await liveResponse.json();
            setLiveData(liveData);

            // Fetch live ranking
            const rankingResponse = await fetch("http://127.0.0.1:8000/live/ranking");
            const rankingData = await rankingResponse.json();
            setLiveRanking(rankingData);

            // Store historical data for charts (keep last 30 points per region)
            setHistoricalData(prev => {
                const updated = { ...prev };
                liveData.forEach((data: LiveRiskData) => {
                    if (!updated[data.region]) updated[data.region] = [];
                    updated[data.region].push(data);
                    if (updated[data.region].length > 30) {
                        updated[data.region] = updated[data.region].slice(-30);
                    }
                });
                return updated;
            });

            // Fetch elevated risk regions
            const elevatedResponse = await fetch("http://127.0.0.1:8000/live/elevated");
            const elevatedData = await elevatedResponse.json();
            setElevatedRisks(elevatedData);

            setLastUpdate(new Date().toLocaleTimeString());
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch live risk data:", error);
        }
    };

    useEffect(() => {
        fetchLiveData();

        // Update every 10 seconds for live monitoring
        const interval = setInterval(fetchLiveData, 10000);

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
                        <p className="mt-4 text-slate-300">Loading live risk monitoring...</p>
                    </div>
                </div>
            </div>
        );
    }

    const highRiskRegions = liveRanking.filter(d => d.current_risk >= 70).length;
    const mediumRiskRegions = liveRanking.filter(d => d.current_risk >= 50 && d.current_risk < 70).length;
    const totalConsumption = liveData.reduce((sum, d) => sum + d.consumption, 0);
    const avgRiskScore = liveData.reduce((sum, d) => sum + d.risk_score, 0) / liveData.length;

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
                        AquaGuard — Live Risk Monitoring
                    </Link>
                    <nav className="flex flex-wrap items-center gap-6 text-sm text-slate-300">
                        <Link href="/dashboard" className="hover:text-white transition">
                            Historical Analysis
                        </Link>
                        <span className="text-white font-semibold">🔴 LIVE</span>
                        <span className="text-xs text-slate-400">Updates every 10s • Last: {lastUpdate}</span>
                    </nav>
                </header>

                {/* Main Content */}
                <main className="px-6 pb-24 pt-10 lg:px-16">
                    {/* Title Section */}
                    <div className="mb-12">
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 px-4 py-1 text-xs uppercase tracking-[0.2em] text-cyan-400 mb-6">
                            🔴 Live Risk Monitoring
                        </div>

                        <h1 className="text-4xl font-semibold leading-tight md:text-5xl mb-4">
                            Real-Time Water Supply Risk Assessment
                        </h1>

                        <p className="text-slate-400 text-lg mb-6">
                            Continuous monitoring of consumption patterns to identify regions requiring inspection priority
                        </p>
                    </div>

                    {/* System Overview Cards */}
                    <div className="grid gap-6 md:grid-cols-5 mb-12">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                            <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300 mb-2">
                                High Risk Regions
                            </div>
                            <div className="text-3xl font-semibold text-red-400">
                                {highRiskRegions}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                Immediate inspection
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                            <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300 mb-2">
                                Medium Risk
                            </div>
                            <div className="text-3xl font-semibold text-amber-400">
                                {mediumRiskRegions}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                Enhanced monitoring
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                            <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300 mb-2">
                                Current Daily Rate
                            </div>
                            <div className="text-3xl font-semibold text-cyan-400">
                                {totalConsumption.toLocaleString()}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                Liters/day (total)
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                            <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300 mb-2">
                                Avg Risk Score
                            </div>
                            <div className={`text-3xl font-semibold ${getRiskColor(avgRiskScore)}`}>
                                {avgRiskScore.toFixed(1)}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                System-wide average
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                            <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300 mb-2">
                                Active Alerts
                            </div>
                            <div className="text-3xl font-semibold text-fuchsia-400">
                                {elevatedRisks.length}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                Elevated risk periods
                            </div>
                        </div>
                    </div>

                    {/* Priority Ranking Table */}
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-semibold">Inspection Priority Ranking</h2>
                            <div className="text-sm text-slate-400">Sorted by priority score • Live updates</div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-4 px-4 text-sm font-medium text-slate-300">Priority</th>
                                        <th className="text-left py-4 px-4 text-sm font-medium text-slate-300">Region</th>
                                        <th className="text-left py-4 px-4 text-sm font-medium text-slate-300">Risk Level</th>
                                        <th className="text-left py-4 px-4 text-sm font-medium text-slate-300">Current Risk</th>
                                        <th className="text-left py-4 px-4 text-sm font-medium text-slate-300">Peak Risk</th>
                                        <th className="text-left py-4 px-4 text-sm font-medium text-slate-300">Persistence</th>
                                        <th className="text-left py-4 px-4 text-sm font-medium text-slate-300">Priority Score</th>
                                        <th className="text-left py-4 px-4 text-sm font-medium text-slate-300">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {liveRanking.map((region, index) => (
                                        <tr key={region.region} className="border-b border-white/5 hover:bg-white/5 transition">
                                            <td className="py-4 px-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getPriorityColor(region.inspection_priority)}`}>
                                                    {region.inspection_priority}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <Link href={`/dashboard/${region.region}`} className="font-semibold hover:text-cyan-400 transition">
                                                    {region.region}
                                                </Link>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${region.risk_level === "High" ? "bg-red-500/20 text-red-400" :
                                                    region.risk_level === "Medium" ? "bg-amber-500/20 text-amber-400" :
                                                        "bg-green-500/20 text-green-400"
                                                    }`}>
                                                    {region.risk_level}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className={`text-lg font-semibold ${getRiskColor(region.current_risk)}`}>
                                                    {region.current_risk.toFixed(1)}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className={`text-lg font-semibold ${getRiskColor(region.recent_peak_risk)}`}>
                                                    {region.recent_peak_risk.toFixed(1)}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-slate-300">
                                                    {region.persistence_days} day{region.persistence_days !== 1 ? 's' : ''}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-lg font-semibold text-fuchsia-400">
                                                    {region.priority_score.toFixed(1)}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskStatusColor(region.risk_status)}`}>
                                                    {region.risk_status === "normal" ? "Normal" :
                                                        region.risk_status === "elevated" ? "⚠️ Elevated" : "🆕 New Alert"}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Live Region Monitoring Grid */}
                    <div className="grid gap-6 lg:grid-cols-2 mb-12">
                        {liveRanking.slice(0, 4).map((regionRank, index) => {
                            const liveRegionData = liveData.find(d => d.region === regionRank.region);
                            if (!liveRegionData) return null;

                            const regionHistory = historicalData[regionRank.region] || [];
                            const maxConsumption = Math.max(...regionHistory.map(d => d.consumption), liveRegionData.consumption);
                            const maxRisk = Math.max(...regionHistory.map(d => d.risk_score), liveRegionData.risk_score);

                            return (
                                <div key={regionRank.region} className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getPriorityColor(regionRank.inspection_priority)}`}>
                                                {regionRank.inspection_priority}
                                            </div>
                                            <h3 className="text-2xl font-semibold">{regionRank.region} Region</h3>
                                        </div>
                                        <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getRiskStatusColor(liveRegionData.risk_status)}`}>
                                            {liveRegionData.risk_status === "normal" ? "Normal" :
                                                liveRegionData.risk_status === "elevated" ? "⚠️ Elevated Risk" : "🆕 New Risk"}
                                        </div>
                                    </div>

                                    {/* Current Metrics */}
                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        <div>
                                            <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300 mb-2">
                                                Risk Score
                                            </div>
                                            <div className={`text-3xl font-semibold ${getRiskColor(liveRegionData.risk_score)}`}>
                                                {liveRegionData.risk_score.toFixed(1)}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {getRiskLevel(liveRegionData.risk_score)}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300 mb-2">
                                                Daily Consumption
                                            </div>
                                            <div className="text-3xl font-semibold text-cyan-400">
                                                {liveRegionData.consumption.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                Liters/day
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300 mb-2">
                                                Priority
                                            </div>
                                            <div className="text-3xl font-semibold text-fuchsia-400">
                                                {regionRank.priority_score.toFixed(1)}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                Score
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mini Charts */}
                                    <div className="space-y-4">
                                        {/* Risk Score Trend */}
                                        <div>
                                            <div className="text-sm font-medium text-slate-300 mb-2">Risk Score Trend (Last 20 readings)</div>
                                            <div className="flex items-end gap-1 h-16 bg-slate-800/50 rounded-lg p-2">
                                                {regionHistory.slice(-20).map((point, i) => {
                                                    const height = maxRisk > 0 ? (point.risk_score / maxRisk) * 100 : 0;
                                                    return (
                                                        <div
                                                            key={i}
                                                            className={`flex-1 rounded-t ${getRiskBgColor(point.risk_score)}`}
                                                            style={{ height: `${Math.max(height, 5)}%` }}
                                                            title={`Risk: ${point.risk_score.toFixed(1)} at ${new Date(point.timestamp).toLocaleTimeString()}`}
                                                        ></div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Flow Rate Trend */}
                                        <div>
                                            <div className="text-sm font-medium text-slate-300 mb-2">Daily Consumption Trend</div>
                                            <div className="flex items-end gap-1 h-12 bg-slate-800/50 rounded-lg p-2">
                                                {regionHistory.slice(-20).map((point, i) => {
                                                    const height = maxConsumption > 0 ? (point.consumption / maxConsumption) * 100 : 0;
                                                    return (
                                                        <div
                                                            key={i}
                                                            className="flex-1 bg-cyan-400 rounded-t"
                                                            style={{ height: `${Math.max(height, 5)}%` }}
                                                            title={`Consumption: ${point.consumption.toLocaleString()}L/day at ${new Date(point.timestamp).toLocaleTimeString()}`}
                                                        ></div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Risk Information */}
                                    {liveRegionData.risk_status !== "normal" && liveRegionData.risk_info && (
                                        <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                                            <div className="text-sm font-medium text-amber-400 mb-2">Risk Analysis</div>
                                            <div className="text-xs text-slate-300 space-y-1">
                                                {liveRegionData.risk_info.type && <div>Pattern: {liveRegionData.risk_info.type}</div>}
                                                {liveRegionData.risk_info.severity && <div>Severity: {liveRegionData.risk_info.severity}</div>}
                                                {liveRegionData.risk_info.start_time && (
                                                    <div>Started: {new Date(liveRegionData.risk_info.start_time).toLocaleString()}</div>
                                                )}
                                                <div className="mt-2 text-amber-300">
                                                    <strong>Why this region is ranked #{regionRank.inspection_priority}:</strong>
                                                    <ul className="mt-1 text-xs space-y-1">
                                                        {regionRank.current_risk >= 70 && <li>• High current risk score ({regionRank.current_risk.toFixed(1)})</li>}
                                                        {regionRank.persistence_days > 0 && <li>• Sustained elevated consumption ({regionRank.persistence_days} days)</li>}
                                                        {liveRegionData.risk_status === "new_elevation" && <li>• New risk elevation detected</li>}
                                                        {regionRank.recent_peak_risk > regionRank.current_risk + 10 && <li>• Recent high peak risk ({regionRank.recent_peak_risk.toFixed(1)})</li>}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* System Status */}
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                        <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300 mb-6">
                            Monitoring System Status
                        </div>

                        <div className="grid gap-6 md:grid-cols-4">
                            <div className="text-center">
                                <div className="text-3xl font-semibold text-green-400 mb-2">
                                    {liveData.filter(d => d.risk_status === "normal").length}
                                </div>
                                <div className="text-sm text-slate-400">Regions Normal</div>
                            </div>

                            <div className="text-center">
                                <div className="text-3xl font-semibold text-amber-400 mb-2">
                                    {liveData.filter(d => d.risk_status === "elevated").length}
                                </div>
                                <div className="text-sm text-slate-400">Enhanced Monitoring</div>
                            </div>

                            <div className="text-center">
                                <div className="text-3xl font-semibold text-red-400 mb-2">
                                    {liveData.filter(d => d.risk_status === "new_elevation").length}
                                </div>
                                <div className="text-sm text-slate-400">New Alerts</div>
                            </div>

                            <div className="text-center">
                                <div className="text-3xl font-semibold text-cyan-400 mb-2">
                                    {liveData.length}
                                </div>
                                <div className="text-sm text-slate-400">Total Regions</div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/10">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">
                                    AquaGuard monitors consumption patterns to prioritize inspection efforts
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-green-400">System Online</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}