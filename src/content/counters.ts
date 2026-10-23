import { toNativeKorean, toSinoKorean } from '../lib/koreanNumbers'

export type CounterLevel = 'A1'|'A2'|'B1'|'B2'
export type CounterNumberSystem = 'native'|'sino'
export interface CounterEntry { id:string; counter:string; level:CounterLevel; gloss:string; numberSystem:CounterNumberSystem; examples:{sentence:string;translation:string;answer:string;aliases?:string[]}[] }
type CounterRow = [string,string,CounterLevel,string,string,string,CounterNumberSystem?]
const rows: CounterRow[] = [
['people','명','A1','people','교실에 학생 ___이 있어요.','There are three students in the classroom.'],['people-honor','분','A1','people (honorific)','손님 ___이 오셨어요.','Two guests have arrived.'],['things','개','A1','things','사과 ___를 샀어요.','I bought four apples.'],['animals','마리','A1','animals','고양이 ___가 자고 있어요.','One cat is sleeping.'],['books','권','A1','bound volumes','책 ___을 읽었어요.','I read three books.'],['bottles','병','A1','bottles','물 ___을 주세요.','Please give me two bottles of water.'],['cups','잔','A1','cups/glasses','커피 ___을 마셨어요.','I drank one cup of coffee.'],['sheets','장','A1','flat sheets','종이 ___이 필요해요.','I need five sheets of paper.'],
['vehicles','대','A2','vehicles/machines','주차장에 차 ___가 있어요.','There are six cars in the parking lot.'],['clothes','벌','A2','sets of clothing','정장 ___을 맞췄어요.','I had two suits made.'],['pairs','켤레','A2','pairs of footwear','신발 ___를 챙겼어요.','I packed three pairs of shoes.'],['houses','채','A2','buildings','언덕에 집 ___가 보여요.','Four houses are visible on the hill.'],['flowers','송이','A2','flowers/bunches','장미 ___를 받았어요.','I received ten roses.'],['trees','그루','A2','trees','마당에 나무 ___를 심었어요.','We planted five trees in the yard.'],['meals','끼','A2','meals','하루에 밥 ___를 먹어요.','I eat three meals a day.'],['times','번','A2','occurrences','그 영화를 ___ 봤어요.','I saw that film twice.'],
['age','살','B1','years of age','제 조카는 ___이에요.','My niece is eight years old.'],['years','년','B1','years','서울에서 ___ 살았어요.','I lived in Seoul for five years.','sino'],['months','개월','B1','months','한국어를 ___ 배웠어요.','I studied Korean for six months.','sino'],['days','일','B1','days/dates','여행은 ___ 동안이에요.','The trip lasts three days.','sino'],['hours','시간','B1','hours','회의가 ___ 걸렸어요.','The meeting took two hours.'],['minutes','분','B1','minutes','역까지 ___ 걸려요.','It takes ten minutes to the station.','sino'],['floors','층','B1','building floors','사무실은 ___에 있어요.','The office is on the seventh floor.','sino'],['chapters','과','B1','lessons/chapters','오늘은 ___를 공부해요.','Today we study lesson four.','sino'],
['pieces','조각','B2','pieces/slices','피자 ___을 먹었어요.','I ate two slices of pizza.'],['drops','방울','B2','drops','눈물이 ___ 떨어졌어요.','Three tears fell.'],['spoonfuls','숟가락','B2','spoonfuls','설탕 ___을 넣으세요.','Add one spoonful of sugar.'],['mouthfuls','모금','B2','sips','물을 ___ 마셨어요.','I took two sips of water.'],['songs','곡','B2','musical pieces','공연에서 노래 ___을 불렀어요.','They sang five songs at the concert.'],['films','편','B2','films/works','주말에 영화 ___을 봤어요.','I watched three films this weekend.'],['letters','통','B2','letters/calls','편지 ___을 받았어요.','I received two letters.']
]
const exampleValues = [1,2,3,4,5]
export const counters: CounterEntry[] = rows.map(([id,counter,level,gloss,sentence,translation,numberSystem = 'native']) => ({
  id,counter,level,gloss,numberSystem,
  examples: exampleValues.map(value => {
    const amount = numberSystem === 'native' ? toNativeKorean(value,true) : toSinoKorean(value)
    return { sentence: sentence.replace('___', `${amount} ___`), translation: translation.replace(/\b(one|two|three|four|five|six|seven|eight|ten)\b/i, String(value)), answer: counter }
  })
}))
