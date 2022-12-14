import type { Answers, ListQuestion, InputQuestion, NumberQuestion, ExpandQuestion, ConfirmQuestion } from 'inquirer'
import wordWrap from 'word-wrap'


interface TypeConfig {
  questions?: Array<ListQuestion | InputQuestion | NumberQuestion | ExpandQuestion | ConfirmQuestion> | null
  templater?: ((answers: Answers, wrap: Function) => string) | null,
  language?: 'en' | 'zh' | null
}


const initialize = (result: string) => {
  const chars = ['`', '"', '\\$', '!', '<', '>', '&']
  for (const char of chars) result = result.replace(new RegExp(char, 'g'), `\\${char}`)
  return result.replace(/\\n/g, '\n')
}


export default (config: TypeConfig, answers: Answers) => {
  const wrap = (str: any, opt: any) => wordWrap(str, { width: 100, indent: '', ...opt })
  return initialize(config.templater?.(answers, wrap) || '')
}
