import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;

	if (hours > 0) {
		return `${hours}h ${minutes}m ${secs}s`;
	}
	if (minutes > 0) {
		return `${minutes}m ${secs}s`;
	}
	return `${secs}s`;
}

export function getStatusColor(status: string): string {
	switch (status) {
		case "active":
			return "text-green-600";
		case "thinking":
			return "text-yellow-600";
		case "paused":
			return "text-gray-600";
		case "failed":
			return "text-red-600";
		case "completed":
			return "text-blue-600";
		default:
			return "text-gray-600";
	}
}

export function getPreviewUrl(): string {
	return (
		process.env.CG_PREVIEW_URL ||
		process.env.PREVIEW_URL ||
		"http://localhost:3000"
	);
}

export function isCodegenSandbox(): boolean {
	return Boolean(process.env.CG_PREVIEW_URL);
}
