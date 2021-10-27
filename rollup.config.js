import babel from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';
import size from 'rollup-plugin-size';
import { terser } from 'rollup-plugin-terser';

const pkg = require('./package.json');

const external = Object.keys(pkg.peerDependencies).concat(/@babel\/runtime/);

const extensions = ['.js', '.tsx'];

const sharedPlugins = [
  typescript({ tsconfig: './tsconfig.json' }),
  babel({
    babelHelpers: 'runtime',
    exclude: 'node_modules/**',
    extensions,
  }),
  size(),
];

const formats = [
  { format: 'umd', file: pkg.umd, plugins: sharedPlugins.concat([terser({ format: { comments: false } })]) },
  { format: 'cjs', file: pkg.main, plugins: sharedPlugins },
  { format: 'es', file: pkg.module, plugins: sharedPlugins },
];

const globals = {
  react: 'React',
  'react-router-dom': 'ReactRouterDom',
};

export default formats.map(({ plugins, file, format }) => ({
  input: 'src/index.tsx',
  plugins,
  external,
  output: {
    exports: 'named',
    file,
    format,
    name: 'react-router-breadcrumbs-hoc',
    globals: format !== 'umd'
      ? globals
      : {
        ...globals,
        '@babel/runtime/helpers/toConsumableArray': '_toConsumableArray',
        '@babel/runtime/helpers/defineProperty': '_defineProperty',
        '@babel/runtime/helpers/objectWithoutProperties': '_objectWithoutProperties',
      },
  },
}));
