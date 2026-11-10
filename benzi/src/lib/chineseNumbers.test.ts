import {describe,expect,it} from 'vitest'
import {toChinese,toFinancialChinese} from './chineseNumbers'
describe('simplified Mandarin numerals',()=>{
 it.each([[0,'零'],[10,'十'],[11,'十一'],[20,'二十'],[101,'一百零一'],[1001,'一千零一'],[10000,'一万'],[10001,'一万零一'],[10010,'一万零一十'],[100000001,'一亿零一'],[100010001,'一亿零一万零一'],[999999999,'九亿九千九百九十九万九千九百九十九']])('reads %s',(value,expected)=>expect(toChinese(Number(value))).toBe(expected))
 it('uses simplified financial forms',()=>{expect(toFinancialChinese(12)).toBe('壹拾贰');expect(toFinancialChinese(3600)).toBe('叁仟陆佰')})
 it('rejects unsupported values',()=>{expect(()=>toChinese(-1)).toThrow();expect(()=>toChinese(1e9)).toThrow();expect(()=>toChinese(1.5)).toThrow()})
})
