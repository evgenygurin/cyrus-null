export abstract class CyrusError extends Error {
	constructor(
		message: string,
		public readonly code: string,
		public readonly context?: Record<string, unknown>,
	) {
		super(message);
		this.name = this.constructor.name;
		Error.captureStackTrace(this, this.constructor);
	}

	toJSON() {
		return {
			name: this.name,
			message: this.message,
			code: this.code,
			context: this.context,
			stack: this.stack,
		};
	}
}

export class ConfigError extends CyrusError {
	constructor(message: string, context?: Record<string, unknown>) {
		super(message, "CONFIG_ERROR", context);
	}
}

export class OAuthError extends CyrusError {
	constructor(message: string, context?: Record<string, unknown>) {
		super(message, "OAUTH_ERROR", context);
	}
}

export class GitError extends CyrusError {
	constructor(message: string, context?: Record<string, unknown>) {
		super(message, "GIT_ERROR", context);
	}
}

export class SubscriptionError extends CyrusError {
	constructor(message: string, context?: Record<string, unknown>) {
		super(message, "SUBSCRIPTION_ERROR", context);
	}
}

export class ValidationError extends CyrusError {
	constructor(
		message: string,
		public readonly errors: Record<string, string[]>,
	) {
		super(message, "VALIDATION_ERROR", { errors });
	}
}
