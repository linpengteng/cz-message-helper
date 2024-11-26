// @ts-nocheck

export default {
  en: {
    questions: [
      {
        type: 'list',
        name: 'type',
        message: 'Please select the type of change that you\'re committing:',
        choices: [
          { value: 'fix', name: 'fix: -------- A bug fix' },
          { value: 'feat', name: 'feat: ------- A new feature' },
          { value: 'begin', name: 'begin: ------ Begin new repository' },
          { value: 'docs', name: 'docs: ------- Documentation only changes' },
          { value: 'style', name: 'style: ------ Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)' },
          { value: 'chore', name: 'chore: ------ Changes to the build process or auxiliary tools and libraries such as documentation generation' },
          { value: 'refactor', name: 'refactor: --- A code change that neither fixes a bug nor adds a feature' },
          { value: 'perf', name: 'perf: ------- A code change that improves performance' },
          { value: 'test', name: 'test: ------- Add Test Unit' },
          { value: 'revert', name: 'revert: ----- Revert to a commit' },
          { value: 'merge', name: 'merge: ------ Merge from branches' },
          { value: 'wip', name: 'wip: -------- Work in progress' },
        ],
      },

      {
        type: 'list',
        name: 'scope',
        message: 'Please select the SCOPE of this change (optional):',
        choices() {
          return [
            { name: 'empty', value: false },
            { name: 'custom', value: 'custom' },
          ]
        },
      },

      {
        type: 'input',
        name: 'customScope',
        message: 'Please input the custom SCOPE of this change:',
        when(answers) {
          return answers.scope === 'custom'
        },
        filter(value, answers) {
          answers.scope = value || ''
          return value || ''
        },
      },

      {
        type: 'input',
        name: 'subject',
        message: 'Please write a SHORT tense description of the change(word number less than 72):',
        validate(value) {
          if (!value.trim()) {
            return 'Cannot be empty'
          }

          return value.length > 72
            ? `Exceed limit: ${value.length} > 72`
            : true
        },
        filter(value, answers) {
          return value.trim()
        },
      },

      {
        type: 'input',
        name: 'body',
        message: 'Please provide a LONGER description of the change (optional). Use "\\n" to break new line:',
      },

      {
        type: 'input',
        name: 'breaking',
        message: 'Please list any BREAKING CHANGES (optional):',
        when(answers) {
          return /^(:[a-z0-9A-Z_-]+(:)(\s*))?(feat|fix)(\2\s*)?$/.test(answers.type.toLowerCase())
        },
      },

      {
        type: 'input',
        name: 'footer',
        message: 'Please list any ISSUES CLOSED by this change (optional). Eg: #31, #34:',
      },
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

    language: 'en',
  },
  cn: {
    questions: [
      {
        type: 'list',
        name: 'type',
        message: '请选择要提交的更改类型:',
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
          { value: 'wip', name: 'wip: -------- 正在进行中的工作' },
        ],
      },

      {
        type: 'list',
        name: 'scope',
        message: '请选择更改的范围:',
        choices() {
          return [
            { name: '无', value: false },
            { name: '自定义', value: 'custom' },
          ]
        },
        filter(value, answers) {
          return value || ''
        },
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
          return value || ''
        },
      },

      {
        type: 'input',
        name: 'subject',
        message: '请简明扼要的摘要描述(建议字数在72字内):',
        validate(value) {
          if (!value.trim()) {
            return '描述内容不可为空'
          }

          return value.trim().length > 72
            ? `字数超出限制: ${value.trim().length} > 72`
            : true
        },
        filter(value, answers) {
          return value.trim()
        },
      },

      {
        type: 'input',
        name: 'body',
        message: '请提供更详细的变更说明(可选), 使用“\\n”换行:',
      },

      {
        type: 'input',
        name: 'breaking',
        message: '请列出任何重大变化(可选)\n',
        when(answers) {
          return /^(:[a-z0-9A-Z_-]+(:)(\s*))?(feat|fix)(\2\s*)?$/.test(answers.type.toLowerCase())
        },
      },

      {
        type: 'input',
        name: 'footer',
        message: '请列出此更改关闭的任何问题(可选), 例如: #31,#34:',
      },
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

    language: 'cn',
  },
}
