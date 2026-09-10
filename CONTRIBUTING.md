# Contributing to Troott Studio

How to contribute to this repository. For setup, env, and upload notes, see **[README.md](./README.md)**.

## Scope

Creator portal checkout (`@troott/web`) — studio spaces, get-started / KYC, sermon upload, creator analytics. Prefer studio-facing work here; coordinate with sibling portal repos when changing shared code.

## Branch structure

| Branch | Purpose |
| --- | --- |
| `master` | Production-ready code. Always stable. Protected. |
| `staging` | QA / testing branch for integrating features before a release. |
| `release/vX.Y.Z` | Pre-production branch for final testing before going live. |
| `@username/feature-*` | Feature branches under a personal namespace. |
| `@username/fix-*` | Bug-fix branches under a personal namespace. |

### Branch naming

| Type | Pattern | Example |
| --- | --- | --- |
| Feature | `@username/feature-<short-desc>` | `@topeokuselu/feature-upload-retry` |
| Bug fix | `@username/fix-<short-desc>` | `@damolaoladipo/fix-studio-code-route` |
| Release | `release/v<semver>` | `release/v1.0.2` |

> Use lowercase and hyphens. Be concise and descriptive.

## Development workflow

### 1. Clone (if you haven’t)

```bash
git clone https://github.com/thetroott/troott-studio.git
cd troott-studio
```

Follow [README.md](./README.md) for install, `.env`, and `npm run dev` (port **5053**).

### 2. Create a feature branch

```bash
git checkout staging
git pull origin staging
git checkout -b @username/feature-your-task-name
```

### 3. Develop

For upload work, document whether `VITE_USE_REAL_API_UPLOAD` was enabled. Use `@troott/ui` for chrome. Commit often with clear messages.

### 4. Sync with staging

```bash
git fetch origin
git rebase origin/staging
```

### 5. Push

```bash
git push origin @username/feature-your-task-name
```

### 6. Open a PR into staging

Target **`staging`**, not `master`. Reference issues (`Closes #502`). Note API contract changes.

### 7. Create a release branch

```bash
git checkout staging
git pull origin staging
git checkout -b release/v1.0.2
git push origin release/v1.0.2
```

### 8. Merge release into master and staging

```bash
git checkout master
git merge release/v1.0.2
git push origin master

git checkout staging
git merge release/v1.0.2
git push origin staging
```

## Creating an issue

Open a GitHub Issue or notify your team lead for triage.

## Useful commands

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server on **5053** |
| `npm run build` | Production build |
| `npm start` / `npm run preview` | Preview production build |
| `npm test` | Vitest |
| `npm run lint` | ESLint |

## Pull request notes

- PRs should target **`staging`**.
- Use `Closes #issue-number`.
- Add screenshots for studio/upload UI.
- Call out upload pipeline / S3 assumptions.
- Request reviewers before merging.
