import { homedir } from "node:os";
import { resolve } from "node:path";
import { CheckTokensCommand } from "../application/commands/CheckTokensCommand.js";
import { ConfigService } from "../application/services/ConfigService.js";
import { Container } from "./Container.js";

export function setupContainer(cyrusHome?: string): Container {
	const container = new Container();

	// Configuration
	const configPath = resolve(cyrusHome || homedir(), ".cyrus", "config.json");

	container.registerSingleton(
		"ConfigService",
		() => new ConfigService(configPath),
	);

	// Commands
	container.register("CheckTokensCommand", () => {
		const configService = container.resolve<ConfigService>("ConfigService");
		return new CheckTokensCommand(configService);
	});

	// Add more commands here...

	return container;
}
