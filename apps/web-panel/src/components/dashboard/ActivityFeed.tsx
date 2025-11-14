import { formatDistanceToNow } from "date-fns";
import {
	AlertCircle,
	CheckCircle2,
	GitPullRequest,
	PlayCircle,
	XCircle,
} from "lucide-react";
import type { ActivityEvent } from "@/types";

interface ActivityFeedProps {
	activities: ActivityEvent[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
	const getActivityIcon = (type: string) => {
		switch (type) {
			case "session_start":
				return <PlayCircle className="w-4 h-4 text-blue-600" />;
			case "pr_created":
				return <GitPullRequest className="w-4 h-4 text-purple-600" />;
			case "session_complete":
				return <CheckCircle2 className="w-4 h-4 text-green-600" />;
			case "error":
				return <XCircle className="w-4 h-4 text-red-600" />;
			default:
				return <AlertCircle className="w-4 h-4 text-yellow-600" />;
		}
	};

	const getActivityColor = (type: string) => {
		switch (type) {
			case "session_start":
				return "bg-blue-500/10";
			case "pr_created":
				return "bg-purple-500/10";
			case "session_complete":
				return "bg-green-500/10";
			case "error":
				return "bg-red-500/10";
			default:
				return "bg-yellow-500/10";
		}
	};

	return (
		<div className="bg-card rounded-lg border border-border p-4">
			<div className="space-y-4">
				{activities.length > 0 ? (
					activities.map((activity, index) => (
						<div
							key={activity.id}
							className="flex gap-3 animate-fadeIn"
							style={{ animationDelay: `${index * 0.1}s` }}
						>
							<div
								className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${getActivityColor(activity.type)}`}
							>
								{getActivityIcon(activity.type)}
							</div>

							<div className="flex-1 min-w-0">
								<p className="text-sm text-foreground leading-relaxed">
									{activity.message}
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									{formatDistanceToNow(new Date(activity.timestamp), {
										addSuffix: true,
									})}
								</p>
							</div>
						</div>
					))
				) : (
					<div className="text-center py-8 text-muted-foreground">
						<AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
						<p className="text-sm">No recent activity</p>
					</div>
				)}
			</div>
		</div>
	);
}
