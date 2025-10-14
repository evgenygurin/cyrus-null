import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { EdgeConfig, RepositoryConfig } from "cyrus-core";
import { ConfigError } from "cyrus-core";
import type { IConfigService } from "./IConfigService.js";

export class ConfigService implements IConfigService {
	constructor(private readonly configPath: string) {}

	async load(): Promise<EdgeConfig> {
		if (!existsSync(this.configPath)) {
			return { repositories: [] };
		}

		try {
			const content = readFileSync(this.configPath, "utf-8");
			const config = JSON.parse(content);
			return this.validate(config);
		} catch (error) {
			throw new ConfigError("Failed to load configuration", {
				path: this.configPath,
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}

	async save(config: EdgeConfig): Promise<void> {
		try {
			const validConfig = this.validate(config);
			const configDir = dirname(this.configPath);

			if (!existsSync(configDir)) {
				mkdirSync(configDir, { recursive: true });
			}

			writeFileSync(this.configPath, JSON.stringify(validConfig, null, 2));
		} catch (error) {
			throw new ConfigError("Failed to save configuration", {
				path: this.configPath,
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}

	validate(config: unknown): EdgeConfig {
		if (!config || typeof config !== "object") {
			throw new ConfigError("Invalid configuration: must be an object");
		}

		const edgeConfig = config as EdgeConfig;

		if (!Array.isArray(edgeConfig.repositories)) {
			throw new ConfigError(
				"Invalid configuration: repositories must be an array",
			);
		}

		for (const repo of edgeConfig.repositories) {
			this.validateRepository(repo);
		}

		return edgeConfig;
	}

	private validateRepository(repo: RepositoryConfig): void {
		const required = [
			"id",
			"name",
			"repositoryPath",
			"baseBranch",
			"linearWorkspaceId",
			"linearToken",
			"workspaceBaseDir",
		];

		for (const field of required) {
			if (!(field in repo)) {
				throw new ConfigError(`Invalid repository: missing field "${field}"`, {
					repository: repo.name,
				});
			}
		}
	}

	async addRepository(repository: RepositoryConfig): Promise<void> {
		const config = await this.load();

		const exists = config.repositories.some((r) => r.id === repository.id);
		if (exists) {
			throw new ConfigError("Repository already exists", {
				repositoryId: repository.id,
			});
		}

		config.repositories.push(repository);
		await this.save(config);
	}

	async removeRepository(repositoryId: string): Promise<void> {
		const config = await this.load();
		config.repositories = config.repositories.filter(
			(r) => r.id !== repositoryId,
		);
		await this.save(config);
	}

	async updateRepository(
		repositoryId: string,
		updates: Partial<RepositoryConfig>,
	): Promise<void> {
		const config = await this.load();

		const index = config.repositories.findIndex((r) => r.id === repositoryId);
		if (index === -1) {
			throw new ConfigError("Repository not found", { repositoryId });
		}

		config.repositories[index] = {
			...config.repositories[index],
			...updates,
		};

		await this.save(config);
	}
}
