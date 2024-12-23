# Personal Workers

This is a collection of personal [Cloudflare Workers](https://workers.cloudflare.com/) organized in a [Turborepo](https://turbo.build/) monorepo. These workers automate various aspects of my daily life.

## Project Structure

The project is organized as a monorepo using Turborepo for efficient build caching and dependency management. Each worker is contained in its own package under the `workers/` directory.

### Current Workers

- **create-empty-dehumidifier-task**: Monitors humidity levels through Airthings and automatically creates tasks in Motion when the dehumidifier needs to be emptied.

## Development

This project uses:
- Turborepo for build orchestration
- TypeScript for type-safe development
- Cloudflare Workers for serverless execution
- Shared utilities and types in `@personal-workers/shared`
