#!/usr/bin/env node

import fs from 'node:fs'
import log from './util/logger'
import track from './util/track'
import editor from './util/editor'
import readConfig from './lib/read-config'
import megreConfig from './lib/megre-config'
import buildCommit from './lib/build-commit'
import type inquirer from 'inquirer'


export default {
  prompter(cz: typeof inquirer, commit: Function) {
    const config = megreConfig(readConfig())
    const questions = config.questions

    cz.prompt(questions).then(answers => {
      if (answers.confirmCommit === 'no') {
        log.info('Commit has been canceled.')
        return
      }

      if (answers.confirmCommit === 'yes') {
        commit(buildCommit(config, answers))
        return
      }

      track().open((err: any, info: any) => {
        if (!err) {
          fs.writeSync(info.fd, buildCommit(config, answers))

          fs.close(info.fd, () => {
            editor(info.path, code => {
              code === 0
                ? commit(fs.readFileSync(info.path, { encoding: 'utf8' }))
                : log.info(`Editor returned non zero value. Commit message was:\n${buildCommit(config, answers)}`)
            })
          })
        }
      })
    })
  }
}
