/// <reference types="wicg-file-system-access" />

import { PyodideInterface } from "~/pyodide";
import { PythonRuntime } from "~/runtime/runtime";
import { createEffect, createSignal } from "solid-js";
import { Terminal } from "xterm";
import Term from "~/components/Term";

export default function Home() {
  const onOpenFolder = async () => {
    const py = pyodide()
    if (!py)return;
    const handle = await showDirectoryPicker({
      mode: "readwrite"
    })
    const recursive = async(path: string, h: FileSystemDirectoryHandle | FileSystemFileHandle) => {
      console.log(path, h)
      if (h.kind == "file"){
        py.FS.writeFile(
          path,
          await h.getFile().then(async x => new Uint8Array(await x.arrayBuffer()))
        )
      }else{
        py.FS.mkdir(path)
        for await (const [k, v] of h.entries()){
          recursive(path + "/" + k, v)
        }
      }
    }
    for await (const [k, v] of handle.entries()){
      if (k == "requirements.txt" && v.kind == "file"){
        const packages = await v.getFile().then(x => x.text())
        py.loadPackage(packages.split(/\r\n|\n|\r/))
      }
      await recursive(k, v)
    }
    console.log(py)
    const ns = py.globals.get("dict")()
    py.pyodide_py.code.eval_code(
      await handle.getFileHandle("main.py").then(x => x.getFile()).then(x => x.text()),
      ns
    )
  }
  const [pyodide, setPyodide] = createSignal<PyodideInterface>()
  const [terminal, setTerminal] = createSignal<Terminal>()

  createEffect(async() => {const term = terminal();if (!term)return;
    const pyodide = await PythonRuntime.initPyodide(term)
    setPyodide(pyodide)
    term.write("\x1B[2J\x1B[1;1H")
  }, terminal)

  return (
    <div>
      <Term setTerm={setTerminal} />
      <button onClick={onOpenFolder} class="rounded-none w-full">フォルダを読み込む</button>
    </div>
  );
}
