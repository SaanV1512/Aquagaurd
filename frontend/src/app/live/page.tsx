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

export default function LiveRiskMonitoring() {
    const [liveData, setLiveData] = useState<LiveRiskData[]>([]);
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

            // Store historical data for charts (keep last 20 points per region)
            setHistoricalData(prev => {
                const updated = { ...prev };
                liveData.forEach((data: LiveRiskData) => {
                    if (!updated[data.region]) updated[data.region] = [];
                    updated[data.region].push(data);
                    if (updated[data.region].length > 20) {
                        updated[data.region] = updated[data.region].slice(-20);
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

    const highRiskRegions = liveData.filter(d => d.risk_score >= 70).length;
    const mediumRiskRegions = liveData.filter(d => d.risk_score >= 50 && d.risk_score < 70).length;
    const totalConsumption = liveData.reduce((sum, d) => sum + d.consumption, 0);

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
                    <div className="grid gap-6 md:grid-cols-4 mb-12">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                            <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300 mb-2">
                                High Risk Regions
                            </div>
                            <div className="text-3xl font-semibold text-red-400">
                                {highRiskRegions}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                Require immediate inspection
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                            <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300 mb-2">
                                Medium Risk Regions
                            </div>
                            <div className="text-3xl font-semibold text-amber-400">
                                {mediumRiskRegions}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                Enhanced monitoring needed
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                            <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300 mb-2">
                                Total Consumption
                            </div>
                            <div className="text-3xl font-semibold text-cyan-400">
                                {totalConsumption.toLocaleString()}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                Liters per day (current)
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                            <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300 mb-2">
                                Elevated Risk Periods
                            </div>
                            <div className="text-3xl font-semibold text-fuchsia-400">
                                {elevatedRisks.length}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                Active monitoring required
                            </div>
                        </div>
                    </div>

                    {/* Live Risk Monitoring Grid */}
                    <div className="grid gap-6 lg:grid-cols-2 mb-12">
                        {liveData.map((data, index) => {
                            const regionHistory = historicalData[data.region] || [];
                            const maxConsumption = Math.max(...regionHistory.map(d => d.consumption), data.consumption);
                            const maxRisk = Math.max(...regionHistory.map(d => d.risk_score), data.risk_score);

                            return (
                                <div key={index} className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-2xl font-semibold">{data.region} Region</h3>
                                        <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getRiskStatusColor(data.risk_status)}`}>
                                            {data.risk_status === "normal" ? "Normal" :
                                                data.risk_status === "elevated" ? "⚠️ Elevated Risk" : "🆕 New Risk"}
                                        </div>
                                    </div>

                                    {/* Current Metrics */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300 mb-2">
                                                Risk Score
                                            </div>
                                            <div className={`text-3xl font-semibold ${getRiskColor(data.risk_score)}`}>
                                                {data.risk_score}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {getRiskLevel(data.risk_score)}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300 mb-2">
                                                Consumption
                                            </div>
                                            <div className="text-3xl font-semibold text-cyan-400">
                                                {data.consumption.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                Liters/day
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mini Charts */}
                                    <div className="space-y-4">
                                        {/* Risk Score Trend */}
                                        <div>
                                            <div className="text-sm font-medium text-slate-300 mb-2">Risk Score Trend (Last 20 readings)</div>
                                            <div className="flex items-end gap-1 h-16">
                                                {regionHistory.slice(-15).map((point, i) => {
                                                    const height = maxRisk > 0 ? (point.risk_score / maxRisk) * 100 : 0;
                                                    return (
                                                        <div
                                                            key={i}
                                                            className={`flex-1 rounded-t ${point.risk_score >= 70 ? "bg-red-400" :
                                                                    point.risk_score >= 50 ? "bg-amber-400" :
                                                                        point.risk_score >= 30 ? "bg-yellow-400" : "bg-green-400"
                                                                }`}
                                                            style={{ height: `${Math.max(height, 5)}%` }}
                                                            title={`Risk: ${point.risk_score} at ${new Date(point.timestamp).toLocaleTimeString()}`}
                                                        ></div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Consumption Trend */}
                                        <div>
                                            <div className="text-sm font-medium text-slate-300 mb-2">Consumption Trend</div>
                                            <div className="flex items-end gap-1 h-12">
                                                {regionHistory.slice(-15).map((point, i) => {
                                                    const height = maxConsumption > 0 ? (point.consumption / maxConsumption) * 100 : 0;
                                                    return (
                                                        <div
                                                            key={i}
                                                            className="flex-1 bg-cyan-400 rounded-t"
                                                            style={{ height: `${Math.max(height, 5)}%` }}
                                                            title={`Consumption: ${point.consumption.toLocaleString()}L at ${new Date(point.timestamp).toLocaleTimeString()}`}
                                                        ></div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Risk Information */}
                                    {data.risk_status !== "normal" && data.risk_info && (
                                        <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                                            <div className="text-sm font-medium text-amber-400 mb-2">Risk Analysis</div>
                                            <div className="text-xs text-slate-300 space-y-1">
                                                {data.risk_info.type && <div>Pattern: {data.risk_info.type}</div>}
                                                {data.risk_info.severity && <div>Severity: {data.risk_info.severity}</div>}
                                                {data.risk_info.start_time && (
                                                    <div>Started: {new Date(data.risk_info.start_time).toLocaleString()}</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Elevated Risk Summary */}
                    {elevatedRisks.length > 0 && (
                        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-8 backdrop-blur mb-12">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-amber-400 text-2xl">⚠️</span>
                                <h3 className="text-xl font-semibold text-amber-400">
                                    {elevatedRisks.length} Region{elevatedRisks.length > 1 ? 's' : ''} Require Enhanced Monitoring
                                </h3>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {elevatedRisks.map((risk, index) => (
                                    <div key={index} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-white">{risk.region} Region</span>
                                            <span className={`text-sm font-medium ${risk.severity === "High" ? "text-red-400" :
                                                    risk.severity === "Medium" ? "text-amber-400" : "text-yellow-400"
                                                }`}>
                                                {risk.severity}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-300 space-y-1">
                                            <div>Pattern: {risk.type}</div>
                                            <div>Started: {new Date(risk.start_time).toLocaleString()}</div>
                                            <div>Est. Duration: {risk.pattern} pattern</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* System Status */}
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                        <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300 mb-6">
                            Monitoring System Status
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
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
                                <div className="text-3xl font-semibold text-cyan-400 mb-2">
                                    {liveData.length}
                                </div>
                                <div className="text-sm text-slate-400">Total Regions Monitored</div>
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