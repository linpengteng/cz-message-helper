import type { Question } from './build-commit'
import type { Answers } from './build-commit'
import type { Config } from './build-commit'
import buildCommit from './build-commit'
import configs from '../util/configs'
import logger from '../util/logger'

export default (cfg: Config) => {
  const def = cfg?.language === 'cn'
    ? configs.cn
    : configs.en

  const lastCfg: Question = {
    type: 'expand',
    name: 'confirmCommit',
    default: 0,
    choices: [
      { key: 'y', name: cfg?.language !== 'cn' ? 'Yes' : '提交', value: 'yes' },
      { key: 'n', name: cfg?.language !== 'cn' ? 'Abort commit' : '取消', value: 'no' },
      { key: 'e', name: cfg?.language !== 'cn' ? 'Edit message' : '修改', value: 'edit' },
    ],
    message(answers: Answers) {
      const sep = '###--------------------------------------------------------###'
      const msg = buildCommit(finalConfig, answers)

      logger.info(`\n${sep}\n${msg}\n${sep}\n`)

      return cfg?.language !== 'cn'
        ? 'Are you sure you want to proceed with the commit above?'
        : '您确定要继续执行上面的提交吗？'
    },
  }

  const cfgQuestions = cfg && cfg.questions
  const cfgTemplater = cfg && cfg.templater
  const defTemplater = (def as Config).templater!
  const defQuestions = (def as Config).questions!
  const lastQuestion = (cfgQuestions || defQuestions)[0]
  const pushQuestion = lastQuestion.name !== 'confirmCommit' ? [lastCfg] : []

  const finalConfig = {
    questions: [...(cfgQuestions || defQuestions), ...pushQuestion],
    templater: cfgTemplater || defTemplater,
  }

  return finalConfig
}
