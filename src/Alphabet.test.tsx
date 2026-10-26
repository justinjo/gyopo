import { cleanup,fireEvent,render,screen,waitFor } from '@testing-library/react'
import { afterEach,beforeEach,describe,expect,it,vi } from 'vitest'
import { Alphabet } from './Alphabet'
import { alphabet, batchim } from './content/alphabet'
import { alphabetAudio } from './content/alphabetAudio'
beforeEach(()=>{vi.spyOn(Math,'random').mockReturnValue(1-Number.EPSILON);vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue()})
afterEach(()=>{cleanup();vi.restoreAllMocks()})
describe('alphabet learning',()=>{
  it('includes all 40 distinct modern letters',()=>{
    expect(alphabet).toHaveLength(40)
    expect(new Set(alphabet.map(item=>item.letter)).size).toBe(40)
    expect(alphabet.every(item=>alphabetAudio[item.letter]?.url.endsWith('.mp3'))).toBe(true)
  })
  it('lets learners select letters and switch groups',()=>{
    render(<Alphabet/> )
    fireEvent.click(screen.getByRole('button',{name:'Reference'}))
    fireEvent.click(screen.getByRole('button',{name:'ㅇ 이응'}))
    expect(screen.getByText('silent at the start; ng at the end')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button',{name:'Basic vowels'}))
    expect(screen.getByRole('button',{name:'ㅏ 아'})).toHaveAttribute('aria-pressed','true')
    expect(screen.getByText('1 of 10')).toBeInTheDocument()
  })
  it('hides study answers until revealed and resets them for the next letter',()=>{
    render(<Alphabet/> )
    expect(screen.getByRole('button',{name:'Reference'})).toBeInTheDocument()
    expect(screen.queryByRole('button',{name:'ㄱ 기역'})).not.toBeInTheDocument()
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
    fireEvent.click(screen.getByRole('button',{name:'Next letter →'}))
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

describe('shuffled study decks',()=>{
  it('shuffles study cards but keeps reference letters in alphabet order',()=>{
    vi.mocked(Math.random).mockReturnValue(0)
    const {container}=render(<Alphabet/> )
    expect(container.querySelector('.alphabet-card strong')).not.toHaveTextContent('ㄱ')
    fireEvent.click(screen.getByRole('button',{name:'Reference'}))
    expect(container.querySelector('.alphabet-card strong')).toHaveTextContent('ㄱ')
  })
  it('cycles through all 40 letters without repeats in the combined deck',()=>{
    vi.mocked(Math.random).mockReturnValue(.35)
    const {container}=render(<Alphabet/> )
    fireEvent.click(screen.getByRole('button',{name:'All letters'}))
    expect(screen.getByText('1 of 40')).toBeInTheDocument()
    const seen=new Set<string>()
    for(let i=0;i<40;i++){
      seen.add(container.querySelector('.alphabet-card strong')!.textContent!)
      fireEvent.click(screen.getByRole('button',{name:'Next letter →'}))
    }
    expect(seen).toEqual(new Set(alphabet.map(letter=>letter.letter)))
    expect(screen.getByText('1 of 40')).toBeInTheDocument()
  })
  it('reshuffles from the beginning and hides the revealed answer',()=>{
    render(<Alphabet/> )
    fireEvent.click(screen.getByRole('button',{name:'Next letter →'}))
    fireEvent.click(screen.getByRole('button',{name:'Reveal sound'}))
    fireEvent.click(screen.getByRole('button',{name:'Shuffle'}))
    expect(screen.getByText('1 of 40')).toBeInTheDocument()
    expect(screen.getByRole('button',{name:'Reveal sound'})).toBeInTheDocument()
  })
})

describe('restoring Hangul study',()=>{
  it('defaults to all letters and resumes the same deck, card, and revealed answer',()=>{
    const save=vi.fn()
    const first=render(<Alphabet onChange={save}/> )
    expect(screen.getByRole('button',{name:'All letters'})).toHaveAttribute('aria-pressed','true')
    expect(screen.getByText('1 of 40')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button',{name:'Reveal sound'}))
    const saved=save.mock.lastCall![0]
    const visibleLetter=first.container.querySelector('.alphabet-card strong')!.textContent
    first.unmount()
    vi.mocked(Math.random).mockReturnValue(0)
    const restored=render(<Alphabet session={saved}/> )
    expect(restored.container.querySelector('.alphabet-card strong')!.textContent).toBe(visibleLetter)
    expect(screen.queryByRole('button',{name:'Reveal sound'})).not.toBeInTheDocument()
    expect(screen.getByText('1 of 40')).toBeInTheDocument()
  })
})

describe('reference sections',()=>{
  it('offers All letters in both study and reference modes',()=>{
    render(<Alphabet/> )
    expect(screen.getByRole('button',{name:'All letters'})).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button',{name:'Reference'}))
    expect(screen.getByRole('button',{name:'All letters'})).toBeInTheDocument()
    expect(screen.getByRole('button',{name:'All letters'})).toHaveAttribute('aria-pressed','true')
    expect(screen.getByText('1 of 40')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button',{name:'Study cards'}))
    expect(screen.getByRole('button',{name:'All letters'})).toBeInTheDocument()
  })
})

describe('받침 learning',()=>{
  it('covers seven final sounds with word recordings',()=>{
    expect(batchim).toHaveLength(7)
    expect(batchim.every(item=>alphabetAudio[item.audioKey!]?.spoken===item.example)).toBe(true)
  })
  it('studies final consonants and reveals their sounds',()=>{
    render(<Alphabet/> )
    fireEvent.click(screen.getByRole('button',{name:'받침'}))
    expect(screen.getByText('1 of 7')).toBeInTheDocument()
    expect(screen.getByRole('button',{name:'Play pronunciation for ㄱ · ㄲ · ㅋ: 목'})).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button',{name:'Reveal sound'}))
    expect(screen.getByText('Final ㄱ sound')).toBeInTheDocument()
    expect(screen.getByText(/· neck/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button',{name:'Reference'}))
    expect(screen.getByRole('button',{name:'ㅇ Final ㅇ sound'})).toBeInTheDocument()
  })
})
