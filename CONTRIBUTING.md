# Contributing to Linear Claude Agent

We love your input! We want to make contributing to Linear Claude Agent as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Requests

Pull requests are the primary way to contribute code changes to the project.

#### Quick Start

1. Fork the repo and create your branch from `main`
2. Make your changes following the code style guidelines
3. Add tests for any new functionality
4. Ensure all checks pass: `pnpm build && pnpm typecheck && pnpm test:packages:run`
5. Update CHANGELOG.md under `[Unreleased]` section
6. Create a pull request using the appropriate template

#### PR Templates

We provide specialized templates for different types of pull requests:

- **Default Template** - For most changes (features, bug fixes, documentation)
- **Hotfix Template** - For critical production issues requiring immediate fixes
- **Release Template** - For promoting code between environments (main→stage→prod)

See [.github/PULL_REQUEST_TEMPLATE/README.md](.github/PULL_REQUEST_TEMPLATE/README.md) for detailed guidance on which template to use.

#### Before Submitting

Run these commands to ensure your PR is ready:

```bash
pnpm build                # Build all packages
pnpm typecheck           # TypeScript type checking
pnpm test:packages:run   # Run all package tests
pnpm lint                # Check code style
```

#### PR Review Process

1. All PRs require at least one approval from a maintainer
2. All CI checks must pass
3. CHANGELOG.md must be updated
4. Documentation must be updated for user-facing changes
5. Breaking changes require migration guides

For detailed guidelines, see:
- [PR Guidelines](.github/PR_GUIDELINES.md) - Comprehensive instructions
- [PR Checklist](.github/PR_CHECKLIST.md) - Quick reference guide

### Issues

We use GitHub issues to track work. Here's how to do that effectively:

1. **Bug Reports**: When filing a bug report, include:
   - A clear title and description
   - As much relevant information as possible
   - A code sample or test case demonstrating the issue
   - Version information for Node.js and dependencies

2. **Feature Requests**: When proposing a feature, include:
   - A clear title and description
   - Explain why this feature would be useful
   - Consider how it might impact existing functionality

## Environment Setup

1. Clone the repository
2. Create a `.env` file based on `.env.example`
3. Install dependencies with `pnpm install`
4. Run the tests with `pnpm test`
5. Start the development server with `pnpm run dev`

## Testing

Please make sure to write and run tests for any new code. We use Vitest for testing.

```bash
# Run all tests in watch mode
pnpm test

# Run all package tests once (recommended for CI/PR validation)
pnpm test:packages:run

# Run tests for a specific package
pnpm --filter '@cyrus/core' test:run

# Run tests in watch mode for development
pnpm --filter '@cyrus/core' test

# Run tests for all apps
pnpm test:apps
```

### Test Requirements

- All new features must include unit tests
- Bug fixes should include regression tests
- Integration tests for cross-package functionality
- Maintain or improve test coverage
- Tests must pass before PR can be merged

## Code Style

- Use ESM modules rather than CommonJS
- Follow the existing code structure and organization
- Use JSDoc comments for functions and classes
- Format code consistently with the existing codebase

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.