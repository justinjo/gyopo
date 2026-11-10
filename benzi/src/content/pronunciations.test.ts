// @vitest-environment node
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {describe,expect,it} from 'vitest'
import {flashcardLessons} from './flashcards'
import {pronunciations} from './pronunciations'
const provenance=JSON.parse(readFileSync(new URL('../../public/audio/sources.json',import.meta.url),'utf8'))
describe('bundled audio integrity',()=>{
 it('ships a valid, nonempty AAC file for every vocabulary card',()=>{
  const cards=flashcardLessons.flatMap(lesson=>lesson.cards)
  expect(Object.keys(pronunciations)).toHaveLength(cards.length)
  for(const card of cards){
   const recording=pronunciations[card.chinese]
   const audio=readFileSync(new URL(`../../public/${recording.file}`,import.meta.url))
   expect(audio.subarray(4,8).toString(),card.chinese).toBe('ftyp')
   expect(audio.length).toBeGreaterThan(1000)
   expect(createHash('sha256').update(audio).digest('hex')).toBe(provenance[card.chinese].sha256)
   expect(provenance[card.chinese].duration).toBeGreaterThan(.2)
   expect(provenance[card.chinese].duration).toBeLessThan(10)
  }
 })
 it('uses the first-tone reading for the animal classifier 只',()=>{
  expect(provenance['只'].phonemes).toBe('ㄓ十1.')
 })
})
