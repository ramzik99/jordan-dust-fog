import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import serve from 'rollup-plugin-serve';
import svelte from 'rollup-plugin-svelte';
import swc from 'rollup-plugin-swc3';
import preprocess from 'svelte-preprocess';
import { transformCodeToESMPlugin, keyPEM, certificatePEM } from '@windycom/plugin-devtools';
export default {
  input: 'src/pluginEntry.svelte',
  output: [{ file: 'dist/plugin.js', format: 'module', sourcemap: true },
    { file: 'dist/plugin.min.js', format: 'module', plugins: [terser()] }],
  external: id => id.startsWith('@windy/'),
  plugins: [svelte({ emitCss: false, preprocess: preprocess() }),
    swc({ include: ['**/*.ts', '**/*.svelte'], sourceMaps: true }),
    resolve({ browser: true, dedupe: ['svelte'], preferBuiltins: false }), commonjs(),
    transformCodeToESMPlugin(),
    process.env.SERVE !== 'false' && serve({ contentBase: 'dist', host: '127.0.0.1', port: 9999,
      headers: { 'Access-Control-Allow-Origin': '*' }, https: { key: keyPEM, cert: certificatePEM } })],
};
