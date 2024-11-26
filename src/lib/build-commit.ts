import { Question } from 'inquirer'
import { Answers } from 'inquirer'
import wordWrap from 'word-wrap'

export default (config: Config, answers: Answers) => {
  const wrap = (str: any, opt?: wordWrap.IOptions) => {
    return wordWrap(str, {
      width: 99999,
      indent: '',
      ...opt,
    })
  }

  const format = (result?: string) => {
    return result?.replace(/\\n/g, '\n') || ''
  }

  return format(config.templater?.(answers, wrap))
}

export interface Config {
  templater?: ((answers: Answers, wrap: typeof wordWrap) => string) | null;
  questions?: Array<Question> | null;
  language?: 'en' | 'cn' | null;
}

export type { Question }
export type { Answers }
