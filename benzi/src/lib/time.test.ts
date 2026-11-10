import { describe,expect,it } from 'vitest'
import { digitalTime,digitalTimeAliases,chineseTime,timeAliases } from './time'
describe('time readings',()=>{
  it('covers midnight, noon, exact hours and 23:59',()=>{expect(timeAliases(0,0,'12')).toContain('午夜');expect(timeAliases(12,0,'12')).toContain('中午十二点');expect(chineseTime(9,0,'12')).toBe('上午九点整');expect(chineseTime(23,59,'24')).toBe('二十三点五十九分');expect(digitalTime(23,59)).toBe('23:59')})
  it('formats and aliases 12-hour digital times',()=>{expect(digitalTime(15,25,'12')).toBe('3:25 PM');expect(digitalTimeAliases(15,25,'12')).toEqual(['3:25 PM','3:25','15:25'])})
})
