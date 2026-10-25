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
import { MarkdownPreview } from "@/lib/markdown"
import type { Note } from "@/types"

const inputClass =
  "w-full rounded-lg border border-[#2B213A] bg-[#0F0B17] px-3 py-2 text-sm text-[#F4F0FF] outline-none transition placeholder:text-[#6F687A] focus:border-[#9B6CFF]"

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-[#2B213A] bg-[#1C1628] px-3 py-2 text-sm text-[#F4F0FF] transition hover:border-[#9B6CFF] hover:bg-[#21172F]"

const dangerButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-[#3A2433] bg-[#21131D] px-3 py-2 text-sm text-[#FFB4D8] transition hover:border-[#FF7AB8] hover:bg-[#2A1724]"

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
                          {note.content.replace(/[#*_`>\-[\]]/g, "").slice(0, 100)}
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

          <div className="p-4">
            <MarkdownPreview content={content} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notes
