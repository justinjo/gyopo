import { cleanup,fireEvent,render,screen,waitFor } from '@testing-library/react'
import { afterEach,beforeEach,describe,expect,it,vi } from 'vitest'
import { Alphabet } from './Alphabet'
import { alphabet } from './content/alphabet'
import { alphabetAudio } from './content/alphabetAudio'
beforeEach(()=>{vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue()})
afterEach(()=>{cleanup();vi.restoreAllMocks()})
describe('alphabet learning',()=>{
  it('includes all 40 distinct modern letters',()=>{
    expect(alphabet).toHaveLength(40)
    expect(new Set(alphabet.map(item=>item.letter)).size).toBe(40)
    expect(alphabet.every(item=>alphabetAudio[item.letter]?.url.endsWith('.mp3'))).toBe(true)
  })
  it('lets learners select letters and switch groups',()=>{
    render(<Alphabet/> )
    fireEvent.click(screen.getByRole('button',{name:'ㅇ 이응'}))
    expect(screen.getByText('silent at the start; ng at the end')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button',{name:'Basic vowels'}))
    expect(screen.getByRole('button',{name:'ㅏ 아'})).toHaveAttribute('aria-pressed','true')
    expect(screen.getByText('1 of 10')).toBeInTheDocument()
  })
  it('hides study answers until revealed and resets them for the next letter',()=>{
    render(<Alphabet/> )
    fireEvent.click(screen.getByRole('button',{name:'Study cards'}))
    expect(screen.queryByText('g / k')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button',{name:'Reveal sound'}))
    expect(screen.getByText('g / k')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button',{name:'Next letter →'}))
    expect(screen.queryByText('n')).not.toBeInTheDocument()
    expect(screen.getByRole('button',{name:'Reveal sound'})).toBeInTheDocument()
  })
})

describe('letter audio',()=>{
  it('plays the selected letter and stops audio when changing letters',()=>{
    const {container}=render(<Alphabet/> )
    fireEvent.click(screen.getByRole('button',{name:'Play pronunciation for ㄱ: 가'}))
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledOnce()
    expect(container.querySelector('audio')).toHaveAttribute('src',alphabetAudio['ㄱ'].url)
    fireEvent.click(screen.getByRole('button',{name:'ㄴ 니은'}))
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled()
    expect(container.querySelector('audio')).toHaveAttribute('src',alphabetAudio['ㄴ'].url)
    expect(screen.getByRole('button',{name:'Play pronunciation for ㄴ: 나'})).toBeInTheDocument()
  })
  it('allows retrying a failed playback',async()=>{
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(new Error('Unavailable'))
    render(<Alphabet/> )
    fireEvent.click(screen.getByRole('button',{name:'Play pronunciation for ㄱ: 가'}))
    await waitFor(()=>expect(screen.getByRole('status')).toHaveTextContent('Couldn’t play audio'))
    fireEvent.click(screen.getByRole('button',{name:'Play pronunciation for ㄱ: 가'}))
    await waitFor(()=>expect(screen.queryByRole('status')).not.toBeInTheDocument())
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2)
  })
})
