# Frontend Playground

This is a monorepo for frontend learning and experimentation using Turborepo and pnpm.

## What's inside?

This monorepo uses [pnpm](https://pnpm.io) as a package manager and [Turborepo](https://turbo.build/repo) as a build system.

### Apps and Packages

- `apps/*`: application projects
- `packages/*`: shared packages across applications

### Utilities

This monorepo has some additional tools:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```
pnpm dev
```

### Remote Caching

Turborepo can use a technique known as [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. 