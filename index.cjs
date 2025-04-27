#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var import_node_fs2 = __toESM(require("fs"));

// src/util/track.ts
var import_node_os = __toESM(require("os"));
var import_node_fs = __toESM(require("fs"));
var import_node_path = __toESM(require("path"));
var import_node_constants = __toESM(require("constants"));
var import_rimraf = __toESM(require("rimraf"));
var paths = [];
var flags = import_node_constants.default.O_CREAT | import_node_constants.default.O_TRUNC | import_node_constants.default.O_RDWR | import_node_constants.default.O_EXCL;
var mode = import_node_constants.default.S_IRUSR | import_node_constants.default.S_IWUSR;
var dir = import_node_path.default.resolve(import_node_os.default.tmpdir());
var tracking = false;
var attached = false;
var addListener = () => {
  if (!attached) {
    process.addListener("exit", function() {
      try {
        let path2 = paths.length > 0 ? paths.shift() : null;
        while (path2) {
          import_rimraf.default.sync(path2, { maxRetries: 6 });
          path2 = paths.shift();
        }
      } catch (err) {
        console.warn("Fail to clean temporary files on exit : ", err);
        throw err;
      }
    });
    attached = true;
  }
};
var promisify = (cb) => {
  let callback = cb;
  const promise = new Promise((resolve, reject) => {
    callback = (err, data) => {
      cb?.(err, data);
      process.nextTick(function() {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    };
  });
  return {
    promise,
    callback
  };
};
var pathify = (prefix) => {
  const now = /* @__PURE__ */ new Date();
  const name = [prefix, now.getFullYear(), now.getMonth(), now.getDate(), "-", process.pid, "-", (Math.random() * 4294967296 + 1).toString(36)].join("");
  return import_node_path.default.join(dir, name);
};
var open = (cb) => {
  const path2 = pathify("f-");
  const p = promisify(cb);
  import_node_fs.default.open(path2, flags, mode, (err, fd) => {
    if (!err && tracking) {
      paths.push(path2);
      addListener();
    }
    p.callback(err, { path: path2, fd });
  });
  return p.promise;
};
var track_default = (track) => {
  tracking = track !== false;
  return { open };
};

// src/util/editor.ts
var import_node_child_process = require("child_process");
function editor_default(file, cb) {
  const editor = /^win/.test(process.platform) ? "notepad" : "vim";
  const args = editor.split(/\s+/);
  const bin = args.shift();
  const ps = (0, import_node_child_process.spawn)(
    bin,
    args.concat([file]),
    { stdio: "inherit" }
  );
  ps.on("exit", cb);
}

// src/util/logger.ts
var logger_default = console;

// src/lib/read-config.ts
var import_find_config = __toESM(require("find-config"));
var read_config_default = (config = ".cz-message.cjs") => {
  const pkg = import_find_config.default.require("package.json", { home: false });
  const czConfig = import_find_config.default.require(config, { home: false });
  if (typeof pkg === "object" && typeof pkg.config === "object" && typeof pkg.config["cz-message-helper"] === "object" && typeof pkg.config["cz-message-helper"].config === "string") {
    return import_find_config.default.require(pkg.config["cz-message-helper"].config, { home: false }) || czConfig;
  }
  if (czConfig) {
    return czConfig;
  }
  logger_default.error("Unable to find a configuration file. Please look documentation: https://github.com/linpengteng/cz-message-helper#Usage");
};

// src/lib/build-commit.ts
var import_word_wrap = __toESM(require("word-wrap"));
var build_commit_default = (config, answers) => {
  const wrap = (str, opt) => {
    return (0, import_word_wrap.default)(str, {
      width: 99999,
      indent: "",
      ...opt
    });
  };
  const format = (result) => {
    return result?.replace(/\\n/g, "\n") || "";
  };
  return format(config.templater?.(answers, wrap));
};

// src/util/configs.ts
var configs_default = {
  en: {
    questions: [
      {
        type: "list",
        name: "type",
        message: "Please select the type of change that you're committing:",
        choices: [
          { value: "fix", name: "fix: -------- A bug fix" },
          { value: "feat", name: "feat: ------- A new feature" },
          { value: "begin", name: "begin: ------ Begin new repository" },
          { value: "docs", name: "docs: ------- Documentation only changes" },
          { value: "style", name: "style: ------ Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)" },
          { value: "chore", name: "chore: ------ Changes to the build process or auxiliary tools and libraries such as documentation generation" },
          { value: "refactor", name: "refactor: --- A code change that neither fixes a bug nor adds a feature" },
          { value: "perf", name: "perf: ------- A code change that improves performance" },
          { value: "test", name: "test: ------- Add Test Unit" },
          { value: "revert", name: "revert: ----- Revert to a commit" },
          { value: "merge", name: "merge: ------ Merge from branches" },
          { value: "wip", name: "wip: -------- Work in progress" }
        ]
      },
      {
        type: "list",
        name: "scope",
        message: "Please select the SCOPE of this change (optional):",
        choices() {
          return [
            { name: "empty", value: false },
            { name: "custom", value: "custom" }
          ];
        }
      },
      {
        type: "input",
        name: "customScope",
        message: "Please input the custom SCOPE of this change:",
        when(answers) {
          return answers.scope === "custom";
        },
        filter(value, answers) {
          answers.scope = value || "";
          return value || "";
        }
      },
      {
        type: "input",
        name: "subject",
        message: "Please write a SHORT tense description of the change(word number less than 72):",
        validate(value) {
          if (!value.trim()) {
            return "Cannot be empty";
          }
          return value.length > 72 ? `Exceed limit: ${value.length} > 72` : true;
        },
        filter(value, answers) {
          return value.trim();
        }
      },
      {
        type: "input",
        name: "body",
        message: 'Please provide a LONGER description of the change (optional). Use "\\n" to break new line:'
      },
      {
        type: "input",
        name: "breaking",
        message: "Please list any BREAKING CHANGES (optional):",
        when(answers) {
          return /^(:[a-z0-9A-Z_-]+(:)(\s*))?(feat|fix)(\2\s*)?$/.test(answers.type.toLowerCase());
        }
      },
      {
        type: "input",
        name: "footer",
        message: "Please list any ISSUES CLOSED by this change (optional). Eg: #31, #34:"
      }
    ],
    templater: (answers, wrap) => {
      let template = "";
      template += answers.type ? `${answers.type}` : ``;
      template += answers.scope ? `(${answers.scope})` : ``;
      template += answers.subject ? `: ${answers.subject}` : ``;
      template += answers.body ? `

${wrap(answers.body)}` : ``;
      template += answers.breaking ? `

BREAKING CHANGE: ${wrap(answers.breaking)}` : ``;
      template += answers.footer ? `

ISSUES CLOSED: ${wrap(answers.footer)}` : ``;
      return template;
    },
    language: "en"
  },
  cn: {
    questions: [
      {
        type: "list",
        name: "type",
        message: "\u8BF7\u9009\u62E9\u8981\u63D0\u4EA4\u7684\u66F4\u6539\u7C7B\u578B:",
        choices: [
          { value: "fix", name: "fix: -------- \u4FEE\u590DBUG" },
          { value: "feat", name: "feat: ------- \u65B0\u529F\u80FD" },
          { value: "begin", name: "begin: ------ \u521B\u5EFA\u65B0\u5B58\u50A8\u5E93" },
          { value: "docs", name: "docs: ------- \u4EC5\u6587\u6863\u66F4\u6539" },
          { value: "style", name: "style: ------ \u4E0D\u5F71\u54CD\u4EE3\u7801\u8FD0\u884C\u7684\u66F4\u6539(\u8C03\u6574\u7A7A\u767D\u3001\u683C\u5F0F\u3001\u7F3A\u5C11\u5206\u53F7\u7B49)" },
          { value: "chore", name: "chore: ------ \u5BF9\u6784\u5EFA\u8FC7\u7A0B\u6216\u8F85\u52A9\u5DE5\u5177\u7684\u66F4\u6539\u4EE5\u53CA\u6587\u6863\u751F\u6210\u7B49\u5E93" },
          { value: "refactor", name: "refactor: --- \u91CD\u6784\u67B6\u6784\u6216\u4EE3\u7801" },
          { value: "perf", name: "perf:  ------ \u6539\u8FDB\u6027\u80FD\u7684\u4EE3\u7801\u66F4\u6539" },
          { value: "test", name: "test:  ------ \u6DFB\u52A0\u6D4B\u8BD5\u5355\u5143" },
          { value: "revert", name: "revert: ----- \u56DE\u9000\u81F3\u67D0\u4E00\u4E2A\u7248\u672C" },
          { value: "merge", name: "merge: ------ \u5408\u5E76\u4E00\u4E2A\u5206\u652F, \u89E3\u51B3\u51B2\u7A81\u5206\u652F" },
          { value: "wip", name: "wip: -------- \u6B63\u5728\u8FDB\u884C\u4E2D\u7684\u5DE5\u4F5C" }
        ]
      },
      {
        type: "list",
        name: "scope",
        message: "\u8BF7\u9009\u62E9\u66F4\u6539\u7684\u8303\u56F4:",
        choices() {
          return [
            { name: "\u65E0", value: false },
            { name: "\u81EA\u5B9A\u4E49", value: "custom" }
          ];
        },
        filter(value, answers) {
          return value || "";
        }
      },
      {
        type: "input",
        name: "customScope",
        message: "\u8BF7\u8F93\u5165\u81EA\u5B9A\u4E49\u7684\u53D8\u66F4\u7684\u8303\u56F4(\u53EF\u9009):",
        when(answers) {
          return answers.scope === "custom";
        },
        filter(value, answers) {
          answers.scope = value || "";
          return value || "";
        }
      },
      {
        type: "input",
        name: "subject",
        message: "\u8BF7\u7B80\u660E\u627C\u8981\u7684\u6458\u8981\u63CF\u8FF0(\u5EFA\u8BAE\u5B57\u6570\u572872\u5B57\u5185):",
        validate(value) {
          if (!value.trim()) {
            return "\u63CF\u8FF0\u5185\u5BB9\u4E0D\u53EF\u4E3A\u7A7A";
          }
          return value.trim().length > 72 ? `\u5B57\u6570\u8D85\u51FA\u9650\u5236: ${value.trim().length} > 72` : true;
        },
        filter(value, answers) {
          return value.trim();
        }
      },
      {
        type: "input",
        name: "body",
        message: "\u8BF7\u63D0\u4F9B\u66F4\u8BE6\u7EC6\u7684\u53D8\u66F4\u8BF4\u660E(\u53EF\u9009), \u4F7F\u7528\u201C\\n\u201D\u6362\u884C:"
      },
      {
        type: "input",
        name: "breaking",
        message: "\u8BF7\u5217\u51FA\u4EFB\u4F55\u91CD\u5927\u53D8\u5316(\u53EF\u9009)\n",
        when(answers) {
          return /^(:[a-z0-9A-Z_-]+(:)(\s*))?(feat|fix)(\2\s*)?$/.test(answers.type.toLowerCase());
        }
      },
      {
        type: "input",
        name: "footer",
        message: "\u8BF7\u5217\u51FA\u6B64\u66F4\u6539\u5173\u95ED\u7684\u4EFB\u4F55\u95EE\u9898(\u53EF\u9009), \u4F8B\u5982: #31,#34:"
      }
    ],
    templater: (answers, wrap) => {
      let template = "";
      template += answers.type ? `${answers.type}` : ``;
      template += answers.scope ? `(${answers.scope})` : ``;
      template += answers.subject ? `: ${answers.subject}` : ``;
      template += answers.body ? `

${wrap(answers.body)}` : ``;
      template += answers.breaking ? `

BREAKING CHANGE: ${wrap(answers.breaking)}` : ``;
      template += answers.footer ? `

ISSUES CLOSED: ${wrap(answers.footer)}` : ``;
      return template;
    },
    language: "cn"
  }
};

// src/lib/megre-config.ts
var megre_config_default = (cfg) => {
  const def = cfg?.language === "cn" ? configs_default.cn : configs_default.en;
  const lastCfg = {
    type: "expand",
    name: "confirmCommit",
    default: 0,
    choices: [
      { key: "y", name: cfg?.language !== "cn" ? "Yes" : "\u63D0\u4EA4", value: "yes" },
      { key: "n", name: cfg?.language !== "cn" ? "Abort commit" : "\u53D6\u6D88", value: "no" },
      { key: "e", name: cfg?.language !== "cn" ? "Edit message" : "\u4FEE\u6539", value: "edit" }
    ],
    message(answers) {
      const sep = "###--------------------------------------------------------###";
      const msg = build_commit_default(finalConfig, answers);
      logger_default.info(`
${sep}
${msg}
${sep}
`);
      return cfg?.language !== "cn" ? "Are you sure you want to proceed with the commit above?" : "\u60A8\u786E\u5B9A\u8981\u7EE7\u7EED\u6267\u884C\u4E0A\u9762\u7684\u63D0\u4EA4\u5417\uFF1F";
    }
  };
  const cfgQuestions = cfg && cfg.questions;
  const cfgTemplater = cfg && cfg.templater;
  const defTemplater = def.templater;
  const defQuestions = def.questions;
  const lastQuestion = (cfgQuestions || defQuestions)[0];
  const pushQuestion = lastQuestion.name !== "confirmCommit" ? [lastCfg] : [];
  const finalConfig = {
    questions: [...cfgQuestions || defQuestions, ...pushQuestion],
    templater: cfgTemplater || defTemplater
  };
  return finalConfig;
};

// src/index.ts
var index_default = {
  prompter(cz, commit) {
    const config = megre_config_default(read_config_default());
    const questions = config.questions;
    cz.prompt(questions).then((answers) => {
      if (answers.confirmCommit === "no") {
        logger_default.info("Commit has been canceled.");
        return;
      }
      if (answers.confirmCommit === "yes") {
        commit(build_commit_default(config, answers));
        return;
      }
      track_default().open((err, info) => {
        if (!err) {
          import_node_fs2.default.writeSync(info.fd, build_commit_default(config, answers));
          import_node_fs2.default.close(info.fd, () => {
            editor_default(info.path, (code) => {
              if (code !== 0) logger_default.info(`Editor returned non zero value. Commit message was:
${build_commit_default(config, answers)}`);
              if (code === 0) commit(import_node_fs2.default.readFileSync(info.path, { encoding: "utf8" }));
            });
          });
        }
      });
    });
  }
};
