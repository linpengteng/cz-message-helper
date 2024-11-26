import { spawn } from 'node:child_process'

export default function(file: string, cb: (code: number | null) => void) {
  const editor = /^win/.test(process.platform) ? 'notepad' : 'vim'
  const args = editor.split(/\s+/)
  const bin = args.shift()

  const ps = spawn(
    bin!,
    args.concat([file]),
    { stdio: 'inherit' },
  )

  ps.on('exit', cb)
}
