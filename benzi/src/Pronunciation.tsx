import {useEffect,useRef,useState} from 'react'
import {pronunciations} from './content/pronunciations'
export function Pronunciation({word,active=true}:{word:string;active?:boolean}){
 const recording=pronunciations[word]
 const audioRef=useRef<HTMLAudioElement>(null)
 const activeRef=useRef(active);activeRef.current=active
 const [playing,setPlaying]=useState(false),[error,setError]=useState(false)
 useEffect(()=>{const audio=audioRef.current;return()=>{audio?.pause()}},[word])
 useEffect(()=>{if(!active){audioRef.current?.pause();setPlaying(false)}},[active])
 async function play(){
  const audio=audioRef.current;if(!audio)return
  setError(false)
  if(playing){audio.pause();audio.currentTime=0;setPlaying(false);return}
  try{await audio.play();if(audioRef.current!==audio||!activeRef.current){audio.pause();return}setPlaying(true)}catch{setPlaying(false);setError(true)}
 }
 if(!recording)return <p className="pronunciation-error">Pronunciation recording unavailable.</p>
 return <div className="pronunciation">
  <audio ref={audioRef} src={`${import.meta.env.BASE_URL}${recording.file}`} preload="none" onEnded={()=>setPlaying(false)} onError={()=>{setPlaying(false);setError(true)}}/>
  <button className="speaker-button" aria-label={`Play pronunciation for ${word}`} aria-pressed={playing} onClick={play}>
   <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m11 5-5 4H3v6h3l5 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg>
   {playing?'Stop':'Play pronunciation'}
  </button>
  {error&&<span className="pronunciation-error" role="status">Couldn’t play audio. Tap to try again.</span>}
  <small className="pronunciation-credit"><a href={recording.source} target="_blank" rel="noopener noreferrer">{recording.speaker}</a><br/><a href={recording.licenseUrl} target="_blank" rel="noopener noreferrer">{recording.license}</a> · Synthesized pronunciation</small>
 </div>
}
