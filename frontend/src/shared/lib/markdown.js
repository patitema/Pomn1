const isMarkdownBlockLine = (line) => {
  const trimmed = line.trim()

  return (
    trimmed === '' ||
    /^#{1,6}\s/.test(trimmed) ||
    /^[-*+]\s/.test(trimmed) ||
    /^\d+\.\s/.test(trimmed) ||
    /^>\s?/.test(trimmed) ||
    /^```/.test(trimmed) ||
    /^---+$/.test(trimmed) ||
    /^\|.*\|$/.test(trimmed)
  )
}

export const normalizeReaderMarkdown = (content = '') => {
  const lines = content
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((line) => line.trim() !== '')

  return lines
    .map((line, index) => {
      const nextLine = lines[index + 1]

      if (!nextLine || isMarkdownBlockLine(line) || isMarkdownBlockLine(nextLine)) {
        return line
      }

      return line + '  '
    })
    .join('\n')
}
