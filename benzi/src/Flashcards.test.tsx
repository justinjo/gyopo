import {fireEvent,render,screen,cleanup,waitFor} from '@testing-library/react'
import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest'
vi.mock('virtual:pwa-register/react',()=>({useRegisterSW:vi.fn()}))
import {Flashcards} from './App'
import {flashcardLessons} from './content/flashcards'
import {pronunciations} from './content/pronunciations'
beforeEach(()=>{vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue()})
afterEach(()=>{cleanup();vi.restoreAllMocks()})
describe('vocabulary and pronunciation cards',()=>{
 it('starts with simplified characters and reveals Pinyin, English and audio',()=>{
  render(<Flashcards lessonIds={['house-family']}/> )
  expect(screen.getByRole('button',{name:'公寓. Reveal Pinyin and English'})).toBeInTheDocument()
  expect(screen.queryByText('gōngyù')).not.toBeInTheDocument()
  expect(screen.queryByText('apartment')).not.toBeInTheDocument()
  expect(screen.queryByRole('button',{name:'Play pronunciation for 公寓'})).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:'Reveal'}))
  expect(screen.getByText('gōngyù')).toBeInTheDocument()
  expect(screen.getByText('apartment')).toBeInTheDocument()
  expect(screen.getByRole('button',{name:'Play pronunciation for 公寓'})).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:'Show characters'}))
  expect(screen.queryByText('gōngyù')).not.toBeInTheDocument()
 })
 it('plays audio without flipping and stops it on navigation',async()=>{
  const {container}=render(<Flashcards lessonIds={['house-family']}/> )
  fireEvent.click(screen.getByRole('button',{name:'Reveal'}))
  fireEvent.click(screen.getByRole('button',{name:'Play pronunciation for 公寓'}))
  await waitFor(()=>expect(HTMLMediaElement.prototype.play).toHaveBeenCalledOnce())
  expect(screen.getByText('gōngyù')).toBeInTheDocument()
  expect(container.querySelector('audio')).toHaveAttribute('src',`/${pronunciations['公寓'].file}`)
  fireEvent.click(screen.getByRole('button',{name:'Next →'}))
  expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled()
  expect(screen.getByRole('button',{name:'客厅. Reveal Pinyin and English'})).toBeInTheDocument()
 })
 it('pauses pronunciation when leaving vocabulary and keeps the current card',async()=>{
  const {rerender}=render(<Flashcards lessonIds={['house-family']} active/> )
  fireEvent.click(screen.getByRole('button',{name:'Reveal'}))
  fireEvent.click(screen.getByRole('button',{name:'Play pronunciation for 公寓'}))
  await waitFor(()=>expect(screen.getByRole('button',{name:'Play pronunciation for 公寓'})).toHaveAttribute('aria-pressed','true'))
  rerender(<Flashcards lessonIds={['house-family']} active={false}/> )
  expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled()
  expect(screen.getByText('gōngyù')).toBeInTheDocument()
 })
 it('shows a retry message when playback fails',async()=>{
  vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(new Error('Unavailable'))
  render(<Flashcards lessonIds={['house-family']}/> )
  fireEvent.click(screen.getByRole('button',{name:'Reveal'}))
  fireEvent.click(screen.getByRole('button',{name:'Play pronunciation for 公寓'}))
  await waitFor(()=>expect(screen.getByRole('status')).toHaveTextContent('Couldn’t play audio'))
  fireEvent.click(screen.getByRole('button',{name:'Play pronunciation for 公寓'}))
  await waitFor(()=>expect(screen.queryByRole('status')).not.toBeInTheDocument())
 })
 it('studies selected lessons together',()=>{
  render(<Flashcards lessonIds={['house-family','animals-opinions']}/> )
  expect(screen.getByText('1 of 50')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:'Previous card'}))
  expect(screen.getByText('50 of 50')).toBeInTheDocument()
  expect(screen.getByRole('button',{name:'外向. Reveal Pinyin and English'})).toBeInTheDocument()
 })
 it('provides Pinyin and audio from an open-source model for every vocabulary word',()=>{
  for(const card of flashcardLessons.flatMap(lesson=>lesson.cards)){
   expect(card.pinyin.trim().length).toBeGreaterThan(0)
   const audio=pronunciations[card.chinese]
   expect(audio,card.chinese).toBeDefined()
   expect(audio.source).toBe('https://huggingface.co/hexgrad/Kokoro-82M-v1.1-zh')
   expect(audio.license).toBe('Apache-2.0')
   expect(audio.speaker.length).toBeGreaterThan(0)
  }
 })
})
