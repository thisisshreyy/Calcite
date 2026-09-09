import { useMemo, useState, type FormEvent } from "react"
import {
  FileText,
  Folder,
  FolderPlus,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react"

import { useCalcite } from "@/state/CalciteStore"
import type { Note } from "@/types"

const inputClass =
  "w-full rounded-lg border border-[#2B213A] bg-[#0F0B17] px-3 py-2 text-sm text-[#F4F0FF] outline-none transition placeholder:text-[#6F687A] focus:border-[#9B6CFF]"

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-[#2B213A] bg-[#1C1628] px-3 py-2 text-sm text-[#F4F0FF] transition hover:border-[#9B6CFF] hover:bg-[#21172F]"

const dangerButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-[#3A2433] bg-[#21131D] px-3 py-2 text-sm text-[#FFB4D8] transition hover:border-[#FF7AB8] hover:bg-[#2A1724]"

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function renderMarkdown(markdown: string) {
  const lines = markdown.split("\n")
  const output: string[] = []

  let inCodeBlock = false
  let codeLines: string[] = []
  let inList = false
  let listType: "ul" | "ol" | null = null

  const closeList = () => {
    if (inList && listType) {
      output.push(`</${listType}>`)
      inList = false
      listType = null
    }
  }

  const inlineMarkdown = (value: string) => {
    let html = escapeHtml(value)

    html = html.replace(
      /`([^`]+)`/g,
      '<code class="rounded bg-[#21172F] px-1.5 py-0.5 text-[#C7A6FF]">$1</code>',
    )

    html = html.replace(
      /\*\*(.+?)\*\*/g,
      '<strong class="font-semibold text-[#F4F0FF]">$1</strong>',
    )

    html = html.replace(
      /~~(.+?)~~/g,
      '<del class="text-[#777080]">$1</del>',
    )

    html = html.replace(
      /\*(.+?)\*/g,
      '<em class="italic text-[#C7A6FF]">$1</em>',
    )

    html = html.replace(
      /\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noreferrer" class="text-[#C7A6FF] underline underline-offset-2">$1</a>',
    )

    return html
  }

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        output.push(
          `<pre class="my-4 overflow-x-auto rounded-xl border border-[#2B213A] bg-[#0B0812] p-4 text-sm text-[#C7A6FF]"><code>${escapeHtml(
            codeLines.join("\n"),
          )}</code></pre>`,
        )
        codeLines = []
        inCodeBlock = false
      } else {
        closeList()
        inCodeBlock = true
      }

      continue
    }

    if (inCodeBlock) {
      codeLines.push(line)
      continue
    }

    if (!line.trim()) {
      closeList()
      output.push('<div class="h-3"></div>')
      continue
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)

    if (headingMatch) {
      closeList()

      const level = headingMatch[1].length
      const sizes: Record<number, string> = {
        1: "text-3xl",
        2: "text-2xl",
        3: "text-xl",
        4: "text-lg",
        5: "text-base",
        6: "text-sm",
      }

      output.push(
        `<h${level} class="${sizes[level]} mb-3 mt-5 font-semibold text-[#F4F0FF]">${inlineMarkdown(
          headingMatch[2],
        )}</h${level}>`,
      )
      continue
    }

    const unorderedMatch = line.match(/^[-*]\s+(.+)$/)
    const orderedMatch = line.match(/^\d+\.\s+(.+)$/)

    if (unorderedMatch || orderedMatch) {
      const nextType = unorderedMatch ? "ul" : "ol"

      if (!inList || listType !== nextType) {
        closeList()
        listType = nextType
        inList = true
        output.push(
          `<${nextType} class="my-3 space-y-2 pl-6 ${
            nextType === "ul" ? "list-disc" : "list-decimal"
          }">`,
        )
      }

      const content = unorderedMatch?.[1] ?? orderedMatch?.[1] ?? ""

      if (/^\[[ xX]\]\s+/.test(content)) {
        const checked = /^\[[xX]\]/.test(content)
        const taskText = content.replace(/^\[[ xX]\]\s+/, "")

        output.push(
          `<li class="list-none -ml-5 flex items-start gap-2"><span class="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
            checked
              ? "border-[#9B6CFF] bg-[#9B6CFF] text-[#0B0812]"
              : "border-[#4A3C5B]"
          }">${checked ? "?" : ""}</span><span class="${
            checked ? "text-[#777080] line-through" : ""
          }">${inlineMarkdown(taskText)}</span></li>`,
        )
      } else {
        output.push(`<li>${inlineMarkdown(content)}</li>`)
      }

      continue
    }

    if (line.startsWith(">")) {
      closeList()

      output.push(
        `<blockquote class="my-4 border-l-2 border-[#9B6CFF] pl-4 text-[#9A91AA]">${inlineMarkdown(
          line.replace(/^>\s?/, ""),
        )}</blockquote>`,
      )
      continue
    }

    closeList()

    output.push(
      `<p class="my-2 leading-7 text-[#C4BDCE]">${inlineMarkdown(line)}</p>`,
    )
  }

  if (inCodeBlock) {
    output.push(
      `<pre class="my-4 overflow-x-auto rounded-xl border border-[#2B213A] bg-[#0B0812] p-4 text-sm text-[#C7A6FF]"><code>${escapeHtml(
        codeLines.join("\n"),
      )}</code></pre>`,
    )
  }

  closeList()

  return output.join("")
}

