import findConfig from 'find-config'
import log from '../util/logger'

export default (config = '.cz-message.js') => {
  const pkg = findConfig.require('package.json', { home: false })
  const czConfig = findConfig.require(config, { home: false })

  if (typeof pkg === 'object' && typeof pkg.config === 'object' && typeof pkg.config['cz-message-helper'] === 'object' && typeof pkg.config['cz-message-helper'].config === 'string') {
    return findConfig.require(pkg.config['cz-message-helper'].config, { home: false }) || czConfig
  }

  if (czConfig) {
    return czConfig
  }

  log.error('Unable to find a configuration file. Please look documentation: https://github.com/linpengteng/cz-message-helper#Usage')
}
