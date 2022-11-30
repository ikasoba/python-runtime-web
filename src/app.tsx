import { useEffect, useRef, useState } from 'preact/hooks'
import preactLogo from './assets/preact.svg'
import './app.css'
import { loadPyodide, PyodideInterface } from './pyodide'
import usePyodide from './customHooks/usePyodide'
import { Terminal } from 'xterm'
import Term from './components/Term'
import { FitAddon } from 'xterm-addon-fit'

const onOpenFolder = async (term: Terminal, pyodide: PyodideInterface) => {
  term.write("\x1b[2J\x1b[;H");
  const handle = await showDirectoryPicker({
    mode: "readwrite"
  })
  console.log(handle)
  const recursive = async(path: string, h: FileSystemDirectoryHandle | FileSystemFileHandle) => {
    console.log(path, h)
    if (h.kind == "file"){
      pyodide.FS.writeFile(
        path,
        await h.getFile().then(async x => new Uint8Array(await x.arrayBuffer()))
      )
    }else{
      pyodide.FS.mkdir(path)
      for await (const [k, v] of h.entries()){
        recursive(path + "/" + k, v)
      }
    }
  }
  for await (const [k, v] of handle.entries()){
    if (k == "requirements.txt" && v.kind == "file"){
      const packages = await v.getFile().then(x => x.text())
      pyodide.loadPackage(packages.split(/\r\n|\n|\r/))
    }
    await recursive(k, v)
  }
  console.log(pyodide)
  const ns = pyodide.globals.get("dict")()
  pyodide.pyodide_py.code.eval_code(
    await handle.getFileHandle("main.py").then(x => x.getFile()).then(x => x.text()),
    ns
  )
}

export function App() {
  const fitAddon = new FitAddon()
  const term = useRef<Terminal>(null)
  const pyodide = usePyodide({
    stderr: m => {
      term.current?.writeln(m)
    },
    stdout: m => {
      term.current?.writeln(m)
    }
  })

  useEffect(() => {
    fitAddon.fit()
    const listener = () => fitAddon.fit()
    document.addEventListener("resize", listener)
    return () => {
      document.removeEventListener("resize", listener)
    }
  }, [])

  return (
    <div>
      <Term addons={[fitAddon]} ref={term} attrs={{style: "width: 14rem; height: 14rem"}} />
      <button onClick={() => pyodide && term.current && onOpenFolder(term.current, pyodide)}>フォルダを開く</button>
    </div>
  )
}
