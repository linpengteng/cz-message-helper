export default {
  questions: [
    {
      type: 'list',
      name: 'type',
      message: '选择要提交的更改类型:',
      choices: [
        { value: 'fix', name: 'fix: -------- 修复BUG' },
        { value: 'feat', name: 'feat: ------- 新功能' },
        { value: 'begin', name: 'begin: ------ 创建新存储库' },
        { value: 'docs', name: 'docs: ------- 仅文档更改' },
        { value: 'style', name: 'style: ------ 不影响代码运行的更改(调整空白、格式、缺少分号等)' },
        { value: 'chore', name: 'chore: ------ 对构建过程或辅助工具的更改以及文档生成等库' },
        { value: 'refactor', name: 'refactor: --- 重构架构或代码' },
        { value: 'perf', name: 'perf:  ------ 改进性能的代码更改' },
        { value: 'test', name: 'test:  ------ 添加测试单元' },
        { value: 'revert', name: 'revert: ----- 回退至某一个版本' },
        { value: 'merge', name: 'merge: ------ 合并一个分支, 解决冲突分支' },
        { value: 'wip', name: 'wip: -------- 正在进行中的工作' }
      ]
    },

    {
      type: 'list',
      name: 'scope',
      message: '请选择更改的范围:',
      choices() {
        return [
          { name: '无', value: false },
          { name: '自定义', value: 'custom' }
        ]
      },
      filter(value, answers) {
        return value || ''
      }
    },

    {
      type: 'input',
      name: 'customScope',
      message: '请输入自定义的变更的范围(可选):',
      when(answers) {
        return answers.scope === 'custom'
      },
      filter(value, answers) {
        answers.scope = value || ''
        return ''
      }
    },

    {
      type: 'input',
      name: 'subject',
      message: '简明扼要的摘要描述(建议字数在50字内):\n',
      validate(value) {
        return value.length > 50
          ? `[subject] Exceed limit: 50`
          : true
      }
    },

    {
      type: 'input',
      name: 'body',
      message: '提供更详细的变更说明(可选), 使用“\\n”换行:\n'
    },

    {
      type: 'input',
      name: 'breaking',
      message: '列出任何重大变化(可选)\n',
      when(answers) {
        return ['feat', 'fix'].includes(answers.type.toLowerCase())
      }
    },

    {
      type: 'input',
      name: 'footer',
      message: '列出此更改关闭的任何问题(可选), 例如: #31,#34:\n'
    }
  ],

  templater: (answers, wrap) => {
    let template = ''

    template += answers.type ? `${answers.type}` : ``
    template += answers.scope ? `(${answers.scope})` : ``
    template += answers.subject ? `: ${answers.subject}` : ``
    template += answers.body ? `\n\n${wrap(answers.body)}` : ``
    template += answers.breaking ? `\n\nBREAKING CHANGE: ${wrap(answers.breaking)}` : ``
    template += answers.footer ? `\n\nISSUES CLOSED: ${wrap(answers.footer)}` : ``

    return template
  },

  language: 'zh'
}
