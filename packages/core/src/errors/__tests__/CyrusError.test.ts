import { describe, expect, it } from "vitest";
import {
	ConfigError,
	CyrusError,
	GitError,
	OAuthError,
	SubscriptionError,
	ValidationError,
} from "../CyrusError.js";

describe("CyrusError", () => {
	it("should create ConfigError with message and context", () => {
		const error = new ConfigError("Config failed", { path: "/test/path" });

		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(CyrusError);
		expect(error.message).toBe("Config failed");
		expect(error.code).toBe("CONFIG_ERROR");
		expect(error.context).toEqual({ path: "/test/path" });
		expect(error.name).toBe("ConfigError");
	});

	it("should create OAuthError", () => {
		const error = new OAuthError("OAuth failed");

		expect(error).toBeInstanceOf(CyrusError);
		expect(error.code).toBe("OAUTH_ERROR");
		expect(error.message).toBe("OAuth failed");
	});

	it("should create GitError", () => {
		const error = new GitError("Git operation failed");

		expect(error).toBeInstanceOf(CyrusError);
		expect(error.code).toBe("GIT_ERROR");
		expect(error.message).toBe("Git operation failed");
	});

	it("should create SubscriptionError", () => {
		const error = new SubscriptionError("Subscription invalid");

		expect(error).toBeInstanceOf(CyrusError);
		expect(error.code).toBe("SUBSCRIPTION_ERROR");
		expect(error.message).toBe("Subscription invalid");
	});

	it("should create ValidationError with errors", () => {
		const errors = {
			email: ["Email is required"],
			password: ["Password too short"],
		};
		const error = new ValidationError("Validation failed", errors);

		expect(error).toBeInstanceOf(CyrusError);
		expect(error.code).toBe("VALIDATION_ERROR");
		expect(error.errors).toEqual(errors);
		expect(error.context).toEqual({ errors });
	});

	it("should serialize to JSON", () => {
		const error = new ConfigError("Test error", { test: "context" });
		const json = error.toJSON();

		expect(json.name).toBe("ConfigError");
		expect(json.message).toBe("Test error");
		expect(json.code).toBe("CONFIG_ERROR");
		expect(json.context).toEqual({ test: "context" });
		expect(json.stack).toBeDefined();
	});
});