function Notes() {
  const { state, dispatch } = useCalcite()

  const [selectedFolderId, setSelectedFolderId] = useState(
    state.noteFolders[0]?.id ?? "",
  )
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    state.notes[0]?.id ?? null,
  )
  const [query, setQuery] = useState("")
  const [newFolderName, setNewFolderName] = useState("")
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null)
  const [folderRenameValue, setFolderRenameValue] = useState("")

  const currentFolder =
    state.noteFolders.find((folder) => folder.id === selectedFolderId) ??
    state.noteFolders[0]

  const folderNotes = useMemo(() => {
    const search = query.trim().toLowerCase()

    return state.notes
      .filter((note) => note.folderId === currentFolder?.id)
      .filter((note) => {
        if (!search) {
          return true
        }

        return (
          note.title.toLowerCase().includes(search) ||
          note.content.toLowerCase().includes(search)
        )
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [currentFolder?.id, query, state.notes])

  const selectedNote =
    state.notes.find((note) => note.id === selectedNoteId) ??
    folderNotes[0] ??
    null

  const createNote = () => {
    if (!currentFolder) {
      return
    }

    const id = `note_${Date.now()}`

    dispatch({
      type: "note/create",
      input: {
        title: "Untitled note",
        content: "# Untitled note\n\nStart writing...",
        folderId: currentFolder.id,
      },
    })

    setQuery("")
    setSelectedNoteId(null)

    window.setTimeout(() => {
      const created = state.notes.find((note) => note.id === id)

      if (created) {
        setSelectedNoteId(created.id)
      }
    }, 0)
  }

  const createFolder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!newFolderName.trim()) {
      return
    }

    dispatch({
      type: "note-folder/create",
      name: newFolderName,
    })

    setNewFolderName("")
  }

  const startRenameFolder = () => {
    if (!currentFolder) {
      return
    }

    setRenamingFolderId(currentFolder.id)
    setFolderRenameValue(currentFolder.name)
  }

  const saveFolderRename = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!renamingFolderId || !folderRenameValue.trim()) {
      return
    }

    dispatch({
      type: "note-folder/rename",
      id: renamingFolderId,
      name: folderRenameValue,
    })

    setRenamingFolderId(null)
  }

  const deleteFolder = () => {
    if (!currentFolder || state.noteFolders.length <= 1) {
      return
    }

    const fallback = state.noteFolders.find(
      (folder) => folder.id !== currentFolder.id,
    )

    dispatch({
      type: "note-folder/delete",
      id: currentFolder.id,
    })

    if (fallback) {
      setSelectedFolderId(fallback.id)
      setSelectedNoteId(null)
    }
  }

  return (
    <main className="flex-1 overflow-hidden">
      <div className="mx-auto flex h-[calc(100vh-5rem)] max-w-[1500px] flex-col px-4 py-5 md:h-screen md:px-6 md:py-6">
        <header className="mb-5 shrink-0">
          <p className="text-sm text-[#9A91AA]">Knowledge</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#F4F0FF]">
            Notes
          </h1>
          <p className="mt-1 text-sm text-[#777080]">
            Write, organize, and keep your thoughts in Markdown.
          </p>
        </header>

        <section className="flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-[#2B213A] bg-[#14101D]">
          <aside className="hidden w-56 shrink-0 flex-col border-r border-[#2B213A] bg-[#0F0B17] md:flex">
            <div className="border-b border-[#2B213A] p-3">
              <form className="flex gap-2" onSubmit={createFolder}>
                <input
                  className={inputClass}
                  onChange={(event) => setNewFolderName(event.target.value)}
                  placeholder="New folder"
                  value={newFolderName}
                />
                <button
                  aria-label="Create folder"
                  className={buttonClass}
                  type="submit"
                >
                  <FolderPlus size={15} />
                </button>
              </form>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              <p className="px-2 pb-2 pt-1 text-xs font-medium uppercase tracking-wider text-[#777080]">
                Folders
              </p>

              {state.noteFolders.map((folder) => (
                <button
                  className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                    currentFolder?.id === folder.id
                      ? "bg-[#21172F] text-[#F4F0FF]"
                      : "text-[#9A91AA] hover:bg-[#18121F] hover:text-[#F4F0FF]"
                  }`}
                  key={folder.id}
                  onClick={() => {
                    setSelectedFolderId(folder.id)
                    setSelectedNoteId(null)
                    setQuery("")
                  }}
                  type="button"
                >
                  <Folder size={15} />
                  <span className="truncate">{folder.name}</span>
                </button>
              ))}
            </div>

            {currentFolder && (
              <div className="border-t border-[#2B213A] p-3">
                <button
                  className="mb-2 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-[#9A91AA] hover:bg-[#18121F] hover:text-[#F4F0FF]"
                  onClick={startRenameFolder}
                  type="button"
                >
                  <Pencil size={14} />
                  Rename folder
                </button>

                <button
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-[#FFB4D8] hover:bg-[#21131D]"
                  disabled={state.noteFolders.length <= 1}
                  onClick={deleteFolder}
                  type="button"
                >
                  <Trash2 size={14} />
                  Delete folder
                </button>
              </div>
            )}
          </aside>

          <section className="flex w-full min-w-0 flex-col border-r border-[#2B213A] md:w-72">
            <div className="border-b border-[#2B213A] p-3">
              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6F687A]"
                    size={15}
                  />
                  <input
                    className={`${inputClass} pl-9`}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search notes"
                    value={query}
                  />
                </div>

                <button
                  aria-label="New note"
                  className={buttonClass}
                  onClick={createNote}
                  type="button"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#F4F0FF]">
                    {currentFolder?.name ?? "Notes"}
                  </p>
                  <p className="text-xs text-[#777080]">
                    {folderNotes.length}{" "}
                    {folderNotes.length === 1 ? "note" : "notes"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {folderNotes.length > 0 ? (
                folderNotes.map((note) => (
                  <button
                    className={`w-full border-b border-[#211A2B] px-4 py-3 text-left transition ${
                      selectedNote?.id === note.id
                        ? "bg-[#21172F]"
                        : "hover:bg-[#18121F]"
                    }`}
                    key={note.id}
                    onClick={() => setSelectedNoteId(note.id)}
                    type="button"
                  >
                    <div className="flex items-start gap-3">
                      <FileText
                        className="mt-0.5 shrink-0 text-[#9B6CFF]"
                        size={16}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#F4F0FF]">
                          {note.title || "Untitled note"}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#777080]">
                          {note.content.replace(/[#*_`>\-\[\]]/g, "").slice(0, 100)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-6 text-center">
                  <FileText
                    className="mx-auto text-[#4A3C5B]"
                    size={28}
                  />
                  <p className="mt-3 text-sm text-[#777080]">
                    No notes here yet.
                  </p>
                  <button
                    className={`${buttonClass} mt-4`}
                    onClick={createNote}
                    type="button"
                  >
                    <Plus size={14} />
                    Create note
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="flex min-w-0 flex-1 flex-col">
            {selectedNote ? (
              <NoteEditor
                key={selectedNote.id}
                note={selectedNote}
                onDelete={() => {
                  dispatch({
                    type: "note/delete",
                    id: selectedNote.id,
                  })
                  setSelectedNoteId(null)
                }}
                onClose={() => setSelectedNoteId(null)}
                dispatch={dispatch}
              />
            ) : (
              <div className="flex flex-1 items-center justify-center p-8 text-center">
                <div>
                  <FileText
                    className="mx-auto text-[#4A3C5B]"
                    size={42}
                  />
                  <h2 className="mt-4 text-lg font-medium text-[#F4F0FF]">
                    Select a note
                  </h2>
                  <p className="mt-2 text-sm text-[#777080]">
                    Choose a note from the list or create a new one.
                  </p>
                </div>
              </div>
            )}
          </section>
        </section>

        {renamingFolderId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5">
            <form
              className="w-full max-w-md rounded-2xl border border-[#2B213A] bg-[#14101D] p-5 shadow-2xl"
              onSubmit={saveFolderRename}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-[#F4F0FF]">
                  Rename folder
                </h2>
                <button
                  className="text-[#777080] hover:text-[#F4F0FF]"
                  onClick={() => setRenamingFolderId(null)}
                  type="button"
                >
                  <X size={18} />
                </button>
              </div>

              <input
                autoFocus
                className={`${inputClass} mt-5`}
                onChange={(event) => setFolderRenameValue(event.target.value)}
                value={folderRenameValue}
              />

              <button className={`${buttonClass} mt-4 w-full`} type="submit">
                Save folder
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  )
}

type NoteEditorProps = {
  note: Note
  onDelete: () => void
  onClose: () => void
  dispatch: ReturnType<typeof useCalcite>["dispatch"]
}

function NoteEditor({
  note,
  onDelete,
  onClose,
  dispatch,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)

  const save = (nextTitle: string, nextContent: string) => {
    dispatch({
      type: "note/update",
      id: note.id,
      input: {
        title: nextTitle,
        content: nextContent,
        folderId: note.folderId,
      },
    })
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    save(value, content)
  }

  const handleContentChange = (value: string) => {
    setContent(value)
    save(title, value)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#2B213A] px-4 py-3 md:px-6">
        <input
          className="min-w-0 flex-1 bg-transparent text-lg font-semibold text-[#F4F0FF] outline-none placeholder:text-[#6F687A]"
          onChange={(event) => handleTitleChange(event.target.value)}
          placeholder="Untitled note"
          value={title}
        />

        <div className="flex shrink-0 gap-2">
          <button
            aria-label="Close note"
            className={`${buttonClass} md:hidden`}
            onClick={onClose}
            type="button"
          >
            <X size={15} />
          </button>

          <button
            className={dangerButtonClass}
            onClick={onDelete}
            type="button"
          >
            <Trash2 size={15} />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 md:grid-cols-2">
        <div className="min-h-0 border-b border-[#2B213A] md:border-b-0 md:border-r">
          <div className="border-b border-[#211A2B] px-4 py-2 text-xs uppercase tracking-wider text-[#6F687A]">
            Markdown
          </div>

          <textarea
            className="h-full w-full resize-none bg-[#0F0B17] p-5 font-mono text-sm leading-7 text-[#DCD5E7] outline-none placeholder:text-[#5E566A]"
            onChange={(event) => handleContentChange(event.target.value)}
            placeholder="Start writing Markdown..."
            spellCheck={false}
            value={content}
          />
        </div>

        <div className="min-h-0 overflow-y-auto">
          <div className="border-b border-[#211A2B] px-4 py-2 text-xs uppercase tracking-wider text-[#6F687A]">
            Preview
          </div>

          <article
            className="p-5 text-sm"
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(content),
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default Notes
