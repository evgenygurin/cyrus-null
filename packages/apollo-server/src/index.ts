import { readFileSync } from "node:fs";
import { join } from "node:path";

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { LinearClient } from "@linear/sdk";
import gql from "graphql-tag";

// Load the GraphQL schema
const schemaPath = join(process.cwd(), "../../graphql/schemas/linear.graphql");
const typeDefs = gql(readFileSync(schemaPath, "utf-8"));

// Define resolver functions
const resolvers = {
	Query: {
		me: async (_parent: any, _args: any, context: any) => {
			try {
				const viewer = await context.linearClient.viewer;
				return {
					id: viewer.id,
					name: viewer.name,
					email: viewer.email,
					displayName: viewer.displayName,
					avatarUrl: viewer.avatarUrl,
					createdAt: viewer.createdAt.toISOString(),
					updatedAt: viewer.updatedAt.toISOString(),
				};
			} catch (error) {
				console.error("Error fetching current user:", error);
				throw new Error("Failed to fetch current user");
			}
		},

		myIssues: async (_parent: any, args: any, context: any) => {
			try {
				const { first = 50, includeArchived = false } = args;
				const viewer = await context.linearClient.viewer;
				const issues = await viewer.assignedIssues({ first, includeArchived });

				const issueList = [];
				for (const issue of issues.nodes) {
					const state = await issue.state;
					const assignee = await issue.assignee;
					const team = await issue.team;
					const project = await issue.project;
					const labels = await issue.labels();

					issueList.push({
						id: issue.id,
						identifier: issue.identifier,
						title: issue.title,
						description: issue.description,
						state: state
							? {
									id: state.id,
									name: state.name,
									type: state.type,
								}
							: null,
						priority: issue.priority,
						priorityLabel: issue.priorityLabel,
						assignee: assignee
							? {
									id: assignee.id,
									name: assignee.name,
									email: assignee.email,
									displayName: assignee.displayName,
									avatarUrl: assignee.avatarUrl,
									createdAt: assignee.createdAt.toISOString(),
									updatedAt: assignee.updatedAt.toISOString(),
								}
							: null,
						team: team
							? {
									id: team.id,
									name: team.name,
									key: team.key,
									description: team.description,
								}
							: null,
						project: project
							? {
									id: project.id,
									name: project.name,
								}
							: null,
						labels: labels.nodes.map((label: any) => ({
							id: label.id,
							name: label.name,
							color: label.color,
						})),
						createdAt: issue.createdAt.toISOString(),
						updatedAt: issue.updatedAt.toISOString(),
					});
				}

				return issueList;
			} catch (error) {
				console.error("Error fetching issues:", error);
				throw new Error("Failed to fetch issues");
			}
		},

		issue: async (_parent: any, args: any, context: any) => {
			try {
				const issue = await context.linearClient.issue(args.id);
				const state = await issue.state;
				const assignee = await issue.assignee;
				const team = await issue.team;
				const project = await issue.project;
				const labels = await issue.labels();

				return {
					id: issue.id,
					identifier: issue.identifier,
					title: issue.title,
					description: issue.description,
					state: state
						? {
								id: state.id,
								name: state.name,
								type: state.type,
							}
						: null,
					priority: issue.priority,
					priorityLabel: issue.priorityLabel,
					assignee: assignee
						? {
								id: assignee.id,
								name: assignee.name,
								email: assignee.email,
								displayName: assignee.displayName,
								avatarUrl: assignee.avatarUrl,
								createdAt: assignee.createdAt.toISOString(),
								updatedAt: assignee.updatedAt.toISOString(),
							}
						: null,
					team: team
						? {
								id: team.id,
								name: team.name,
								key: team.key,
								description: team.description,
							}
						: null,
					project: project
						? {
								id: project.id,
								name: project.name,
							}
						: null,
					labels: labels.nodes.map((label: any) => ({
						id: label.id,
						name: label.name,
						color: label.color,
					})),
					createdAt: issue.createdAt.toISOString(),
					updatedAt: issue.updatedAt.toISOString(),
				};
			} catch (error) {
				console.error("Error fetching issue:", error);
				throw new Error("Failed to fetch issue");
			}
		},

		teams: async (_parent: any, args: any, context: any) => {
			try {
				const { first = 50 } = args;
				const teams = await context.linearClient.teams({ first });

				return teams.nodes.map((team: any) => ({
					id: team.id,
					name: team.name,
					key: team.key,
					description: team.description,
				}));
			} catch (error) {
				console.error("Error fetching teams:", error);
				throw new Error("Failed to fetch teams");
			}
		},

		issueComments: async (_parent: any, args: any, context: any) => {
			try {
				const { issueId, first = 50 } = args;
				const issue = await context.linearClient.issue(issueId);
				const comments = await issue.comments({ first });

				const commentList = [];
				for (const comment of comments.nodes) {
					const user = await comment.user;

					commentList.push({
						id: comment.id,
						body: comment.body,
						user: {
							id: user.id,
							name: user.name,
							email: user.email,
							displayName: user.displayName,
							avatarUrl: user.avatarUrl,
							createdAt: user.createdAt.toISOString(),
							updatedAt: user.updatedAt.toISOString(),
						},
						issue: {
							id: issueId,
							identifier: issue.identifier,
							title: issue.title,
							description: issue.description,
							priority: issue.priority,
							priorityLabel: issue.priorityLabel,
							createdAt: issue.createdAt.toISOString(),
							updatedAt: issue.updatedAt.toISOString(),
						},
						createdAt: comment.createdAt.toISOString(),
						updatedAt: comment.updatedAt.toISOString(),
					});
				}

				return commentList;
			} catch (error) {
				console.error("Error fetching comments:", error);
				throw new Error("Failed to fetch comments");
			}
		},
	},

	Mutation: {
		createIssue: async (_parent: any, args: any, context: any) => {
			try {
				const result = await context.linearClient.createIssue(args.input);
				const issue = await result.issue;

				if (!issue) {
					throw new Error("Failed to create issue");
				}

				const state = await issue.state;
				const assignee = await issue.assignee;
				const team = await issue.team;
				const project = await issue.project;
				const labels = await issue.labels();

				return {
					id: issue.id,
					identifier: issue.identifier,
					title: issue.title,
					description: issue.description,
					state: state
						? {
								id: state.id,
								name: state.name,
								type: state.type,
							}
						: null,
					priority: issue.priority,
					priorityLabel: issue.priorityLabel,
					assignee: assignee
						? {
								id: assignee.id,
								name: assignee.name,
								email: assignee.email,
								displayName: assignee.displayName,
								avatarUrl: assignee.avatarUrl,
								createdAt: assignee.createdAt.toISOString(),
								updatedAt: assignee.updatedAt.toISOString(),
							}
						: null,
					team: team
						? {
								id: team.id,
								name: team.name,
								key: team.key,
								description: team.description,
							}
						: null,
					project: project
						? {
								id: project.id,
								name: project.name,
							}
						: null,
					labels: labels.nodes.map((label: any) => ({
						id: label.id,
						name: label.name,
						color: label.color,
					})),
					createdAt: issue.createdAt.toISOString(),
					updatedAt: issue.updatedAt.toISOString(),
				};
			} catch (error) {
				console.error("Error creating issue:", error);
				throw new Error("Failed to create issue");
			}
		},

		addComment: async (_parent: any, args: any, context: any) => {
			try {
				const result = await context.linearClient.createComment({
					issueId: args.issueId,
					body: args.body,
				});

				const comment = await result.comment;
				if (!comment) {
					throw new Error("Failed to create comment");
				}

				const user = await comment.user;
				const issue = await comment.issue;

				return {
					id: comment.id,
					body: comment.body,
					user: {
						id: user.id,
						name: user.name,
						email: user.email,
						displayName: user.displayName,
						avatarUrl: user.avatarUrl,
						createdAt: user.createdAt.toISOString(),
						updatedAt: user.updatedAt.toISOString(),
					},
					issue: {
						id: issue.id,
						identifier: issue.identifier,
						title: issue.title,
						description: issue.description,
						priority: issue.priority,
						priorityLabel: issue.priorityLabel,
						createdAt: issue.createdAt.toISOString(),
						updatedAt: issue.updatedAt.toISOString(),
					},
					createdAt: comment.createdAt.toISOString(),
					updatedAt: comment.updatedAt.toISOString(),
				};
			} catch (error) {
				console.error("Error adding comment:", error);
				throw new Error("Failed to add comment");
			}
		},

		updateIssueState: async (_parent: any, args: any, context: any) => {
			try {
				const result = await context.linearClient.updateIssue(args.issueId, {
					stateId: args.stateId,
				});

				const issue = await result.issue;
				if (!issue) {
					throw new Error("Failed to update issue");
				}

				const state = await issue.state;
				const assignee = await issue.assignee;
				const team = await issue.team;
				const project = await issue.project;
				const labels = await issue.labels();

				return {
					id: issue.id,
					identifier: issue.identifier,
					title: issue.title,
					description: issue.description,
					state: state
						? {
								id: state.id,
								name: state.name,
								type: state.type,
							}
						: null,
					priority: issue.priority,
					priorityLabel: issue.priorityLabel,
					assignee: assignee
						? {
								id: assignee.id,
								name: assignee.name,
								email: assignee.email,
								displayName: assignee.displayName,
								avatarUrl: assignee.avatarUrl,
								createdAt: assignee.createdAt.toISOString(),
								updatedAt: assignee.updatedAt.toISOString(),
							}
						: null,
					team: team
						? {
								id: team.id,
								name: team.name,
								key: team.key,
								description: team.description,
							}
						: null,
					project: project
						? {
								id: project.id,
								name: project.name,
							}
						: null,
					labels: labels.nodes.map((label: any) => ({
						id: label.id,
						name: label.name,
						color: label.color,
					})),
					createdAt: issue.createdAt.toISOString(),
					updatedAt: issue.updatedAt.toISOString(),
				};
			} catch (error) {
				console.error("Error updating issue state:", error);
				throw new Error("Failed to update issue state");
			}
		},
	},
};

// Create Apollo Server instance
const server = new ApolloServer({
	typeDefs,
	resolvers,
	introspection: true, // Enable introspection for development
});

// Start the server
export async function startServer(port: number = 4000) {
	const { url } = await startStandaloneServer(server, {
		listen: { port },
		context: async ({ req }) => {
			// Extract Linear API token from environment or headers
			const token =
				process.env.LINEAR_GRAPHQL_API_KEY || req.headers.authorization;

			if (!token) {
				throw new Error(
					"Linear API token is required. Please set LINEAR_GRAPHQL_API_KEY environment variable.",
				);
			}

			// Create Linear client with the API token
			const linearClient = new LinearClient({ apiKey: token });

			return {
				linearClient,
				token,
				headers: req.headers,
			};
		},
	});

	console.log(`🚀 Apollo Server ready at ${url}`);
	console.log(`📊 GraphQL Playground available at ${url}`);
	console.log(
		`🔑 Using Linear API token: ${process.env.LINEAR_GRAPHQL_API_KEY ? "✓ Configured" : "✗ Missing"}`,
	);

	return { url, server };
}

// Run server if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
	const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
	startServer(port).catch(console.error);
}
