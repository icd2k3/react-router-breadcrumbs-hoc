import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import { uglify } from 'rollup-plugin-uglify';

const pkg = require('./package.json');

const external = Object.keys(pkg.peerDependencies);

const plugins = [
  babel({
    exclude: 'node_modules/**',
  }),
  resolve({
    mainFields: ['module', 'main', 'umd'],
  }),
];

const exports = [
  { format: 'cjs', file: pkg.main, plugins: plugins.concat([commonjs(), uglify()]) },
  { format: 'umd', file: pkg.umd, plugins: plugins.concat([commonjs(), uglify()]) },
  { format: 'es', file: pkg.module, plugins },
];

const globals = {
  react: 'React',
  'react-router': 'ReactRouter',
};

export default exports.map((item) => ({
  input: 'src/index.js',
  plugins: item.plugins,
  external,
  output: {
    exports: 'named',
    file: item.file,
    format: item.format,
    name: 'react-router-breadcrumbs-hoc',
    globals,
    sourcemap: true,
  },
}));
