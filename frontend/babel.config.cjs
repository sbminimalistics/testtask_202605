/**
 * Babel config used exclusively by Jest (babel-jest transform).
 * The inline plugin transforms `import.meta` → `globalThis.__importMeta__`
 * so that Vite-style env access works in a plain Node / jsdom environment.
 */
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' }, modules: 'commonjs' }],
    ['@babel/preset-typescript'],
  ],
  plugins: [
    /** Replace `import.meta` with the global stub set in jest.setup.cjs */
    function transformImportMeta() {
      return {
        visitor: {
          MetaProperty(path) {
            if (
              path.node.meta.name === 'import' &&
              path.node.property.name === 'meta'
            ) {
              path.replaceWithSourceString(
                '(globalThis.__importMeta__ || { env: {} })'
              );
            }
          },
        },
      };
    },
  ],
};
