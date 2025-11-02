export interface Session {
	id: string;
	issueId: string;
	issueTitle: string;
	repository: string;
	status: "active" | "thinking" | "paused" | "completed" | "failed";
	startedAt: string;
	currentActivity: string;
	endedAt?: string;
	claudeVersion?: string;
	workspacePath?: string;
	metrics?: {
		inputTokens: number;
		outputTokens: number;
		thinkingTokens: number;
		duration: number;
	};
}

export interface Stats {
	totalSessions: number;
	activeSessions: number;
	successRate: number;
	avgDuration: number;
}

export interface ActivityEvent {
	id: string;
	type:
		| "session_start"
		| "session_complete"
		| "pr_created"
		| "error"
		| "comment";
	message: string;
	timestamp: string;
	metadata?: Record<string, any>;
}

export interface Repository {
	id: string;
	name: string;
	repositoryPath: string;
	baseBranch: string;
	linearWorkspaceId: string;
	isActive: boolean;
	totalIssuesProcessed: number;
	successRate: number;
	lastActiveAt?: string;
}
