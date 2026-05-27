/**
 * Runs before each test file (Jest `setupFiles`).
 *
 * The inline Babel plugin in babel.config.cjs replaces every `import.meta`
 * reference with `(globalThis.__importMeta__ || { env: {} })`.
 * This stub ensures Vite-style env vars resolve to defined values instead
 * of throwing a TypeError when apiUrlSlice initialises its state.
 */
globalThis.__importMeta__ = {
  env: {
    VITE_API_HOST: 'http://localhost:3000',
    VITE_API_PATH: '/api/v1',
  },
};
