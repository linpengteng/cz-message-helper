'use strict';

var fs = require('node:fs');
var os = require('node:os');
var path = require('node:path');
var cnst = require('node:constants');
var rimraf = require('rimraf');
var node_child_process = require('node:child_process');
var findConfig = require('find-config');
var wordWrap = require('word-wrap');
var enConfig = require('./src/config.en.js');
var cnConfig = require('./src/config.cn.js');

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
    const pkg = findConfig.require('package.json', { home: false });
    const czConfig = findConfig.require(config, { home: false });
    if (typeof pkg === 'object' && typeof pkg.config === 'object' && typeof pkg.config['cz-message-helper'] === 'object' && typeof pkg.config['cz-message-helper'].config === 'string') {
        return findConfig.require(pkg.config['cz-message-helper'].config, { home: false }) || czConfig;
    }
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

var megreConfig = (cfg) => {
    const def = cfg?.language === 'cn'
        ? cnConfig
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
