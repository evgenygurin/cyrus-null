export interface ICommand {
	execute(): Promise<void>;
}

export abstract class BaseCommand implements ICommand {
	abstract execute(): Promise<void>;

	protected async handleError(error: unknown): Promise<void> {
		if (error instanceof Error) {
			console.error(`❌ ${error.message}`);
			if (process.env.DEBUG) {
				console.error(error.stack);
			}
		} else {
			console.error("❌ An unknown error occurred");
		}
		process.exit(1);
	}
}
