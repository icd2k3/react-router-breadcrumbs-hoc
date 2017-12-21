import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

const pkg = require('./package.json');

const external = Object.keys(pkg.peerDependencies);

const config = {
  input: 'src/index.jsx',
  globals: {
    react: 'React',
    'react-router': 'ReactRouter',
  },
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
      name: 'BreadCrumbs',
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
    },
  ],
};

export default config;
