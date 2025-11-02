/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	poweredByHeader: false,

	// Optimize for sandbox environment
	experimental: {
		optimizePackageImports: ["lucide-react", "date-fns"],
	},

	// Disable telemetry in sandbox
	telemetry: false,

	// Server configuration for Codegen sandbox
	serverRuntimeConfig: {
		port: 3000,
	},

	// Environment variable for preview URL
	env: {
		PREVIEW_URL: process.env.CG_PREVIEW_URL || "http://localhost:3000",
	},
};

module.exports = nextConfig;
