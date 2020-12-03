import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import { DEFAULT_EXTENSIONS } from '@babel/core';
import pkg from './package.json';

const isProd = process.env.NODE_ENV === 'production'
const extensions = [...DEFAULT_EXTENSIONS,'.ts','.tsx']
const name = 'toyReact'

export default {
  input: './src/toy-react.ts',
  output: [
    {
      file: pkg.main,
      format: 'es',
      name,
    },
  ],
  plugins: [
    typescript({
      rollupCommonJSResolveHack: true,
      clean:true
    }),
    babel({
      extensions,
      exclude: 'node_modules/**',
    }),
    resolve(),
    commonjs(),
  ],
}
