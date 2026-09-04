import type { ReactNode } from "react"

type InlineMatch = {
  index: number
  raw: string
  node: ReactNode
}

const safeHref = (href: string) => {
  if (/^(https?:|mailto:)/i.test(href)) {
    return href
  }

  return "#"
}

function findInlineMatch(text: string, key: string): InlineMatch | undefined {
  const patterns: {
    regex: RegExp
    render: (match: RegExpMatchArray, key: string) => ReactNode
  }[] = [
    {
      regex: /\[([^\]]+)\]\(([^)]+)\)/,
      render: (match, itemKey) => (
        <a
          key={itemKey}
          className="text-[#C7A6FF] underline decoration-[#9B6CFF]/50 underline-offset-4 hover:text-[#F4F0FF]"
          href={safeHref(match[2])}
          rel="noreferrer"
          target="_blank"
        >
          {match[1]}
        </a>
      ),
    },
    {
      regex: /`([^`]+)`/,
      render: (match, itemKey) => (
        <code
          key={itemKey}
          className="rounded bg-[#21172F] px-1.5 py-0.5 font-mono text-sm text-[#C7A6FF]"
        >
          {match[1]}
        </code>
      ),
    },
    {
      regex: /\*\*([^*]+)\*\*/,
      render: (match, itemKey) => <strong key={itemKey}>{match[1]}</strong>,
    },
    {
      regex: /~~([^~]+)~~/,
      render: (match, itemKey) => <s key={itemKey}>{match[1]}</s>,
    },
    {
      regex: /\*([^*]+)\*/,
      render: (match, itemKey) => <em key={itemKey}>{match[1]}</em>,
    },
  ]

  return patterns
    .map(({ regex, render }) => {
      const match = text.match(regex)

      if (!match || match.index === undefined) {
        return undefined
      }

      return {
        index: match.index,
        raw: match[0],
        node: render(match, key),
      }
    })
    .filter((match): match is InlineMatch => Boolean(match))
    .sort((left, right) => left.index - right.index)[0]
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const match = findInlineMatch(text, `${keyPrefix}-0`)

  if (!match) {
    return [text]
  }

  const before = text.slice(0, match.index)
  const after = text.slice(match.index + match.raw.length)

  return [
    before,
    match.node,
    ...renderInline(after, `${keyPrefix}-${match.index + match.raw.length}`),
  ].filter((node) => node !== "")
}

const parseTableRow = (line: string) =>
  line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim())

const isTableSeparator = (line: string) =>
  /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line)

function renderList(lines: string[], ordered: boolean, key: number) {
  const Tag = ordered ? "ol" : "ul"

  return (
    <Tag
      key={key}
      className={
        ordered
          ? "my-3 list-decimal space-y-1 pl-6"
          : "my-3 list-disc space-y-1 pl-6"
      }
    >
      {lines.map((line, index) => {
        const cleaned = ordered
          ? line.replace(/^\s*\d+\.\s+/, "")
          : line.replace(/^\s*[-*]\s+/, "")
        const checklist = cleaned.match(/^\[( |x|X)\]\s+(.*)$/)

        if (checklist) {
          return (
            <li key={`${key}-${index}`} className="list-none">
              <span className="inline-flex items-start gap-2">
                <input
                  checked={checklist[1].toLowerCase() === "x"}
                  className="mt-1 accent-[#9B6CFF]"
                  readOnly
                  type="checkbox"
                />
                <span>{renderInline(checklist[2], `${key}-${index}`)}</span>
              </span>
            </li>
          )
        }

        return <li key={`${key}-${index}`}>{renderInline(cleaned, `${key}-${index}`)}</li>
      })}
    </Tag>
  )
}

export function MarkdownPreview({ content }: { content: string }) {
  const lines = content.split(/\r?\n/)
  const blocks: ReactNode[] = []
  let index = 0
  let inCode = false
  let codeLanguage = ""
  let codeLines: string[] = []

  while (index < lines.length) {
    const line = lines[index]

    if (line.trim().startsWith("```")) {
      if (inCode) {
        blocks.push(
          <pre
            key={blocks.length}
            className="my-4 overflow-x-auto rounded-lg border border-[#2B213A] bg-[#0B0812] p-4 text-sm text-[#F4F0FF]"
            data-language={codeLanguage || undefined}
          >
            <code>{codeLines.join("\n")}</code>
          </pre>,
        )
        codeLines = []
        codeLanguage = ""
        inCode = false
      } else {
        codeLanguage = line.trim().slice(3).trim()
        inCode = true
      }

      index += 1
      continue
    }

    if (inCode) {
      codeLines.push(line)
      index += 1
      continue
    }

    if (line.trim() === "") {
      index += 1
      continue
    }

    if (
      line.includes("|") &&
      lines[index + 1] &&
      isTableSeparator(lines[index + 1])
    ) {
      const headers = parseTableRow(line)
      const rows: string[][] = []
      index += 2

      while (lines[index]?.includes("|") && lines[index].trim() !== "") {
        rows.push(parseTableRow(lines[index]))
        index += 1
      }

      blocks.push(
        <div key={blocks.length} className="my-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr>
                {headers.map((header, headerIndex) => (
                  <th
                    key={headerIndex}
                    className="border border-[#2B213A] bg-[#1C1628] px-3 py-2 font-medium text-[#F4F0FF]"
                  >
                    {renderInline(header, `${blocks.length}-h-${headerIndex}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((_, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="border border-[#2B213A] px-3 py-2 text-[#D8D0E7]"
                    >
                      {renderInline(
                        row[cellIndex] ?? "",
                        `${blocks.length}-${rowIndex}-${cellIndex}`,
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      continue
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = []

      while (/^\s*[-*]\s+/.test(lines[index] ?? "")) {
        items.push(lines[index])
        index += 1
      }

      blocks.push(renderList(items, false, blocks.length))
      continue
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []

      while (/^\s*\d+\.\s+/.test(lines[index] ?? "")) {
        items.push(lines[index])
        index += 1
      }

      blocks.push(renderList(items, true, blocks.length))
      continue
    }

    if (/^\s*>\s?/.test(line)) {
      const quotes: string[] = []

      while (/^\s*>\s?/.test(lines[index] ?? "")) {
        quotes.push(lines[index].replace(/^\s*>\s?/, ""))
        index += 1
      }

      blocks.push(
        <blockquote
          key={blocks.length}
          className="my-4 border-l-2 border-[#9B6CFF] pl-4 text-[#C7BDD8]"
        >
          {quotes.map((quote, quoteIndex) => (
            <p key={quoteIndex}>{renderInline(quote, `${blocks.length}-${quoteIndex}`)}</p>
          ))}
        </blockquote>,
      )
      continue
    }

    const heading = line.match(/^(#{1,3})\s+(.*)$/)

    if (heading) {
      const level = heading[1].length
      const className =
        level === 1
          ? "mb-3 mt-5 text-2xl font-semibold text-[#F4F0FF]"
          : level === 2
            ? "mb-2 mt-5 text-xl font-semibold text-[#F4F0FF]"
            : "mb-2 mt-4 text-lg font-semibold text-[#F4F0FF]"
      const Tag = `h${level}` as "h1" | "h2" | "h3"

      blocks.push(
        <Tag key={blocks.length} className={className}>
          {renderInline(heading[2], `${blocks.length}-heading`)}
        </Tag>,
      )
      index += 1
      continue
    }

    blocks.push(
      <p key={blocks.length} className="my-3 leading-7 text-[#D8D0E7]">
        {renderInline(line, `${blocks.length}-p`)}
      </p>,
    )
    index += 1
  }

  if (inCode) {
    blocks.push(
      <pre
        key={blocks.length}
        className="my-4 overflow-x-auto rounded-lg border border-[#2B213A] bg-[#0B0812] p-4 text-sm text-[#F4F0FF]"
        data-language={codeLanguage || undefined}
      >
        <code>{codeLines.join("\n")}</code>
      </pre>,
    )
  }

  return (
    <div className="min-h-64 rounded-xl border border-[#2B213A] bg-[#0F0B17] px-5 py-4 text-sm">
      {blocks.length > 0 ? (
        blocks
      ) : (
        <p className="text-[#777080]">The preview will appear here.</p>
      )}
    </div>
  )
}
