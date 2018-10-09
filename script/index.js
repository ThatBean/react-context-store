import { resolve } from 'path'
import { execSync } from 'child_process'

import { binary } from 'dr-js/module/common/format'

import { getScriptFileListFromPathList } from 'dr-dev/module/node/fileList'
import { argvFlag, runMain } from 'dr-dev/module/main'
import { initOutput, packOutput, publishOutput } from 'dr-dev/module/output'
import { processFileList, fileProcessorBabel } from 'dr-dev/module/fileProcessor'
import { getTerserOption, minifyFileListWithTerser } from 'dr-dev/module/minify'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)
const execOptionRoot = { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore', 'inherit' ] : 'inherit', shell: true }

runMain(async (logger) => {
  const { padLog, log } = logger

  padLog('generate spec')
  execSync(`npm run script-generate-spec`, execOptionRoot)

  const packageJSON = await initOutput({ fromRoot, fromOutput, logger })

  if (!argvFlag('pack')) return

  padLog(`build library`)
  execSync('npm run build-library', execOptionRoot)

  padLog(`minify output`)
  const fileList = await getScriptFileListFromPathList([ '.' ], fromOutput)
  let sizeCodeReduce = 0
  sizeCodeReduce += await minifyFileListWithTerser({ fileList, option: getTerserOption({ isReadable: true }), rootPath: PATH_OUTPUT, logger })
  sizeCodeReduce += await processFileList({ fileList, processor: fileProcessorBabel, rootPath: PATH_OUTPUT, logger })
  log(`total size reduce: ${binary(sizeCodeReduce)}B`)

  const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
  await publishOutput({ flagList: process.argv, packageJSON, pathPackagePack, logger })
})
