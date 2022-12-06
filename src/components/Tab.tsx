import { ComponentType } from "preact"
import { ChangeEventHandler } from "preact/compat"
import { StateUpdater, useState } from "preact/hooks"
import { JSX } from "preact/jsx-runtime"
import { JSXInternal } from "preact/src/jsx"
import "./Tab.css"

export type TabPage = {
  name: string,
  component: ComponentType
}

export default function Tab(prop: {pages: TabPage[], attrs?: JSXInternal.HTMLAttributes<HTMLDivElement>}){
  const [currentPage, SetCurrentPage] = useState<TabPage>(prop.pages[0])
  const radioStates: [boolean | undefined, StateUpdater<boolean | undefined>][] = prop.pages.map(() => useState<boolean>())

  const onSelect = (set: StateUpdater<boolean | undefined>, i: number): ChangeEventHandler<HTMLInputElement> => (e) => (set(true), SetCurrentPage(prop.pages[i]))
  return (
    <div {...prop.attrs} class="Tab-wrapper-parent">
      <div class="Tab-wrapper">
        {prop.pages.map((x, i) => (
          <label class="Tab" >
            <input onChange={onSelect(radioStates[i][1], i)} checked={prop.pages[i].name == currentPage.name} type="radio" value={i} style={{display: "none"}} />
            <span>{x.name}</span>
          </label>
        ))}
      </div>
      <div style={{height: "100%", overflow: "hidden"}}>
        {currentPage?.component && <currentPage.component/>}
      </div>
    </div>
  )
}