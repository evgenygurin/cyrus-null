import type { EdgeConfig, RepositoryConfig } from "cyrus-core";

export interface IConfigService {
	load(): Promise<EdgeConfig>;
	save(config: EdgeConfig): Promise<void>;
	validate(config: unknown): EdgeConfig;
	addRepository(repository: RepositoryConfig): Promise<void>;
	removeRepository(repositoryId: string): Promise<void>;
	updateRepository(
		repositoryId: string,
		updates: Partial<RepositoryConfig>,
	): Promise<void>;
}
