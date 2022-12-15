'use strict';

var fs = require('node:fs');
var os = require('node:os');
var path = require('node:path');
var cnst = require('node:constants');
var rimraf = require('rimraf');
var node_child_process = require('node:child_process');
var findConfig = require('find-config');
var wordWrap = require('word-wrap');

var log = console;

const paths = [];
const flags = cnst.O_CREAT | cnst.O_TRUNC | cnst.O_RDWR | cnst.O_EXCL; // open flags
const mode = cnst.S_IRUSR | cnst.S_IWUSR; // file permissions
const dir = path.resolve(os.tmpdir());
let tracking = false;
let attached = false;
const addListener = () => {
    if (!attached) {
        process.addListener('exit', function () {
            try {
                let path = paths.length > 0
                    ? paths.shift()
                    : null;
                while (path) {
                    rimraf.sync(path, { maxBusyTries: 6 });
                    path = paths.shift();
                }
            }
            catch (err) {
                console.warn('Fail to clean temporary files on exit : ', err);
                throw err;
            }
        });
        attached = true;
    }
};
const promisify = (cb) => {
    let promise = null;
    let callback = cb;
    if (typeof callback !== 'function') {
        promise = new Promise(function (resolve, reject) {
            callback = (err, ...args) => {
                process.nextTick(function () {
                    if (err) {
                        reject(err);
                    }
                    else if (args.length === 1) {
                        resolve(args[0]);
                    }
                    else {
                        resolve(args);
                    }
                });
            };
        });
    }
    return {
        promise: promise,
        callback: callback
    };
};
const pathify = (prefix) => {
    const now = new Date();
    const name = [prefix, now.getFullYear(), now.getMonth(), now.getDate(), '-', process.pid, '-', (Math.random() * 0x100000000 + 1).toString(36)].join('');
    return path.join(dir, name);
};
const open = (cb) => {
    const path = pathify('f-');
    const p = promisify(cb);
    fs.open(path, flags, mode, (err, fd) => {
        if (!err && tracking) {
            paths.push(path);
            addListener();
        }
        p.callback(err, { path, fd });
    });
    return p.promise;
};
var track = (track) => {
    tracking = track !== false;
    return { open: open };
};

function editor (file, cb) {
    const editor = /^win/.test(process.platform) ? 'notepad' : 'vim';
    const args = editor.split(/\s+/);
    const bin = args.shift();
    const ps = node_child_process.spawn(bin, args.concat([file]), { stdio: 'inherit' });
    ps.on('exit', cb);
}

var readConfig = (config = '.cz-message.js') => {
    const czConfig = findConfig.require(config, { home: false });
    if (czConfig) {
        return czConfig;
    }
    log.error('Unable to find a configuration file. Please look documentation: https://github.com/linpengteng/cz-message-helper#Usage');
};

const initialize = (result) => {
    const chars = ['`', '"', '\\$', '!', '<', '>', '&'];
    for (const char of chars)
        result = result.replace(new RegExp(char, 'g'), `\\${char}`);
    return result.replace(/\\n/g, '\n');
};
var buildCommit = (config, answers) => {
    const wrap = (str, opt) => wordWrap(str, { width: 100, indent: '', ...opt });
    return initialize(config.templater?.(answers, wrap) || '');
};

var enConfig = {
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
        answers.scope = value || '';
        return value || ''
      }
    },

    {
      type: 'input',
      name: 'subject',
      message: 'Please write a SHORT tense description of the change(word number less than 50):',
      validate(value) {
        return value.length > 50
          ? `Exceed limit: 50`
          : true
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
        return ['feat', 'fix'].includes(answers.type.toLowerCase())
      }
    },

    {
      type: 'input',
      name: 'footer',
      message: 'Please list any ISSUES CLOSED by this change (optional). Eg: #31, #34:'
    }
  ],

  templater: (answers, wrap) => {
    let template = '';

    template += answers.type ? `${answers.type}` : ``;
    template += answers.scope ? `(${answers.scope})` : ``;
    template += answers.subject ? `: ${answers.subject}` : ``;
    template += answers.body ? `\n\n${wrap(answers.body)}` : ``;
    template += answers.breaking ? `\n\nBREAKING CHANGE: ${wrap(answers.breaking)}` : ``;
    template += answers.footer ? `\n\nISSUES CLOSED: ${wrap(answers.footer)}` : ``;

    return template
  },

  language: 'en'
};

