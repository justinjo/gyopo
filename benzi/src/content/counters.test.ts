import {describe,expect,it} from 'vitest'
import {counters} from './counters'
describe('Mandarin measure word examples',()=>{
 it('supplies exactly one blank and the answer for every example',()=>{for(const entry of counters)for(const example of entry.examples){expect(example.sentence.match(/___/g)).toHaveLength(1);expect(example.answer).toBe(entry.counter);expect(example.translation.length).toBeGreaterThan(0)}})
 it('uses 两 before measure words',()=>{expect(counters.find(c=>c.id==='bottles')!.examples[0].sentence).toContain('两___水')})
})
