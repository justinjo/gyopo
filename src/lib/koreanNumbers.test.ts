import { describe,expect,it } from 'vitest'
import { toNativeKorean,toSinoKorean } from './koreanNumbers'
describe('Korean numbers',()=>{
  it('handles zero and omitted leading il',()=>{expect(toSinoKorean(0)).toBe('영');expect(toSinoKorean(10)).toBe('십');expect(toSinoKorean(100)).toBe('백')})
  it('composes man and eok groups',()=>{expect(toSinoKorean(10_001)).toBe('만일');expect(toSinoKorean(100_000_000)).toBe('일억');expect(toSinoKorean(999_999_999)).toBe('구억구천구백구십구만구천구백구십구')})
  it('uses native tens, zero, and counter contractions',()=>{expect(toNativeKorean(0)).toBe('영');expect(toNativeKorean(21)).toBe('스물하나');expect(toNativeKorean(20,true)).toBe('스무');expect(toNativeKorean(24,true)).toBe('스물네')})
  it('rejects out-of-range values',()=>{expect(()=>toNativeKorean(-1)).toThrow();expect(()=>toSinoKorean(1_000_000_000)).toThrow()})
})
