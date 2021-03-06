import { resolve } from 'path'
import { writeFileSync } from 'fs'

import { runMain } from 'dr-dev/module/main'
import { collectSourceRouteMap } from 'dr-dev/module/node/export/parse'
import { generateExportInfo } from 'dr-dev/module/node/export/generate'
import { getMarkdownHeaderLink, renderMarkdownExportPath } from 'dr-dev/module/node/export/renderMarkdown'

const PATH_ROOT = resolve(__dirname, '..')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)

runMain(async (logger) => {
  logger.log(`collect sourceRouteMap`)
  const sourceRouteMap = await collectSourceRouteMap({ pathRootList: [ fromRoot('source') ], logger })

  logger.log(`generate exportInfo`)
  const exportInfoMap = generateExportInfo({ sourceRouteMap })

  logger.log(`output: SPEC.md`)
  writeFileSync(fromRoot('SPEC.md'), [
    '# Specification',
    '',
    ...[
      'Export Path'
    ].map((text) => `* ${getMarkdownHeaderLink(text)}`),
    '',
    '#### Export Path',
    ...renderMarkdownExportPath({ exportInfoMap, rootPath: PATH_ROOT }),
    ''
  ].join('\n'))
}, 'generate-export')
