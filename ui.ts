import { Terminal } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import { PythonRuntime } from "./runtime"

document.addEventListener("load", async() => {
  const term = new Terminal();
  const fitAddon = new FitAddon()
  term.loadAddon(fitAddon)
  term.open(document.getElementById("term"))
  fitAddon.fit()
  window.addEventListener("resize", () => fitAddon.fit())
  document.getElementById("open-folder").addEventListener("click", onOpenFolder)
  const pyodide = await PythonRuntime.initPyodide(term)
  term.write("\x1B[2J\x1B[1;1H")
})