import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import { DEFAULT_EXTENSIONS } from '@babel/core';
import pkg from './package.json';

const isProd = process.env.NODE_ENV === 'production'
const extensions = [...DEFAULT_EXTENSIONS,'.ts','.tsx']
const name = 'toyReact'

export default {
  input: './src/index.tsx',
  output: [
    {
      file: pkg.main,
      format: 'iife',
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
    serve(),
    livereload(),
  ],
}
