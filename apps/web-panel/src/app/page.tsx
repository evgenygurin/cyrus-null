import type { Metadata } from "next";
import Dashboard from "@/components/dashboard/Dashboard";

export const metadata: Metadata = {
	title: "Dashboard - Cyrus Control Panel",
};

export default function HomePage() {
	return <Dashboard />;
}
