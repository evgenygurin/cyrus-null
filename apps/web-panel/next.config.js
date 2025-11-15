/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	poweredByHeader: false,

	// Optimize for production and sandbox environment
	experimental: {
		optimizePackageImports: ["lucide-react", "date-fns"],
	},

	// Environment variable for preview URL
	env: {
		PREVIEW_URL:
			process.env.CG_PREVIEW_URL ||
			process.env.VERCEL_URL ||
			"http://localhost:3001",
	},

	// Output configuration for Vercel
	output: "standalone",

	// Compiler options
	compiler: {
		removeConsole: process.env.NODE_ENV === "production",
	},
};

module.exports = nextConfig;
