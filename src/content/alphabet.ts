export type LetterGroup = 'consonants' | 'vowels' | 'double' | 'compound' | 'batchim'
export interface HangulLetter { letter:string; name:string; sound:string; example:string; meaning:string; group:LetterGroup; audioKey?:string }
const consonants = [
  ['ㄱ','기역','g / k','가방','bag'],['ㄴ','니은','n','나무','tree'],['ㄷ','디귿','d / t','다리','leg, bridge'],['ㄹ','리을','r / l','라디오','radio'],
  ['ㅁ','미음','m','모자','hat'],['ㅂ','비읍','b / p','바다','sea'],['ㅅ','시옷','s (sh before 이)','사과','apple'],['ㅇ','이응','silent at the start; ng at the end','우유','milk'],
  ['ㅈ','지읒','j','지도','map'],['ㅊ','치읓','ch (aspirated)','차','tea, car'],['ㅋ','키읔','k (aspirated)','코','nose'],['ㅌ','티읕','t (aspirated)','토끼','rabbit'],
  ['ㅍ','피읖','p (aspirated)','포도','grapes'],['ㅎ','히읗','h','하늘','sky'],
]
const vowels = [
  ['ㅏ','아','a, as in father','아이','child'],['ㅑ','야','ya','야구','baseball'],['ㅓ','어','eo, an open “uh” sound','어머니','mother'],['ㅕ','여','yeo','여우','fox'],
  ['ㅗ','오','o','오이','cucumber'],['ㅛ','요','yo','요리','cooking'],['ㅜ','우','u, as in moon','우산','umbrella'],['ㅠ','유','yu','유리','glass'],
  ['ㅡ','으','eu, with unrounded lips','음악','music'],['ㅣ','이','i, as in see','이','tooth'],
]
const double = [
  ['ㄲ','쌍기역','tense k','꼬리','tail'],['ㄸ','쌍디귿','tense t','딸','daughter'],['ㅃ','쌍비읍','tense p','빵','bread'],['ㅆ','쌍시옷','tense s','쌀','rice'],['ㅉ','쌍지읒','tense j','짜다','to be salty'],
]
const compound = [
  ['ㅐ','애','ae','개','dog'],['ㅒ','얘','yae','얘기','story, talk'],['ㅔ','에','e','가게','shop'],['ㅖ','예','ye','예술','art'],
  ['ㅘ','와','wa','과일','fruit'],['ㅙ','왜','wae','왜','why'],['ㅚ','외','oe (often pronounced we)','외국','foreign country'],['ㅝ','워','wo','원','won'],
  ['ㅞ','웨','we','웨이터','waiter'],['ㅟ','위','wi','귀','ear'],['ㅢ','의','ui (varies by position)','의사','doctor'],
]
export const letterGroups:{id:LetterGroup;label:string}[]=[{id:'consonants',label:'Basic consonants'},{id:'vowels',label:'Basic vowels'},{id:'double',label:'Double consonants'},{id:'compound',label:'Compound vowels'},{id:'batchim',label:'받침'}]
export const alphabet:HangulLetter[]=([['consonants',consonants],['vowels',vowels],['double',double],['compound',compound]] as const).flatMap(([group,rows])=>rows.map(([letter,name,sound,example,meaning])=>({letter,name,sound,example,meaning,group})))

export const batchim:HangulLetter[]=[
  {letter:'ㄱ · ㄲ · ㅋ',name:'Final ㄱ sound',sound:'k — stop at the back of the mouth without releasing a puff of air.',example:'목',meaning:'neck',group:'batchim',audioKey:'batchim-k'},
  {letter:'ㄴ',name:'Final ㄴ sound',sound:'n — keep the tongue against the ridge behind the upper teeth.',example:'신문',meaning:'newspaper',group:'batchim',audioKey:'batchim-n'},
  {letter:'ㄷ · ㅅ · ㅆ · ㅈ · ㅊ · ㅌ · ㅎ',name:'Final ㄷ sound',sound:'t — close with the tongue; do not add a vowel or release the stop.',example:'맛',meaning:'taste',group:'batchim',audioKey:'batchim-t'},
  {letter:'ㄹ',name:'Final ㄹ sound',sound:'l — hold the tongue against the ridge behind the upper teeth.',example:'말',meaning:'horse, words',group:'batchim',audioKey:'batchim-l'},
  {letter:'ㅁ',name:'Final ㅁ sound',sound:'m — close the lips and let the sound resonate through the nose.',example:'사람',meaning:'person',group:'batchim',audioKey:'batchim-m'},
  {letter:'ㅂ · ㅍ',name:'Final ㅂ sound',sound:'p — close the lips without releasing a puff of air.',example:'입',meaning:'mouth',group:'batchim',audioKey:'batchim-p'},
  {letter:'ㅇ',name:'Final ㅇ sound',sound:'ng — like the end of “sing”; ㅇ is audible in this position.',example:'강',meaning:'river',group:'batchim',audioKey:'batchim-ng'},
]
export function alphabetDeck(group:LetterGroup|'all'):HangulLetter[]{
  return group==='batchim'?batchim:alphabet.filter(letter=>group==='all'||letter.group===group)
}
