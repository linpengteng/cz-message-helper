import os from 'node:os'
import fs from 'node:fs'
import path from 'node:path'
import cnst from 'node:constants'
import rimraf from 'rimraf'


const paths = [] as string[]
const flags = cnst.O_CREAT | cnst.O_TRUNC | cnst.O_RDWR | cnst.O_EXCL // open flags
const mode = cnst.S_IRUSR | cnst.S_IWUSR // file permissions
const dir = path.resolve(os.tmpdir())

let tracking = false
let attached = false

const addListener = () => {
  if (!attached) {
    process.addListener('exit', function() {
      try {
        let path = paths.length > 0
          ? paths.shift()
          : null

        while (path) {
          rimraf.sync(path, { maxBusyTries: 6 })
          path = paths.shift()
        }
      } catch (err) {
        console.warn('Fail to clean temporary files on exit : ', err)
        throw err
      }
    })
    attached = true
  }
}

const promisify = (cb?: Function) => {
  let promise = null
  let callback = cb

  if (typeof callback !== 'function') {
    promise = new Promise(function(resolve, reject) {
      callback = (err: any, ...args: any[]) => {
        process.nextTick(function() {
          if (err) {
            reject(err)
          } else if (args.length === 1) {
            resolve(args[0])
          } else {
            resolve(args)
          }
        })
      }
    })
  }

  return {
    promise: promise,
    callback: callback!
  }
}

const pathify = (prefix: string) => {
  const now = new Date()
  const name = [prefix, now.getFullYear(), now.getMonth(), now.getDate(), '-', process.pid, '-', (Math.random() * 0x100000000 + 1).toString(36)].join('')
  return path.join(dir, name)
}

const open = (cb: Function) => {
  const path = pathify('f-')
  const p = promisify(cb)

  fs.open(path, flags, mode, (err, fd) => {
    if (!err && tracking) {
      paths.push(path)
      addListener()
    }
    p.callback(err, { path, fd })
  })

  return p.promise
}

export default (track?: boolean) => {
  tracking = track !== false
  return { open: open }
}
