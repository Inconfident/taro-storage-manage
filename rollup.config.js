import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
// import { terser } from 'rollup-plugin-terser'
import babel from "rollup-plugin-babel";
import typescript from 'rollup-plugin-typescript';

const banner = '#!/usr/bin/env node'
export default {
  input: './src/index.ts',
  output: {
    exports: 'auto',
    file: './dist/index.js',
    format: 'esm',
    name: 'taro-storage-manage',
    banner
  },
  plugins: [
    babel({
        runtimeHelpers: true,
        exclude: "node_modules/**",
        externalHelpers: true
      }),
    commonjs(),
    typescript(),
    nodeResolve({
      preferBuiltins: true,
    }),
    // terser(),
  ],
}
