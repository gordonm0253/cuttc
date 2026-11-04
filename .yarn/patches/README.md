# minimatch compatibility patch

The root resolution upgrades all minimatch consumers to 11.0.1 to address
[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).

ESLint 9's configuration packages still use a default ESM import, and several
eslint-plugin-react 7 rules call the CommonJS export as a function. The patch
restores these two export forms while preserving minimatch 11's named exports
and security fixes. It does not change matching or preprocessing logic.

Keep the patch until these consumers support the modern exports. When updating
minimatch, regenerate it with `yarn patch` and `yarn patch-commit`, point the
root resolution at the new patch, and run `yarn test:security`, `yarn lint`, and
`yarn build`.
