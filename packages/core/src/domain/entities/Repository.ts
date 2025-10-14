export interface RepositoryId {
	value: string;
}

export interface RoutingConfig {
	teamKeys?: string[];
	projectKeys?: string[];
	routingLabels?: string[];
}

export interface RepositoryConfig {
	allowedTools?: string[];
	disallowedTools?: string[];
	allowedDirectories?: string[];
	mcpConfigPath?: string | string[];
	routingConfig?: RoutingConfig;
}

export interface Repository {
	id: RepositoryId;
	name: string;
	path: string;
	baseBranch: string;
	workspaceBaseDir: string;
	linearWorkspaceId: string;
	linearToken: string;
	isActive: boolean;
	config?: RepositoryConfig;
}

export class RepositoryEntity implements Repository {
	constructor(
		public readonly id: RepositoryId,
		public readonly name: string,
		public readonly path: string,
		public readonly baseBranch: string,
		public readonly workspaceBaseDir: string,
		public readonly linearWorkspaceId: string,
		public readonly linearToken: string,
		public isActive: boolean,
		public readonly config?: RepositoryConfig,
	) {}

	static create(params: {
		id: string;
		name: string;
		path: string;
		baseBranch: string;
		workspaceBaseDir: string;
		linearWorkspaceId: string;
		linearToken: string;
		isActive?: boolean;
		config?: RepositoryConfig;
	}): RepositoryEntity {
		return new RepositoryEntity(
			{ value: params.id },
			params.name,
			params.path,
			params.baseBranch,
			params.workspaceBaseDir,
			params.linearWorkspaceId,
			params.linearToken,
			params.isActive ?? true,
			params.config,
		);
	}

	canHandleTeam(teamKey: string): boolean {
		return this.config?.routingConfig?.teamKeys?.includes(teamKey) ?? false;
	}

	canHandleProject(projectKey: string): boolean {
		return (
			this.config?.routingConfig?.projectKeys?.includes(projectKey) ?? false
		);
	}

	canHandleLabel(label: string): boolean {
		return this.config?.routingConfig?.routingLabels?.includes(label) ?? false;
	}

	activate(): void {
		this.isActive = true;
	}

	deactivate(): void {
		this.isActive = false;
	}
}
