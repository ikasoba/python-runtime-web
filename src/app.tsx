import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import preactLogo from './assets/preact.svg'
import './app.css'
import { loadPyodide, PyodideInterface } from './pyodide/'
import usePyodide from './customHooks/usePyodide'
import { Terminal } from 'xterm'
import Term from './components/Term'
import { FitAddon } from 'xterm-addon-fit'
import Tab from './components/Tab'

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
  const cwd: string[] = pyodide.FS.readdir(pyodide.FS.cwd())
  cwd.forEach(function self(x){
    if (x.match(/^(\.+)$/))return;
    console.log(x, pyodide.FS.isDir(pyodide.FS.stat(x).mode), pyodide.FS.stat(x))
    if (pyodide.FS.isDir(pyodide.FS.stat(x).mode)){
      pyodide.FS.chdir(x)
      pyodide.FS.readdir(".").forEach(self)
      pyodide.FS.chdir("..")
      pyodide.FS.rmdir(x)
    }else pyodide.FS.unlink(x)
  })
  console.log(cwd, pyodide.FS.readdir(pyodide.FS.cwd()))
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

  function XTermWrapper(){
    const termElm = useMemo(
      () => (
        <Term
          addons={[fitAddon]} ref={term} attrs={{style: {
            height: "calc(100% - 1.5rem)",
            background: "black"
          }}}
        />
      ),
      []
    )
    useEffect(() => {
      fitAddon.fit()
    })
    return <div style={{height: "100%"}}>{termElm}</div>
  }

  useEffect(() => {
    fitAddon.fit()
    const listener = () => fitAddon.fit()
    window.addEventListener("resize", listener)
    return () => {
      window.removeEventListener("resize", listener)
    }
  }, [])

  return (
    <div style={{display: "flex", flexDirection: "column", height: "100%", maxHeight: "100vh",}}>
      <Tab
        pages={[
          {
            name: "console",
            component: XTermWrapper,
          },
          {
            name: "test",
            component: () => <>1234</>
          }
        ]}
        attrs={{style: {
          height: "100%"
        }}}
      />
      <button onClick={() => pyodide && term.current && onOpenFolder(term.current, pyodide)} style={{height: "1.5rem", width: "100%", display: "block", padding: "0.25rem"}}>フォルダを開く</button>
    </div>
  )
}
