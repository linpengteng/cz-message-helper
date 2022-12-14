import findConfig from 'find-config'
import log from '../util/logger'

export default (config = '.cz-message.js') => {
  const czConfig = findConfig.require(config, { home: false })

  if (czConfig) {
    return czConfig
  }

  log.error('Unable to find a configuration file. Please look documentation: https://github.com/linpengteng/cz-message-helper#Usage')
}
