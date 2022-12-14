export default {
  questions: [
    {
      type: 'list',
      name: 'type',
      message: 'Select the type of change that you\'re committing:',
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
        { value: 'wip', name: 'wip: -------- Work in progress' }
      ]
    },

    {
      type: 'list',
      name: 'scope',
      message: 'Select the SCOPE of this change (optional):',
      choices() {
        return [
          { name: 'empty', value: false },
          { name: 'custom', value: 'custom' }
        ]
      }
    },

    {
      type: 'input',
      name: 'customScope',
      message: 'Input the custom SCOPE of this change:',
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
      message: 'Write a SHORT tense description of the change(word number less than 50):\n',
      validate(value) {
        return value.length > 50
          ? `Exceed limit: 50`
          : true
      }
    },

    {
      type: 'input',
      name: 'body',
      message: 'Provide a LONGER description of the change (optional). Use "\\n" to break new line:\n'
    },

    {
      type: 'input',
      name: 'breaking',
      message: 'List any BREAKING CHANGES (optional):\n',
      when(answers) {
        return ['feat', 'fix'].includes(answers.type.toLowerCase())
      }
    },

    {
      type: 'input',
      name: 'footer',
      message: 'List any ISSUES CLOSED by this change (optional). Eg: #31, #34:\n'
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

  language: 'en'
}
