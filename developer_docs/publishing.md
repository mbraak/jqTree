# Publishing a new version

Releases are published to npm by GitHub Actions. Pushing a version tag triggers
the `Publish to npm` workflow in `.github/workflows/publish.yml`, which verifies
the tag, runs the checks, builds the package and publishes it. No npm token is
needed on your machine.

## Releasing

1. Make sure `dev` is up to date and CI is green.

2. Bump the version. This updates `package.json`, `bower.json`,
   `src/version.ts` and `docs/_config.yml` in one go:

    ```sh
    pnpm bump-version 1.9.2
    ```

3. Commit, tag and push. Tags are plain version numbers without a `v` prefix:

    ```sh
    git commit -am "Release 1.9.2"
    git tag 1.9.2
    git push && git push --tags
    ```

4. Watch the `Publish to npm` workflow in the Actions tab. When it finishes,
   the new version is live on https://www.npmjs.com/package/jqtree.

## What the workflow does

- Checks that the tag equals the version in `package.json`, and fails if not.
- Runs `pnpm lint`, `pnpm tsc` and `pnpm vitest`. Playwright tests are not
  run here; they already run in CI on every push.
- Builds the distribution files with `pnpm production`.
- Publishes with `npm publish` using npm trusted publishing (OIDC). Provenance
  attestations are attached automatically.

## If something goes wrong

- **The tag check fails.** The tag and `package.json` disagree. Delete the tag
  locally and remotely, fix the version, and tag again:

    ```sh
    git tag -d 1.9.2
    git push origin :refs/tags/1.9.2
    ```

- **Publishing fails with an authentication error.** Trusted publishing is not
  configured for this repository on npm. See the setup section below.

- **A published version is broken.** npm versions are immutable. Fix the
  problem and release a new patch version rather than trying to republish.

## One-time setup: trusted publishing on npm

This only has to be done once per package. On https://www.npmjs.com, open the
`jqtree` package, go to _Settings_, then _Trusted Publisher_, choose
_GitHub Actions_ and fill in:

| Field                | Value         |
| -------------------- | ------------- |
| Organization or user | `mbraak`      |
| Repository           | `jqTree`      |
| Workflow filename    | `publish.yml` |
| Environment          | leave empty   |

The workflow requests an OIDC token through the `id-token: write` permission,
and npm exchanges that for a short-lived publish credential. If the workflow
file is ever renamed, update the filename here as well.

## Publishing manually

If GitHub Actions is unavailable, the same steps can be run locally:

```sh
pnpm ci
pnpm production
npm publish
```

This requires being logged in with `npm login` and, if 2FA is enabled, entering
a one-time password.
