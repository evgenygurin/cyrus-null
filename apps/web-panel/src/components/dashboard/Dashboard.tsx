"use client";

import {
	Activity,
	AlertCircle,
	CheckCircle2,
	Clock,
	TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { ActivityEvent, Session, Stats } from "@/types";
import { ActivityFeed } from "./ActivityFeed";
import { SessionCard } from "./SessionCard";
import { StatsCard } from "./StatsCard";

export default function Dashboard() {
	const [stats, setStats] = useState<Stats>({
		totalSessions: 0,
		activeSessions: 0,
		successRate: 0,
		avgDuration: 0,
	});

	const [sessions, setSessions] = useState<Session[]>([]);
	const [activities, setActivities] = useState<ActivityEvent[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchDashboardData = useCallback(async () => {
		try {
			// Simulate API calls - replace with actual API endpoints
			const mockStats: Stats = {
				totalSessions: 42,
				activeSessions: 3,
				successRate: 87.5,
				avgDuration: 324,
			};

			const mockSessions: Session[] = [
				{
					id: "1",
					issueId: "CYR-123",
					issueTitle: "Fix authentication bug",
					repository: "backend-api",
					status: "active",
					startedAt: new Date(Date.now() - 300000).toISOString(),
					currentActivity: "Executing bash command",
				},
				{
					id: "2",
					issueId: "CYR-124",
					issueTitle: "Add user profile feature",
					repository: "frontend-app",
					status: "thinking",
					startedAt: new Date(Date.now() - 600000).toISOString(),
					currentActivity: "Analyzing code structure",
				},
				{
					id: "3",
					issueId: "CYR-125",
					issueTitle: "Optimize database queries",
					repository: "backend-api",
					status: "active",
					startedAt: new Date(Date.now() - 900000).toISOString(),
					currentActivity: "Running tests",
				},
			];

			const mockActivities: ActivityEvent[] = [
				{
					id: "1",
					type: "session_start",
					message: "Started working on CYR-123: Fix authentication bug",
					timestamp: new Date(Date.now() - 300000).toISOString(),
				},
				{
					id: "2",
					type: "pr_created",
					message: "Created PR #45: Implement OAuth2 flow",
					timestamp: new Date(Date.now() - 600000).toISOString(),
				},
				{
					id: "3",
					type: "session_complete",
					message: "Completed CYR-120: Update documentation",
					timestamp: new Date(Date.now() - 900000).toISOString(),
				},
				{
					id: "4",
					type: "error",
					message: "Session failed for CYR-119: Build error detected",
					timestamp: new Date(Date.now() - 1200000).toISOString(),
				},
			];

			setStats(mockStats);
			setSessions(mockSessions);
			setActivities(mockActivities);
			setLoading(false);
		} catch (error) {
			console.error("Failed to fetch dashboard data:", error);
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		// Fetch initial data
		fetchDashboardData();

		// Setup polling for real-time updates
		const interval = setInterval(fetchDashboardData, 5000);

		return () => clearInterval(interval);
	}, [fetchDashboardData]);

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="flex flex-col items-center gap-4">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
					<p className="text-muted-foreground">Loading dashboard...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="border-b border-border bg-card">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground font-bold">
								C
							</div>
							<div>
								<h1 className="text-2xl font-bold">Cyrus Control Panel</h1>
								<p className="text-sm text-muted-foreground">
									AI Development Agent Monitor
								</p>
							</div>
						</div>

						<div className="flex items-center gap-2">
							<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
								<div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-dot"></div>
								<span className="text-sm font-medium">Agent Online</span>
							</div>
						</div>
					</div>
				</div>
			</header>

			<div className="container mx-auto px-4 py-6">
				{/* Stats Overview */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
					<StatsCard
						title="Total Sessions"
						value={stats.totalSessions.toString()}
						icon={<Activity className="w-5 h-5" />}
						trend="+12%"
						trendUp={true}
					/>
					<StatsCard
						title="Active Sessions"
						value={stats.activeSessions.toString()}
						icon={<TrendingUp className="w-5 h-5" />}
						iconColor="text-green-600"
					/>
					<StatsCard
						title="Success Rate"
						value={`${stats.successRate}%`}
						icon={<CheckCircle2 className="w-5 h-5" />}
						trend="+3%"
						trendUp={true}
						iconColor="text-blue-600"
					/>
					<StatsCard
						title="Avg Duration"
						value={`${Math.floor(stats.avgDuration / 60)}m ${stats.avgDuration % 60}s`}
						icon={<Clock className="w-5 h-5" />}
						trend="-15s"
						trendUp={true}
						iconColor="text-purple-600"
					/>
				</div>

				{/* Main Content */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Active Sessions */}
					<div className="lg:col-span-2 space-y-4">
						<div className="flex items-center justify-between">
							<h2 className="text-xl font-semibold">Active Sessions</h2>
							<div className="text-sm text-muted-foreground">
								{sessions.length} running
							</div>
						</div>

						<div className="space-y-3">
							{sessions.length > 0 ? (
								sessions.map((session) => (
									<SessionCard key={session.id} session={session} />
								))
							) : (
								<div className="flex flex-col items-center justify-center py-12 px-4 bg-card rounded-lg border border-border">
									<AlertCircle className="w-12 h-12 text-muted-foreground mb-3" />
									<p className="text-muted-foreground">No active sessions</p>
								</div>
							)}
						</div>
					</div>

					{/* Activity Feed */}
					<div className="space-y-4">
						<h2 className="text-xl font-semibold">Recent Activity</h2>
						<ActivityFeed activities={activities} />
					</div>
				</div>
			</div>
		</div>
	);
}
