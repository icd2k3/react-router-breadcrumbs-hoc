import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

const pkg = require('./package.json');

const external = Object.keys(pkg.peerDependencies);

const globals = {
  react: 'React',
  'react-router': 'ReactRouter',
};

const config = {
  input: 'src/index.js',
  plugins: [
    babel({
      exclude: 'node_modules/**',
      plugins: ['external-helpers'],
    }),
    resolve({
      module: true,
      jsnext: true,
      main: true,
    }),
    commonjs(),
  ],
  external,
  output: [
    {
      file: pkg.main,
      format: 'umd',
      globals,
      name: 'react-router-breadcrumbs-hoc',
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: 'es',
      globals,
      sourcemap: true,
    },
  ],
};

export default config;
