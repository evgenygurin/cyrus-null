# Prompting Best Practices

> Part of Codegen Platform Documentation

## Core Principle: Specificity

❌ **Vague**: "Fix the user service"
✅ **Specific**: "In the `user-auth` repository, refactor UserService to use dependency injection"

## Five Essential Elements

### 1. Scope - Repository, branch, files

```bash
In the `payment-api` repository (branch: feature/refund-v2),
focus on files in src/services/refund/
```

### 2. Goal - High-level objective

```bash
Goal: Implement automated refund processing for subscription cancellations
```

### 3. Tasks - Numbered action items

```bash
Tasks:
1. Create RefundService class with processRefund method
2. Integrate with Stripe API for refund processing
3. Add database logging for all refund transactions
4. Implement retry logic with exponential backoff
```

### 4. Context/Patterns - Reference examples

```bash
Follow the pattern shown in ChargeService:
- Use dependency injection for external APIs
- Wrap API calls in try-catch with specific error types
- Log all operations with structured logging
```

### 5. Success Criteria - Definition of done

```bash
Success criteria:
- All existing tests pass
- New tests for RefundService with 90%+ coverage
- Integration test with Stripe test API
- Update docs/api/refund-endpoints.md
```

## Complete Prompt Example

```bash
Repository: payment-api
Branch: feature/refund-v2
Files: src/services/refund/, tests/services/refund/

Goal: Implement automated refund processing for subscription cancellations

Tasks:
1. Create RefundService class in src/services/refund/RefundService.ts
2. Implement processRefund(subscriptionId, amount, reason) method
3. Integrate with Stripe API for refund processing
4. Add database logging to refund_transactions table
5. Implement retry logic with exponential backoff (3 retries, 2^n seconds)
6. Add comprehensive error handling for Stripe API errors

Context:
- Follow the pattern in ChargeService (src/services/charge/ChargeService.ts)
- Use dependency injection for Stripe client
- Use structured logging (logger.info with context objects)
- Wrap API calls in try-catch with RefundError types

Success criteria:
- All existing tests pass
- New unit tests for RefundService with 90%+ coverage
- Integration test with Stripe test API (uses test mode keys)
- Error scenarios covered: insufficient funds, invalid subscription, API timeout
- Update docs/api/refund-endpoints.md with new endpoint documentation
- Add JSDoc comments to all public methods
```

## Prompting Patterns

### Pattern 1: Feature Implementation

```text
Feature: [Name]
Repository: [repo-name]
Location: [path/to/files]

Requirements:
- [Requirement 1]
- [Requirement 2]

Implementation steps:
1. [Step 1]
2. [Step 2]

Reference: [existing similar feature]
Tests: [test requirements]
Docs: [documentation to update]
```

### Pattern 2: Bug Fix

```text
Bug: [Brief description]
Repository: [repo-name]
File: [path/to/file.ts:line-number]

Observed behavior:
[What's happening]

Expected behavior:
[What should happen]

Steps to reproduce:
1. [Step 1]
2. [Step 2]

Proposed fix:
[How to fix it]

Testing:
- Add regression test
- Verify existing tests pass
```

### Pattern 3: Refactoring

```bash
Refactoring: [What to refactor]
Repository: [repo-name]
Scope: [files/directories]

Current state:
[Description of current implementation]

Target state:
[Description of desired implementation]

Pattern to follow:
[Reference to example or documentation]

Safety requirements:
- Maintain backward compatibility
- All tests must pass
- No change in public API
```

## Anti-Patterns (What NOT to Do)

❌ **Too vague**: "Make the API better"
❌ **Missing context**: "Add authentication" (Which service? What type? Where?)
❌ **No success criteria**: "Refactor the code" (How will you know it's done?)
❌ **Conflicting requirements**: "Make it faster and add more features" (Be explicit about priorities)
