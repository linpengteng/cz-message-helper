import type { Answers, ListQuestion, InputQuestion, NumberQuestion, ExpandQuestion, ConfirmQuestion } from 'inquirer'
import buildCommit from './build-commit'
import enConfig from '../config.en'
import cnConfig from '../config.cn'
import log from '../util/logger'


interface TypeConfig {
  questions?: Array<ListQuestion | InputQuestion | NumberQuestion | ExpandQuestion | ConfirmQuestion> | null
  templater?: ((answers: Answers, wrap: Function) => string) | null,
  language?: 'en' | 'cn' | null
}


export default (cfg: TypeConfig) => {
  const def = cfg?.language === 'cn'
    ? cnConfig
    : enConfig


  const lastCfg: ExpandQuestion = {
    type: 'expand',
    name: 'confirmCommit',
    default: 0,
    choices: [
      { key: 'y', name: cfg?.language !== 'cn' ? 'Yes' : '提交', value: 'yes' },
      { key: 'n', name: cfg?.language !== 'cn' ? 'Abort commit' : '取消', value: 'no' },
      { key: 'e', name: cfg?.language !== 'cn' ? 'Edit message' : '修改', value: 'edit' }
    ],
    message(answers: Answers) {
      const sep = '###--------------------------------------------------------###'
      const msg = buildCommit(finalConfig, answers)

      log.info(`\n${sep}\n${msg}\n${sep}\n`)

      return cfg?.language !== 'cn'
        ? 'Are you sure you want to proceed with the commit above?'
        : '您确定要继续执行上面的提交吗？'
    }
  }

  const cfgQuestions = cfg && cfg.questions
  const cfgTemplater = cfg && cfg.templater
  const defTemplater = (def as TypeConfig).templater!
  const defQuestions = (def as TypeConfig).questions!
  const lastQuestion = (cfgQuestions || defQuestions)[0]
  const pushQuestion = lastQuestion.name !== 'confirmCommit' ? [lastCfg] : []


  const finalConfig = {
    questions: [...(cfgQuestions || defQuestions), ...pushQuestion],
    templater: cfgTemplater || defTemplater
  }

  return finalConfig
}
