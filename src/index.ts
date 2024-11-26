#!/usr/bin/env node

import fs from 'node:fs'
import track from './util/track'
import editor from './util/editor'
import logger from './util/logger'
import readConfig from './lib/read-config'
import megreConfig from './lib/megre-config'
import buildCommit from './lib/build-commit'

export default {
  prompter(cz: any, commit: any) {
    const config = megreConfig(readConfig())
    const questions = config.questions as any

    cz.prompt(questions).then((answers: any) => {
      if (answers.confirmCommit === 'no') {
        logger.info('Commit has been canceled.')
        return
      }

      if (answers.confirmCommit === 'yes') {
        commit(buildCommit(config, answers))
        return
      }

      track().open((err, info) => {
        if (!err) {
          fs.writeSync(info.fd, buildCommit(config, answers))

          fs.close(info.fd, () => {
            editor(info.path, code => {
              if (code !== 0) logger.info(`Editor returned non zero value. Commit message was:\n${buildCommit(config, answers)}`)
              if (code === 0) commit(fs.readFileSync(info.path, { encoding: 'utf8' }))
            })
          })
        }
      })
    })
  },
}
