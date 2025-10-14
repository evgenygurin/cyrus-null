export const MESSAGES = {
	OAUTH: {
		SUCCESS: "✅ Linear connected successfully!",
		FAILED: "❌ OAuth flow failed",
		BROWSER_OPEN_FAILED: "⚠️  Failed to open browser automatically",
		WAITING: "Waiting for OAuth callback...",
	},
	CONFIG: {
		MIGRATED: "📦 Migrated configuration from {from} to {to}",
		MIGRATION_FAILED: "⚠️  Failed to migrate config",
		LOAD_FAILED: "❌ Failed to load configuration",
		SAVE_FAILED: "❌ Failed to save configuration",
	},
	SUBSCRIPTION: {
		VALIDATING: "🔐 Validating subscription...",
		ACTIVE: "✅ Subscription active",
		INVALID: "❌ Subscription Invalid",
		EXPIRED: "Your subscription has expired or been cancelled",
	},
	REPOSITORY: {
		SETUP_START: "📁 Repository Setup",
		SETUP_SUCCESS: "✅ Repository configured successfully!",
		SETUP_FAILED: "❌ Repository setup failed",
	},
	GIT: {
		WORKTREE_EXISTS: "Worktree already exists at {path}, using existing",
		WORKTREE_CREATED: "Created git worktree at {path}",
		FETCH_FAILED: "⚠️  git fetch failed, proceeding with local branch",
	},
} as const;

export function formatMessage(
	template: string,
	values: Record<string, string>,
): string {
	return template.replace(/\{(\w+)\}/g, (_, key) => values[key] || "");
}
