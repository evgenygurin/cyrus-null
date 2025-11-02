import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface StatsCardProps {
	title: string;
	value: string;
	icon: React.ReactNode;
	trend?: string;
	trendUp?: boolean;
	iconColor?: string;
}

export function StatsCard({
	title,
	value,
	icon,
	trend,
	trendUp,
	iconColor = "text-primary",
}: StatsCardProps) {
	return (
		<div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-shadow">
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<p className="text-sm font-medium text-muted-foreground mb-1">
						{title}
					</p>
					<p className="text-3xl font-bold">{value}</p>

					{trend && (
						<div
							className={`flex items-center gap-1 mt-2 text-sm ${trendUp ? "text-green-600" : "text-red-600"}`}
						>
							{trendUp ? (
								<ArrowUpRight className="w-4 h-4" />
							) : (
								<ArrowDownRight className="w-4 h-4" />
							)}
							<span className="font-medium">{trend}</span>
							<span className="text-muted-foreground">vs last week</span>
						</div>
					)}
				</div>

				<div className={`p-3 rounded-lg bg-primary/10 ${iconColor}`}>
					{icon}
				</div>
			</div>
		</div>
	);
}
