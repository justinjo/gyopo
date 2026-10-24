import { describe,expect,it } from 'vitest'
import { digitalTime,digitalTimeAliases,koreanTime,timeAliases } from './time'
describe('time readings',()=>{
  it('covers midnight, noon, exact hours and 23:59',()=>{expect(timeAliases(0,0,'12')).toContain('자정');expect(timeAliases(12,0,'12')).toContain('정오');expect(koreanTime(9,0,'12')).toBe('오전 아홉 시');expect(koreanTime(23,59,'24')).toBe('이십삼 시 오십구 분');expect(digitalTime(23,59)).toBe('23:59')})
  it('formats and aliases 12-hour digital times',()=>{expect(digitalTime(15,25,'12')).toBe('3:25 PM');expect(digitalTimeAliases(15,25,'12')).toEqual(['3:25 PM','3:25','15:25'])})
})
