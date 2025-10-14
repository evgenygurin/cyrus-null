import type { IConfigService } from "../services/IConfigService.js";
import { BaseCommand } from "./ICommand.js";

export class CheckTokensCommand extends BaseCommand {
	constructor(private readonly configService: IConfigService) {
		super();
	}

	async execute(): Promise<void> {
		try {
			const config = await this.configService.load();

			if (config.repositories.length === 0) {
				console.log("No repositories configured");
				return;
			}

			console.log("Checking Linear tokens...\n");

			for (const repo of config.repositories) {
				process.stdout.write(`${repo.name} (${repo.linearWorkspaceName}): `);
				const result = await this.checkToken(repo.linearToken);

				if (result.valid) {
					console.log("✅ Valid");
				} else {
					console.log(`❌ Invalid - ${result.error}`);
				}
			}
		} catch (error) {
			await this.handleError(error);
		}
	}

	private async checkToken(
		token: string,
	): Promise<{ valid: boolean; error?: string }> {
		try {
			const response = await fetch("https://api.linear.app/graphql", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
				},
				body: JSON.stringify({
					query: "{ viewer { id email name } }",
				}),
			});

			const data = (await response.json()) as {
				errors?: Array<{ message: string }>;
			};

			if (data.errors) {
				return {
					valid: false,
					error: data.errors[0]?.message || "Unknown error",
				};
			}

			return { valid: true };
		} catch (error) {
			return {
				valid: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}
}
