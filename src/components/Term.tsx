import { createEffect, createSignal, JSX, Signal } from "solid-js";
import { isServer } from "solid-js/web";
import { Terminal } from "xterm";
import "xterm/css/xterm.css"

export default function Term(prop: JSX.HTMLAttributes<HTMLDivElement> & {setTerm?: Signal<Terminal>[1]}) {
  let termContainer: HTMLDivElement | undefined;
  const setTerm = prop.setTerm
  delete prop.setTerm
  createEffect(async() => {if (!termContainer)return;
    const {Terminal} = await import("xterm")
    const {FitAddon} = await import("xterm-addon-fit")
    const xterm = new Terminal()
    const fitAddon = new FitAddon()
    xterm.open(termContainer)
    xterm.loadAddon(fitAddon)
    fitAddon.fit()
    window.addEventListener("resize", () => fitAddon.fit())

    setTerm?.(xterm)
  })
  return (
    <div {...prop} ref={termContainer}></div>
  );
}
