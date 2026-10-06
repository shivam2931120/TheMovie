# Dependency security status

Checked on 2026-10-06 after updating the lockfile and moving Next.js and its ESLint
configuration to stable 16.3.8.

- `npm audit --omit=dev`: zero reported vulnerabilities.
- Full `npm audit`: five high severity package entries, all in the development
  lint dependency chain: `eslint-config-next` → `@next/eslint-plugin-next` →
  `fast-glob` → `micromatch` → `braces`.
- These five entries refer to one underlying issue, uncontrolled recursion in
  braces patterns. The advisory lists no patched release:
  [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).

Keep lint inputs limited to trusted repository files and configuration. Review
upstream releases before refreshing this dependency chain. Do not use npm's
suggested forced downgrade to Next.js 14's ESLint configuration with this Next.js
16 application. The remaining advisory is unresolved, and this report does not
assert that all dependencies are vulnerability free.
