import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { EdgeConfig } from "cyrus-core";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ConfigService } from "../ConfigService.js";

describe("ConfigService", () => {
	let tempDir: string;
	let configService: ConfigService;

	beforeEach(() => {
		tempDir = mkdtempSync(join(tmpdir(), "cyrus-test-"));
		const configPath = join(tempDir, "config.json");
		configService = new ConfigService(configPath);
	});

	afterEach(() => {
		rmSync(tempDir, { recursive: true, force: true });
	});

	it("should create default config when file does not exist", async () => {
		const config = await configService.load();
		expect(config).toEqual({ repositories: [] });
	});

	it("should save and load config", async () => {
		const testConfig: EdgeConfig = {
			repositories: [
				{
					id: "test-1",
					name: "test-repo",
					repositoryPath: "/path/to/repo",
					baseBranch: "main",
					linearWorkspaceId: "ws-123",
					linearToken: "lin_oauth_test",
					linearWorkspaceName: "Test Workspace",
					workspaceBaseDir: "/path/to/workspace",
					isActive: true,
				},
			],
		};

		await configService.save(testConfig);
		const loaded = await configService.load();

		expect(loaded).toEqual(testConfig);
	});

	it("should throw error for invalid config", async () => {
		await expect(configService.validate({ invalid: true })).rejects.toThrow(
			"Invalid configuration",
		);
	});

	it("should add repository to config", async () => {
		const repository = {
			id: "test-1",
			name: "test-repo",
			repositoryPath: "/path/to/repo",
			baseBranch: "main",
			linearWorkspaceId: "ws-123",
			linearToken: "lin_oauth_test",
			linearWorkspaceName: "Test Workspace",
			workspaceBaseDir: "/path/to/workspace",
			isActive: true,
		};

		await configService.addRepository(repository);
		const config = await configService.load();

		expect(config.repositories).toHaveLength(1);
		expect(config.repositories[0]).toEqual(repository);
	});

	it("should throw error when adding duplicate repository", async () => {
		const repository = {
			id: "test-1",
			name: "test-repo",
			repositoryPath: "/path/to/repo",
			baseBranch: "main",
			linearWorkspaceId: "ws-123",
			linearToken: "lin_oauth_test",
			linearWorkspaceName: "Test Workspace",
			workspaceBaseDir: "/path/to/workspace",
			isActive: true,
		};

		await configService.addRepository(repository);

		await expect(configService.addRepository(repository)).rejects.toThrow(
			"Repository already exists",
		);
	});

	it("should remove repository from config", async () => {
		const repository = {
			id: "test-1",
			name: "test-repo",
			repositoryPath: "/path/to/repo",
			baseBranch: "main",
			linearWorkspaceId: "ws-123",
			linearToken: "lin_oauth_test",
			linearWorkspaceName: "Test Workspace",
			workspaceBaseDir: "/path/to/workspace",
			isActive: true,
		};

		await configService.addRepository(repository);
		await configService.removeRepository("test-1");

		const config = await configService.load();
		expect(config.repositories).toHaveLength(0);
	});

	it("should update repository in config", async () => {
		const repository = {
			id: "test-1",
			name: "test-repo",
			repositoryPath: "/path/to/repo",
			baseBranch: "main",
			linearWorkspaceId: "ws-123",
			linearToken: "lin_oauth_test",
			linearWorkspaceName: "Test Workspace",
			workspaceBaseDir: "/path/to/workspace",
			isActive: true,
		};

		await configService.addRepository(repository);
		await configService.updateRepository("test-1", { name: "updated-repo" });

		const config = await configService.load();
		expect(config.repositories[0]?.name).toBe("updated-repo");
	});
});
