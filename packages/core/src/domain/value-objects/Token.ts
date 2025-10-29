import { ValidationError } from "../../errors/CyrusError.js";

export class LinearToken {
	private constructor(private readonly value: string) {}

	static create(token: string): LinearToken {
		if (!token.startsWith("lin_oauth_")) {
			throw new ValidationError("Invalid Linear token format", {
				token: ['Token must start with "lin_oauth_"'],
			});
		}
		return new LinearToken(token);
	}

	toString(): string {
		return this.value;
	}

	equals(other: LinearToken): boolean {
		return this.value === other.value;
	}

	mask(): string {
		return `...${this.value.slice(-4)}`;
	}
}

export class StripeCustomerId {
	private constructor(private readonly value: string) {}

	static create(customerId: string): StripeCustomerId {
		if (!customerId.startsWith("cus_")) {
			throw new ValidationError("Invalid Stripe customer ID format", {
				customerId: ['Customer ID must start with "cus_"'],
			});
		}
		return new StripeCustomerId(customerId);
	}

	toString(): string {
		return this.value;
	}

	equals(other: StripeCustomerId): boolean {
		return this.value === other.value;
	}
}
