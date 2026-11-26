import type { Register } from 'claude-code'

const ARABIC = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/g
const LATIN = /[A-Za-z]/g
const RLM = '‏' // right-to-left mark: a strong RTL char that sets each line's base direction

// Arabic message = at least 30% of its letters are Arabic script.
const isArabic = (text: string) => {
  const ar = (text.match(ARABIC) ?? []).length
  if (ar === 0) return false
  const la = (text.match(LATIN) ?? []).length
  return ar / (ar + la) >= 0.3
}

// Start each prose line with an RLM (after any list/quote/heading marker), so a
// line that opens with an English word still reads right-to-left. Markdown stays
// intact; code fences, tables and rules are left alone.
const MARKER = /^(\s*(?:>\s*)*(?:#{1,6}\s+|[-*+]\s+(?:\[[ xX]\]\s+)?|\d+[.)]\s+)?)/
const rtl = (text: string) => {
  let inFence = false
  return text
    .split('\n')
    .map(line => {
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence
        return line
      }
      if (inFence || line.trim() === '' || /^\s*\|/.test(line) || /^\s*([-*_]\s*){3,}$/.test(line)) return line
      const m = MARKER.exec(line)!
      const rest = line.slice(m[0].length)
      return rest.startsWith(RLM) ? line : m[0] + RLM + rest
    })
    .join('\n')
}

export const register: Register = on => {
  on('ui.render', { component: 'UserMessage' }, ($, e, next) =>
    isArabic(e.props.text) ? next({ ...e, props: { ...e.props, text: rtl(e.props.text) } }) : next(e)
  )

  on('ui.render', { component: 'AssistantMessage' }, ($, e, next) =>
    isArabic(e.props.text) ? next({ ...e, props: { ...e.props, text: rtl(e.props.text) } }) : next(e)
  )
}
