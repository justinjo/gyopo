const sinoDigits = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구']
const smallUnits = ['', '십', '백', '천']
const bigUnits = ['', '만', '억']

function sinoGroup(n: number): string {
  if (n === 0) return ''
  let out = ''
  for (let pos = 3; pos >= 0; pos--) {
    const power = 10 ** pos
    const digit = Math.floor(n / power) % 10
    if (!digit) continue
    if (digit !== 1 || pos === 0) out += sinoDigits[digit]
    out += smallUnits[pos]
  }
  return out
}

export function toSinoKorean(value: number): string {
  if (!Number.isInteger(value) || value < 0 || value > 999_999_999) throw new RangeError('Sino-Korean range is 0–999,999,999')
  if (value === 0) return '영'
  let out = ''
  for (let group = 2; group >= 0; group--) {
    const divisor = 10 ** (group * 4)
    const part = Math.floor(value / divisor) % 10000
    if (!part) continue
    // 만 commonly drops a leading 일 (10,000 = 만); 억 retains it.
    out += (group === 1 && part === 1 ? '' : sinoGroup(part)) + bigUnits[group]
  }
  return out
}

const nativeOnes = ['', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉']
const nativeTens = ['', '열', '스물', '서른', '마흔', '쉰', '예순', '일흔', '여든', '아흔']
const counterOnes = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉']
export function toNativeKorean(value: number, counterForm = false): string {
  if (!Number.isInteger(value) || value < 0 || value > 99) throw new RangeError('Native Korean range is 0–99')
  // Korean has no native zero; 영 is the general zero used alongside native numbers.
  if (value === 0) return '영'
  const tens = Math.floor(value / 10), ones = value % 10
  let head = nativeTens[tens]!
  if (counterForm && value === 20) head = '스무'
  return head + (counterForm ? counterOnes[ones] : nativeOnes[ones])
}

export function parseIntegerAnswer(value: string): number | null {
  const compact = value.replace(/[,_\s]/g, '')
  if (!/^\d+$/.test(compact)) return null
  return Number(compact)
}
