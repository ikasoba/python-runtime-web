import { forwardRef } from "preact/compat";
import { useEffect, useRef, useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";
import { ITerminalAddon, Terminal } from "xterm";
import "xterm/css/xterm.css"

export default forwardRef<Terminal, {addons?: ITerminalAddon[], attrs?: JSXInternal.HTMLAttributes<HTMLDivElement>}>(function Term(prop, ref){
  const rootRef = useRef<HTMLDivElement>(null)
  const [terminal, _] = useState<Terminal>(new Terminal())

  useEffect(() => {
    if (!rootRef.current)return;
    terminal.open(rootRef.current)
    prop.addons?.forEach(x => terminal.loadAddon(x))
    if (typeof ref == "function"){
      ref(terminal)
    }else if (ref){
      ref.current = terminal
    }
  }, [])

  return (
    <div {...prop.attrs} ref={rootRef}></div>
  )
})