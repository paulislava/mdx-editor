# MDX Editor plugin

## Releases

`.github/workflows/publish.yml` builds every same-repository pull request and publishes a unique prerelease to the `canary` npm dist-tag. Pushes to `main` or `master` publish the next patch version to `latest` and create a matching Git tag. Fork pull requests do not publish.

Publishing uses npm Trusted Publishing (OIDC) for `paulislava/mdx-editor` and workflow `publish.yml`; no npm token is stored in GitHub. Build dependencies run on Node 20, while publishing runs on Node 24 with a current npm CLI.
