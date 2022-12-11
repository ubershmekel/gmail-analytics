import { build } from 'esbuild';
import { copy } from 'esbuild-plugin-copy';

(async () => {
  const res = await build({
    entryPoints: [
      './src/extensionInjector.js',
      './src/gmailJsLoader.js',
      './src/extension.js',
    ],
    bundle: true,
    sourcemap: true,
    target: 'es6',
    outdir: './dist/js',
    plugins: [
      copy({
        // this is equal to process.cwd(), which means we use cwd path as base path to resolve `to` path
        // if not specified, this plugin uses ESBuild.build outdir/outfile options as base path.
        resolveFrom: 'cwd',
        assets: {
          from: ['./public/**/*'],
          to: ['./dist',],
        },
      }),
    ],
  });
})();
