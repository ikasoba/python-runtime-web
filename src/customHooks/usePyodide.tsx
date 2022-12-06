import { useEffect, useState } from "preact/hooks";
import { loadPyodide, PyodideInterface } from "../pyodide/";

type ExtractArgs<F extends (...a:any[])=>any> = F extends (...a: infer T) => any ? T : never

export default function usePyodide(o: ExtractArgs<typeof loadPyodide>[0]){
  const [pyodide, setPyodide] = useState<PyodideInterface>()

  useEffect(() => {
    (async()=>{
      const x = await loadPyodide(o)
      setPyodide(x)
    })()
  }, [])

  return pyodide
}