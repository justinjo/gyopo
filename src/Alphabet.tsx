import { useEffect, useRef, useState } from 'react'
import { createAlphabetSession, type AlphabetSession } from './content/alphabetSession'
import { alphabetAudio } from './content/alphabetAudio'
import { alphabet, letterGroups } from './content/alphabet'

export function Alphabet({session,onChange}:{session?:AlphabetSession;onChange?:(session:AlphabetSession)=>void}){
  const [localSession,setLocalSession]=useState(()=>createAlphabetSession())
  const current=session??localSession
  const {group,study,index,revealed}=current
  const letters=current.order.map(value=>alphabet.find(letter=>letter.letter===value)!)
  const letter=letters[index]
  function change(patch:Partial<AlphabetSession>){const next={...current,...patch};if(onChange)onChange(next);else setLocalSession(next)}
  function resetDeck(nextGroup:AlphabetSession['group'],nextStudy=study){change(createAlphabetSession(nextGroup,nextStudy))}
  function move(offset:number){change({index:(index+offset+letters.length)%letters.length,revealed:false})}
  return <main className="flashcards-view alphabet-view">
    <header className="flashcards-header"><div><p className="eyebrow">Learn to read Korean</p><h2>Hangul alphabet</h2></div><button className="shuffle-button" onClick={()=>{resetDeck(group,!study)}}>{study?'Reference':'Study cards'}</button></header>
    <p className="alphabet-intro">Hangul letters form syllable blocks. In 한, ㅎ + ㅏ + ㄴ make one syllable. Start with the basic consonants and vowels, then try the combined letters.</p>
    <div className="alphabet-groups" role="group" aria-label="Letter groups">{[{id:'all' as const,label:'All letters'},...letterGroups].map(item=><button key={item.id} aria-pressed={group===item.id} onClick={()=>{resetDeck(item.id)}}>{item.label}</button>)}</div>
    {!study&&<div className="alphabet-grid" aria-label="Letters">{letters.map((item,i)=><button key={item.letter} aria-label={`${item.letter} ${item.name}`} aria-pressed={i===index} onClick={()=>change({index:i,revealed:false})}>{item.letter}</button>)}</div>}
    <section className="flashcard-study" aria-label="Letter details">
      {study&&<button className="shuffle-button alphabet-shuffle" onClick={()=>resetDeck(group)}>Shuffle</button>}
      <div className="card-meta"><span>{group==='all'?`All letters · ${letterGroups.find(item=>item.id===letter.group)!.label}`:letterGroups.find(item=>item.id===group)!.label}</span><span>{index+1} of {letters.length}</span></div>
      <div className="flashcard alphabet-card"><span className="card-side-label">{study?'Recall the sound':'Letter and sound'}</span><strong>{letter.letter}</strong>
        <LetterAudio key={letter.letter} letter={letter.letter}/>
        {(!study||revealed)?<div className="letter-details"><h3>{letter.name}</h3><p>{letter.sound}</p><p><b>{letter.example}</b> · {letter.meaning}</p></div>:<button className="shuffle-button" onClick={()=>change({revealed:true})}>Reveal sound</button>}
      </div>
      <div className="card-navigation"><button onClick={()=>move(-1)} aria-label="Previous letter">← Previous</button><button className="primary" onClick={()=>move(1)}>Next letter →</button></div>
    </section>
    <p className="alphabet-intro">English sound guides are approximate. Consonant sounds change with position; aspirated consonants use a puff of air, while double consonants are tense. Many speakers pronounce ㅐ and ㅔ alike.</p>
    <p className="alphabet-intro audio-credit">Recordings: <a href={alphabetAudio[letter.letter].source} target="_blank" rel="noopener noreferrer">Korean Wiki Project</a> · <a href="https://creativecommons.org/licenses/by-nc-sa/3.0/" target="_blank" rel="noopener noreferrer">CC BY-NC-SA 3.0</a>. Unmodified. Consonants are demonstrated in syllables.</p>
  </main>
}

function LetterAudio({letter}:{letter:string}){
  const recording=alphabetAudio[letter]
  const audioRef=useRef<HTMLAudioElement>(null)
  const [playing,setPlaying]=useState(false),[error,setError]=useState(false)
  useEffect(()=>{const audio=audioRef.current;return()=>{audio?.pause()}},[])
  async function play(){
    const audio=audioRef.current;if(!audio)return
    setError(false)
    if(!audio.paused){audio.pause();return}
    audio.currentTime=0
    try{await audio.play()}catch{setError(true)}
  }
  return <div className="letter-audio">
    <audio ref={audioRef} src={recording.url} preload="none" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)} onError={()=>{setPlaying(false);setError(true)}}/>
    <button className="speaker-button" onClick={play} aria-label={`${playing?'Stop':'Play'} pronunciation for ${letter}: ${recording.spoken}`} aria-pressed={playing}>
      <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg>
      <span>{recording.spoken}</span>
    </button>
    {error&&<small role="status">Couldn’t play audio. Tap to try again.</small>}
  </div>
}
