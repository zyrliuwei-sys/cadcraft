/** @type {import('@inlang/paraglide-js').CompilerOptions} */
export const paraglideConfig = {
  project: './project.inlang',
  outdir: './src/paraglide',
  outputStructure: 'message-modules',
  // Explicit paths only: never infer a language from cookies or browser headers.
  strategy: ['url', 'baseLocale'],
  urlPatterns: [
    ...['/', '/download', '/dwg-viewer'].map((path) => ({
      pattern: path,
      localized: [
        ['en', path],
        ['pt-BR', '/pt' + path],
        ['it-IT', '/it' + path],
        ['de-DE', '/de' + path],
      ],
    })),
    {
      pattern: '/api/:path(.*)?',
      localized: [['en', '/api/:path(.*)?']],
    },
    {
      pattern: '/:path(.*)?',
      localized: [['en', '/:path(.*)?']],
    },
  ],
};
