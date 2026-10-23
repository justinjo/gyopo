import { toNativeKorean, toSinoKorean } from './koreanNumbers'
export function digitalTime(hour: number, minute: number): string { return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}` }
export function koreanTime(hour: number, minute: number, format: '12' | '24'): string {
  if (format === '24') return `${toSinoKorean(hour)} 시${minute ? ` ${toSinoKorean(minute)} 분` : ''}`
  const period = hour < 12 ? '오전' : '오후'
  const h = hour % 12 || 12
  return `${period} ${toNativeKorean(h, true)} 시${minute ? ` ${toSinoKorean(minute)} 분` : ''}`
}
export function timeAliases(hour: number, minute: number, format: '12' | '24'): string[] {
  const primary = koreanTime(hour, minute, format)
  const aliases = [primary, primary.replace(/\s/g, '')]
  if (minute === 0) aliases.push(`${primary} 정각`)
  if (format === '12' && hour === 0 && minute === 0) aliases.push('자정')
  if (format === '12' && hour === 12 && minute === 0) aliases.push('정오')
  return aliases
}
