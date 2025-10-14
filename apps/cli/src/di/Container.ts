type Factory<T> = () => T;
type AsyncFactory<T> = () => Promise<T>;

export class Container {
	private singletons = new Map<string, unknown>();
	private factories = new Map<
		string,
		Factory<unknown> | AsyncFactory<unknown>
	>();

	register<T>(key: string, factory: Factory<T> | AsyncFactory<T>): void {
		this.factories.set(key, factory);
	}

	registerSingleton<T>(
		key: string,
		factory: Factory<T> | AsyncFactory<T>,
	): void {
		this.register(key, () => {
			if (!this.singletons.has(key)) {
				const instance = factory();
				if (instance instanceof Promise) {
					throw new Error(
						"Async factories not supported for singletons. Use async resolve() instead.",
					);
				}
				this.singletons.set(key, instance);
			}
			return this.singletons.get(key) as T;
		});
	}

	resolve<T>(key: string): T {
		const factory = this.factories.get(key);
		if (!factory) {
			throw new Error(`No factory registered for key: ${key}`);
		}
		const result = factory();
		if (result instanceof Promise) {
			throw new Error(
				`Factory for ${key} is async. Use resolveAsync() instead.`,
			);
		}
		return result as T;
	}

	async resolveAsync<T>(key: string): Promise<T> {
		const factory = this.factories.get(key);
		if (!factory) {
			throw new Error(`No factory registered for key: ${key}`);
		}
		return (await factory()) as T;
	}

	clear(): void {
		this.singletons.clear();
		this.factories.clear();
	}
}
