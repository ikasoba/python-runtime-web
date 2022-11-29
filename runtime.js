globalThis.PythonRuntime = {
  initPyodide(term){
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