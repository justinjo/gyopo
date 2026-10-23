import { describe,expect,it } from 'vitest'
import { adapters,validateCustomRange } from '.'
import { initialState } from '../config'
describe('drill adapters',()=>{
  it('validates number ranges',()=>{expect(validateCustomRange(5,2,'sino')).toMatch(/Minimum/);expect(validateCustomRange(0,99,'native')).toMatch(/Native/);expect(validateCustomRange(1,99,'native')).toBeNull()})
  it('accepts aliases and creates unique choices',()=>{const context={settings:initialState.settings,recentIds:[],counterBag:[]};for(const adapter of Object.values(adapters)){const q=adapter.createQuestion(context);expect(q.choices).toHaveLength(3);expect(new Set(q.choices).size).toBe(3);expect(adapter.checkAnswer(q,q.canonical).correct).toBe(true)}})
  it('exhausts the counter bag before repeating',()=>{const context={settings:{...initialState.settings,counterLevel:'beginner' as const},recentIds:[],counterBag:[]};const ids=new Set<string>();for(let i=0;i<16;i++)ids.add(adapters.counters.createQuestion(context).progressKey);expect(ids.size).toBe(16);expect(context.counterBag).toHaveLength(0)})
})
