import { describe,expect,it } from 'vitest'
import { normalizeAnswer,normalizeTime,uniqueChoices } from './normalize'
describe('answer normalization',()=>{
  it('normalizes unicode, spacing, case, and harmless punctuation',()=>{expect(normalizeAnswer('  RÉD,  ')).toBe('réd');expect(normalizeAnswer('오전  아홉 시!')).toBe('오전아홉시')})
  it('accepts flexible digital time',()=>{expect(normalizeTime('09:5')).toBe('9:05');expect(normalizeTime('9:05')).toBe('9:05')})
  it('makes unique three-choice sets',()=>{const result=uniqueChoices('a',['b','b','c','d']);expect(result).toHaveLength(3);expect(new Set(result).size).toBe(3);expect(result).toContain('a')})
})
