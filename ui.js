(() => {
    document.addEventListener("load", async() => {
        const onOpenFolder = async () => {
            const handle = await showDirectoryPicker({
                mode: "readwrite"
            })
            console.log(handle)
            /** @type {(path: string, h: FileSystemDirectoryHandle | FileSystemFileHandle) => Promise<void>} */
            const recursive = async(path, h) => {
                console.log(path, h)
                if (h.kind == "file"){
                    pyodide.FS.writeFile(
                        path,
                        await h.getFile().then(async x => new Uint8Array(await x.arrayBuffer()))
                    )
                }else{
                    pyodide.FS.mkdir(path)
                    for await (const [k, v] of h.entries()){
                        recursive(path + "/" + v.name, v)
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

        const term = new Terminal();
        const fitAddon = new FitAddon.FitAddon()
        term.loadAddon(fitAddon)
        term.open(document.getElementById("term"))
        fitAddon.fit()
        window.addEventListener("resize", () => fitAddon.fit())

        document.getElementById("open-folder").addEventListener("click", onOpenFolder)

        const pyodide = await PythonRuntime.initPyodide(term)
        term.write("\x1B[2J\x1B[1;1H")
    })
})()