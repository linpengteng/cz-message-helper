module.exports = {
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
        { value: 'wip', name: 'wip: -------- Work in progress' }
      ]
    },

    {
      type: 'list',
      name: 'scope',
      message: 'Please select the SCOPE of this change (optional):',
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
      message: 'Please input the custom SCOPE of this change:',
      when(answers) {
        return answers.scope === 'custom'
      },
      filter(value, answers) {
        answers.scope = value || ''
        return value || ''
      }
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
      }
    },

    {
      type: 'input',
      name: 'body',
      message: 'Please provide a LONGER description of the change (optional). Use "\\n" to break new line:'
    },

    {
      type: 'input',
      name: 'breaking',
      message: 'Please list any BREAKING CHANGES (optional):',
      when(answers) {
        return /^(:[a-z0-9A-Z_-]+(:)(\s*))?(feat|fix)(\2\s*)?$/.test(answers.type.toLowerCase())
      }
    },

    {
      type: 'input',
      name: 'footer',
      message: 'Please list any ISSUES CLOSED by this change (optional). Eg: #31, #34:'
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
