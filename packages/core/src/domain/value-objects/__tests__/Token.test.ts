import { describe, expect, it } from "vitest";
import { ValidationError } from "../../../errors/CyrusError.js";
import { LinearToken, StripeCustomerId } from "../Token.js";

describe("LinearToken", () => {
	it("should create token with valid format", () => {
		const token = LinearToken.create("lin_oauth_123456");

		expect(token).toBeInstanceOf(LinearToken);
		expect(token.toString()).toBe("lin_oauth_123456");
	});

	it("should throw ValidationError for invalid format", () => {
		expect(() => LinearToken.create("invalid_token")).toThrow(ValidationError);
		expect(() => LinearToken.create("invalid_token")).toThrow(
			"Invalid Linear token format",
		);
	});

	it("should compare tokens", () => {
		const token1 = LinearToken.create("lin_oauth_123456");
		const token2 = LinearToken.create("lin_oauth_123456");
		const token3 = LinearToken.create("lin_oauth_789012");

		expect(token1.equals(token2)).toBe(true);
		expect(token1.equals(token3)).toBe(false);
	});

	it("should mask token for display", () => {
		const token = LinearToken.create("lin_oauth_123456");

		expect(token.mask()).toBe("...3456");
	});
});

describe("StripeCustomerId", () => {
	it("should create customer ID with valid format", () => {
		const customerId = StripeCustomerId.create("cus_123456");

		expect(customerId).toBeInstanceOf(StripeCustomerId);
		expect(customerId.toString()).toBe("cus_123456");
	});

	it("should throw ValidationError for invalid format", () => {
		expect(() => StripeCustomerId.create("invalid_id")).toThrow(
			ValidationError,
		);
		expect(() => StripeCustomerId.create("invalid_id")).toThrow(
			"Invalid Stripe customer ID format",
		);
	});

	it("should compare customer IDs", () => {
		const id1 = StripeCustomerId.create("cus_123456");
		const id2 = StripeCustomerId.create("cus_123456");
		const id3 = StripeCustomerId.create("cus_789012");

		expect(id1.equals(id2)).toBe(true);
		expect(id1.equals(id3)).toBe(false);
	});
});
