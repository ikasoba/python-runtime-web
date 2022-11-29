import { loadPyodide } from "~/pyodide"
import type { Terminal } from "xterm"

export const PythonRuntime = {
  initPyodide(term: Terminal){
    return loadPyodide({
      stderr: m => {
        term.writeln(m)
      },
      stdout: m => {
        term.writeln(m)
      }
    })
  }
}