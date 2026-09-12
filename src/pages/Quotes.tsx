import { useState, type FormEvent } from "react"
import { Pencil, Plus, Trash2, X } from "lucide-react"

import { useCalcite } from "@/state/CalciteStore"

const inputClass = "w-full rounded-xl border border-[#2B213A] bg-[#0F0B17] px-3 py-2.5 text-sm text-[#F4F0FF] outline-none focus:border-[#9B6CFF]"
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl border border-[#2B213A] bg-[#1C1628] px-4 py-2.5 text-sm hover:border-[#9B6CFF]"

function Quotes() {
  const { state, dispatch } = useCalcite()
  const [editing, setEditing] = useState<string | null>(null)
  const [text, setText] = useState("")
  const [author, setAuthor] = useState("")
  const [category, setCategory] = useState("")

  const open = (id?: string) => {
    const quote = id ? state.quotes.find(q => q.id === id) : undefined
    setEditing(id ?? null); setText(quote?.text ?? ""); setAuthor(quote?.author ?? ""); setCategory(quote?.category ?? "")
  }
  const save = (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    const input = { text, author, category }
    if (editing) dispatch({ type: "quote/update", id: editing, input })
    else dispatch({ type: "quote/create", input })
    setEditing(null); setText(""); setAuthor(""); setCategory("")
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-4xl px-5 py-8 md:px-10 md:py-10">
        <p className="text-sm text-[#9A91AA]">Inspiration</p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <div><h1 className="text-4xl font-semibold tracking-tight text-[#F4F0FF]">Quotes</h1><p className="mt-2 text-[#777080]">Save the words worth remembering.</p></div>
          <button className={buttonClass} onClick={() => open()}><Plus size={16} /> Add quote</button>
        </div>

        {editing !== null && (
          <form onSubmit={save} className="mt-6 rounded-2xl border border-[#2B213A] bg-[#14101D] p-5">
            <div className="flex justify-between"><h2 className="font-medium">{editing ? "Edit quote" : "New quote"}</h2><button type="button" onClick={() => setEditing(null)}><X size={18}/></button></div>
            <textarea className={inputClass+" mt-4 min-h-28 resize-y"} placeholder="Write something worth keeping…" value={text} onChange={e=>setText(e.target.value)} />
            <div className="mt-3 grid gap-3 sm:grid-cols-2"><input className={inputClass} placeholder="Author" value={author} onChange={e=>setAuthor(e.target.value)} /><input className={inputClass} placeholder="Category" value={category} onChange={e=>setCategory(e.target.value)} /></div>
            <button className={buttonClass+" mt-4"}>Save quote</button>
          </form>
        )}

        <div className="mt-6 grid gap-4">
          {state.quotes.length ? state.quotes.map(q => (
            <article key={q.id} className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-5">
              <p className="text-lg leading-8 text-[#F4F0FF]">“{q.text}”</p>
              <div className="mt-4 flex items-center justify-between gap-3"><div className="text-sm text-[#9A91AA]">{q.author || "Unknown"}{q.category && <span className="ml-3 rounded-full bg-[#21172F] px-2 py-1 text-xs">{q.category}</span>}</div><div className="flex gap-2"><button className={buttonClass} onClick={()=>open(q.id)}><Pencil size={14}/></button><button className={buttonClass} onClick={()=>dispatch({type:"quote/delete",id:q.id})}><Trash2 size={14}/></button></div></div>
            </article>
          )) : <div className="rounded-2xl border border-dashed border-[#2B213A] p-10 text-center text-sm text-[#777080]">No quotes yet. Add one you want to see on your dashboard.</div>}
        </div>
      </div>
    </main>
  )
}

export default Quotes
