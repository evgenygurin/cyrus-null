import { describe, expect, it } from "vitest";
import { RepositoryEntity } from "../Repository.js";

describe("RepositoryEntity", () => {
	it("should create repository entity", () => {
		const repo = RepositoryEntity.create({
			id: "test-1",
			name: "test-repo",
			path: "/path/to/repo",
			baseBranch: "main",
			workspaceBaseDir: "/workspace",
			linearWorkspaceId: "ws-123",
			linearToken: "lin_oauth_test",
		});

		expect(repo).toBeInstanceOf(RepositoryEntity);
		expect(repo.id.value).toBe("test-1");
		expect(repo.name).toBe("test-repo");
		expect(repo.isActive).toBe(true);
	});

	it("should handle team-based routing", () => {
		const repo = RepositoryEntity.create({
			id: "test-1",
			name: "test-repo",
			path: "/path/to/repo",
			baseBranch: "main",
			workspaceBaseDir: "/workspace",
			linearWorkspaceId: "ws-123",
			linearToken: "lin_oauth_test",
			config: {
				routingConfig: {
					teamKeys: ["TEAM1", "TEAM2"],
				},
			},
		});

		expect(repo.canHandleTeam("TEAM1")).toBe(true);
		expect(repo.canHandleTeam("TEAM3")).toBe(false);
	});

	it("should handle project-based routing", () => {
		const repo = RepositoryEntity.create({
			id: "test-1",
			name: "test-repo",
			path: "/path/to/repo",
			baseBranch: "main",
			workspaceBaseDir: "/workspace",
			linearWorkspaceId: "ws-123",
			linearToken: "lin_oauth_test",
			config: {
				routingConfig: {
					projectKeys: ["PROJ1", "PROJ2"],
				},
			},
		});

		expect(repo.canHandleProject("PROJ1")).toBe(true);
		expect(repo.canHandleProject("PROJ3")).toBe(false);
	});

	it("should handle label-based routing", () => {
		const repo = RepositoryEntity.create({
			id: "test-1",
			name: "test-repo",
			path: "/path/to/repo",
			baseBranch: "main",
			workspaceBaseDir: "/workspace",
			linearWorkspaceId: "ws-123",
			linearToken: "lin_oauth_test",
			config: {
				routingConfig: {
					routingLabels: ["bug", "feature"],
				},
			},
		});

		expect(repo.canHandleLabel("bug")).toBe(true);
		expect(repo.canHandleLabel("enhancement")).toBe(false);
	});

	it("should activate and deactivate repository", () => {
		const repo = RepositoryEntity.create({
			id: "test-1",
			name: "test-repo",
			path: "/path/to/repo",
			baseBranch: "main",
			workspaceBaseDir: "/workspace",
			linearWorkspaceId: "ws-123",
			linearToken: "lin_oauth_test",
			isActive: false,
		});

		expect(repo.isActive).toBe(false);

		repo.activate();
		expect(repo.isActive).toBe(true);

		repo.deactivate();
		expect(repo.isActive).toBe(false);
	});

	it("should return false for routing checks when no config", () => {
		const repo = RepositoryEntity.create({
			id: "test-1",
			name: "test-repo",
			path: "/path/to/repo",
			baseBranch: "main",
			workspaceBaseDir: "/workspace",
			linearWorkspaceId: "ws-123",
			linearToken: "lin_oauth_test",
		});

		expect(repo.canHandleTeam("TEAM1")).toBe(false);
		expect(repo.canHandleProject("PROJ1")).toBe(false);
		expect(repo.canHandleLabel("bug")).toBe(false);
	});
});
