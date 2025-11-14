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
			// Dynamic demo data that changes over time
			const now = Date.now();
			const minute = Math.floor(now / 60000) % 10; // Changes every minute

			// Generate dynamic stats with some variance
			const baseTotal = 42 + minute;
			const baseActive = Math.max(1, 3 + (minute % 3) - 1);
			const baseSuccess = 85 + (minute % 10);
			const baseDuration = 320 + minute * 15;

			const mockStats: Stats = {
				totalSessions: baseTotal,
				activeSessions: baseActive,
				successRate: baseSuccess,
				avgDuration: baseDuration,
			};

			// Dynamic session activities
			const activities = [
				"Analyzing code structure",
				"Reading documentation",
				"Writing unit tests",
				"Executing bash command",
				"Creating pull request",
				"Running tests",
				"Updating dependencies",
				"Fixing merge conflicts",
				"Reviewing code",
				"Deploying changes",
			];

			const repositories = [
				"backend-api",
				"frontend-app",
				"mobile-app",
				"docs-site",
				"auth-service",
			];
			const currentActivity = activities[minute % activities.length];

			const mockSessions: Session[] = [
				{
					id: "1",
					issueId: "CYR-123",
					issueTitle: "Fix authentication bug in JWT handler",
					repository: repositories[0],
					status: minute % 2 === 0 ? "active" : "thinking",
					startedAt: new Date(now - 300000 - minute * 30000).toISOString(),
					currentActivity: currentActivity,
				},
				{
					id: "2",
					issueId: "CYR-124",
					issueTitle: "Add user profile management feature",
					repository: repositories[1],
					status: minute % 3 === 0 ? "paused" : "active",
					startedAt: new Date(now - 600000 - minute * 45000).toISOString(),
					currentActivity: activities[(minute + 1) % activities.length],
				},
				baseActive >= 3
					? {
							id: "3",
							issueId: "CYR-125",
							issueTitle: "Optimize database query performance",
							repository: repositories[2],
							status: "active",
							startedAt: new Date(now - 900000 - minute * 20000).toISOString(),
							currentActivity: activities[(minute + 2) % activities.length],
						}
					: null,
				baseActive >= 4
					? {
							id: "4",
							issueId: "CYR-126",
							issueTitle: "Implement real-time notifications",
							repository: repositories[3],
							status: "thinking",
							startedAt: new Date(now - 1200000).toISOString(),
							currentActivity: "Planning implementation approach",
						}
					: null,
			].filter(Boolean) as Session[];

			// Dynamic activity feed
			const mockActivities: ActivityEvent[] = [
				{
					id: `activity-${minute}`,
					type: "session_start",
					message: `Started working on CYR-${123 + minute}: ${mockSessions[0]?.issueTitle || "New task"}`,
					timestamp: new Date(now - minute * 60000).toISOString(),
				},
				minute > 2
					? {
							id: `activity-${minute - 1}`,
							type: "pr_created",
							message: `Created PR #${45 + minute}: Implement feature improvements`,
							timestamp: new Date(now - (minute + 1) * 60000).toISOString(),
						}
					: null,
				minute > 4
					? {
							id: `activity-${minute - 2}`,
							type: "session_complete",
							message: `Completed CYR-${120 + (minute - 2)}: Update system documentation`,
							timestamp: new Date(now - (minute + 2) * 60000).toISOString(),
						}
					: null,
				minute > 6 && minute % 4 === 0
					? {
							id: `activity-${minute - 3}`,
							type: "error",
							message: `Session requires attention for CYR-${119 + (minute - 3)}: Build error detected`,
							timestamp: new Date(now - (minute + 3) * 60000).toISOString(),
						}
					: null,
				{
					id: `activity-old-${minute}`,
					type: "session_complete",
					message: `Completed CYR-${100 + minute}: Previous task finished successfully`,
					timestamp: new Date(now - (minute + 5) * 60000).toISOString(),
				},
			].filter(Boolean) as ActivityEvent[];

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

		// Setup polling for real-time updates (every 3 seconds for demo)
		const interval = setInterval(fetchDashboardData, 3000);

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
