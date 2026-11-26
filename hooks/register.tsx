import type { Register } from 'claude-code'

const ARABIC = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/g
const LATIN = /[A-Za-z]/g

// RTL only when the text is mostly Arabic-script (>= 30% of its letters)
// and has no code fence (those keep the engine's markdown/code drawing).
const isArabic = (text: string) => {
  if (text.includes('```')) return false
  const ar = (text.match(ARABIC) ?? []).length
  if (ar === 0) return false
  const la = (text.match(LATIN) ?? []).length
  return ar / (ar + la) >= 0.3
}

export const register: Register = on => {
  on('ui.render', { component: 'UserMessage' }, ($, e, next) => {
    if (!isArabic(e.props.text)) return next(e)
    const { Text } = $.ui.resolve(e)
    return <Text dir="rtl">{e.props.text}</Text>
  })

  on('ui.render', { component: 'AssistantMessage' }, ($, e, next) => {
    if (!isArabic(e.props.text)) return next(e)
    const { Text } = $.ui.resolve(e)
    return <Text dir="rtl">{e.props.text}</Text>
  })
}
