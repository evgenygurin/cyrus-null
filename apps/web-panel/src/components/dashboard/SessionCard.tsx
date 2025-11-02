import { formatDistanceToNow } from "date-fns";
import { Clock, ExternalLink, GitBranch, Square } from "lucide-react";
import type { Session } from "@/types";

interface SessionCardProps {
	session: Session;
}

export function SessionCard({ session }: SessionCardProps) {
	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "bg-green-500/10 text-green-600 border-green-500/20";
			case "thinking":
				return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
			case "paused":
				return "bg-gray-500/10 text-gray-600 border-gray-500/20";
			case "failed":
				return "bg-red-500/10 text-red-600 border-red-500/20";
			default:
				return "bg-blue-500/10 text-blue-600 border-blue-500/20";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "active":
				return (
					<div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-dot"></div>
				);
			case "thinking":
				return (
					<div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
				);
			default:
				return <div className="w-2 h-2 rounded-full bg-blue-500"></div>;
		}
	};

	return (
		<div className="bg-card rounded-lg border border-border p-4 hover:border-primary/50 transition-colors animate-fadeIn">
			<div className="flex items-start justify-between mb-3">
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-1">
						<h3 className="font-semibold text-lg">{session.issueId}</h3>
						<div
							className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}
						>
							{getStatusIcon(session.status)}
							<span className="capitalize">{session.status}</span>
						</div>
					</div>
					<p className="text-sm text-muted-foreground line-clamp-1">
						{session.issueTitle}
					</p>
				</div>

				<button
					type="button"
					className="p-2 hover:bg-muted rounded-lg transition-colors"
				>
					<ExternalLink className="w-4 h-4 text-muted-foreground" />
				</button>
			</div>

			<div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
				<div className="flex items-center gap-1.5">
					<GitBranch className="w-4 h-4" />
					<span>{session.repository}</span>
				</div>
				<div className="flex items-center gap-1.5">
					<Clock className="w-4 h-4" />
					<span>
						{formatDistanceToNow(new Date(session.startedAt), {
							addSuffix: true,
						})}
					</span>
				</div>
			</div>

			<div className="flex items-center justify-between pt-3 border-t border-border">
				<div className="flex items-center gap-2 text-sm">
					<div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot"></div>
					<span className="text-muted-foreground">
						{session.currentActivity}
					</span>
				</div>

				<button
					type="button"
					className="px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex items-center gap-1.5"
				>
					<Square className="w-3.5 h-3.5" />
					Stop
				</button>
			</div>
		</div>
	);
}
