export const DEFAULT_CONFIG = {
	SERVER_PORT: 3456,
	BASE_BRANCH: "main",
	SETUP_SCRIPT_TIMEOUT_MS: 5 * 60 * 1000,
	OAUTH_TIMEOUT_MS: 2 * 60 * 1000,
} as const;

export const DEFAULT_ALLOWED_TOOLS = [
	"Read(**)",
	"Edit(**)",
	"Bash(git:*)",
	"Bash(gh:*)",
	"Task",
	"WebFetch",
	"WebSearch",
	"TodoRead",
	"TodoWrite",
	"NotebookRead",
	"NotebookEdit",
	"Batch",
] as const;

export const DEFAULT_LABEL_PROMPTS = {
	debugger: {
		labels: ["Bug"],
	},
	builder: {
		labels: ["Feature", "Improvement"],
	},
	scoper: {
		labels: ["PRD"],
	},
	orchestrator: {
		labels: ["Orchestrator"],
		allowedTools: "coordinator" as const,
	},
} as const;

export const TOOL_PRESETS = {
	readOnly: [
		"Read(**)",
		"WebFetch",
		"WebSearch",
		"TodoRead",
		"NotebookRead",
		"Task",
		"Batch",
	],
	safe: [
		"Read(**)",
		"Edit(**)",
		"WebFetch",
		"WebSearch",
		"TodoRead",
		"TodoWrite",
		"NotebookRead",
		"NotebookEdit",
		"Task",
		"Batch",
	],
	all: [
		"Read(**)",
		"Edit(**)",
		"Bash",
		"WebFetch",
		"WebSearch",
		"TodoRead",
		"TodoWrite",
		"NotebookRead",
		"NotebookEdit",
		"Task",
		"Batch",
	],
} as const;