var znConfig = {
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
        answers.scope = value || '';
        return value || ''
      }
    },

    {
      type: 'input',
      name: 'subject',
      message: '请简明扼要的摘要描述(建议字数在50字内):',
      validate(value) {
        return value.length > 50
          ? `[subject] Exceed limit: 50`
          : true
      }
    },

    {
      type: 'input',
      name: 'body',
      message: '请提供更详细的变更说明(可选), 使用“\\n”换行:'
    },

    {
      type: 'input',
      name: 'breaking',
      message: '请列出任何重大变化(可选)\n',
      when(answers) {
        return ['feat', 'fix'].includes(answers.type.toLowerCase())
      }
    },

    {
      type: 'input',
      name: 'footer',
      message: '请列出此更改关闭的任何问题(可选), 例如: #31,#34:'
    }
  ],

  templater: (answers, wrap) => {
    let template = '';

    template += answers.type ? `${answers.type}` : ``;
    template += answers.scope ? `(${answers.scope})` : ``;
    template += answers.subject ? `: ${answers.subject}` : ``;
    template += answers.body ? `\n\n${wrap(answers.body)}` : ``;
    template += answers.breaking ? `\n\nBREAKING CHANGE: ${wrap(answers.breaking)}` : ``;
    template += answers.footer ? `\n\nISSUES CLOSED: ${wrap(answers.footer)}` : ``;

    return template
  },

  language: 'cn'
};

var megreConfig = (cfg) => {
    const def = cfg?.language === 'cn'
        ? znConfig
        : enConfig;
    const lastCfg = {
        type: 'expand',
        name: 'confirmCommit',
        default: 0,
        choices: [
            { key: 'y', name: cfg?.language !== 'cn' ? 'Yes' : '提交', value: 'yes' },
            { key: 'n', name: cfg?.language !== 'cn' ? 'Abort commit' : '取消', value: 'no' },
            { key: 'e', name: cfg?.language !== 'cn' ? 'Edit message' : '修改', value: 'edit' }
        ],
        message(answers) {
            const sep = '###--------------------------------------------------------###';
            const msg = buildCommit(finalConfig, answers);
            log.info(`\n${sep}\n${msg}\n${sep}\n`);
            return cfg?.language !== 'cn'
                ? 'Are you sure you want to proceed with the commit above?'
                : '您确定要继续执行上面的提交吗？';
        }
    };
    const cfgQuestions = cfg && cfg.questions;
    const cfgTemplater = cfg && cfg.templater;
    const defTemplater = def.templater;
    const defQuestions = def.questions;
    const lastQuestion = (cfgQuestions || defQuestions)[0];
    const pushQuestion = lastQuestion.name !== 'confirmCommit' ? [lastCfg] : [];
    const finalConfig = {
        questions: [...(cfgQuestions || defQuestions), ...pushQuestion],
        templater: cfgTemplater || defTemplater
    };
    return finalConfig;
};

var index = {
    prompter(cz, commit) {
        const config = megreConfig(readConfig());
        const questions = config.questions;
        cz.prompt(questions).then(answers => {
            if (answers.confirmCommit === 'no') {
                log.info('Commit has been canceled.');
                return;
            }
            if (answers.confirmCommit === 'yes') {
                commit(buildCommit(config, answers));
                return;
            }
            track().open((err, info) => {
                if (!err) {
                    fs.writeSync(info.fd, buildCommit(config, answers));
                    fs.close(info.fd, () => {
                        editor(info.path, code => {
                            code === 0
                                ? commit(fs.readFileSync(info.path, { encoding: 'utf8' }))
                                : log.info(`Editor returned non zero value. Commit message was:\n${buildCommit(config, answers)}`);
                        });
                    });
                }
            });
        });
    }
};

module.exports = index;
