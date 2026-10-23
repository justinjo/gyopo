export interface Flashcard { korean:string; english:string }
export interface FlashcardLesson { id:string; number:number; title:string; koreanTitle:string; cards:Flashcard[] }

export const flashcardLessons:FlashcardLesson[]=[
  {id:'house-family',number:1,title:'House and family',koreanTitle:'집과 가족',cards:[
    {korean:'아파트',english:'apartment'},{korean:'거실',english:'living room'},{korean:'침실',english:'bedroom'},{korean:'주방',english:'kitchen'},{korean:'욕실',english:'bathroom'},
    {korean:'가족',english:'family'},{korean:'부모님',english:'parents'},{korean:'동생',english:'younger sibling'},{korean:'이웃',english:'neighbor'},{korean:'크다',english:'to be big'},
    {korean:'작다',english:'to be small'},{korean:'밝다',english:'to be bright'},{korean:'넓다',english:'to be spacious'},{korean:'좁다',english:'to be narrow'},{korean:'깨끗하다',english:'to be clean'},
    {korean:'깔끔하다',english:'to be neat, tidy'},{korean:'조용하다',english:'to be quiet'},{korean:'편리하다',english:'to be convenient'},{korean:'편안하다',english:'to be comfortable'},{korean:'튼튼하다',english:'to be sturdy'},
    {korean:'친절하다',english:'to be kind'},{korean:'활발하다',english:'to be active, outgoing'},{korean:'내성적이다',english:'to be introverted'},{korean:'착하다',english:'to be good-natured, nice'},{korean:'사이가 좋다',english:'to get along well'}
  ]},
  {id:'animals-opinions',number:2,title:'Animals and opinions',koreanTitle:'동물과 생각',cards:[
    {korean:'동물',english:'animal'},{korean:'애완동물',english:'pet'},{korean:'마리',english:'counter for animals'},{korean:'강아지',english:'puppy, dog'},{korean:'고양이',english:'cat'},
    {korean:'토끼',english:'rabbit'},{korean:'사자',english:'lion'},{korean:'호랑이',english:'tiger'},{korean:'원숭이',english:'monkey'},{korean:'코끼리',english:'elephant'},
    {korean:'기린',english:'giraffe'},{korean:'곰',english:'bear'},{korean:'여우',english:'fox'},{korean:'동물원',english:'zoo'},{korean:'키우다',english:'to raise (a pet)'},
    {korean:'귀엽다',english:'to be cute'},{korean:'무섭다',english:'to be scary'},{korean:'강하다',english:'to be strong'},{korean:'느리다',english:'to be slow'},{korean:'빠르다',english:'to be fast'},
    {korean:'맛있다',english:'to be delicious'},{korean:'맛없다',english:'to be not tasty'},{korean:'괜찮다',english:'to be okay'},{korean:'나쁘다',english:'to be bad'},{korean:'외향적이다',english:'to be extroverted'}
  ]},
  {id:'transport-places',number:3,title:'Transport and places',koreanTitle:'교통과 장소',cards:[
    {korean:'회사',english:'company, office'},{korean:'학교',english:'school'},{korean:'지하철',english:'subway'},{korean:'버스',english:'bus'},{korean:'자전거',english:'bicycle'},
    {korean:'택시',english:'taxi'},{korean:'기차',english:'train'},{korean:'비행기',english:'airplane'},{korean:'차',english:'car'},{korean:'걸어서',english:'on foot'},
    {korean:'걸리다',english:'to take (time)'},{korean:'분',english:'minute'},{korean:'시간',english:'hour, time'},{korean:'얼마나',english:'how long, how much'},{korean:'쯤',english:'about, around'},
    {korean:'출근하다',english:'to go to work'},{korean:'퇴근하다',english:'to leave work'},{korean:'타다',english:'to ride, to take'},{korean:'도서관',english:'library'},{korean:'공원',english:'park'},
    {korean:'공항',english:'airport'},{korean:'백화점',english:'department store'},{korean:'바닷가',english:'beach'},{korean:'시끄럽다',english:'to be noisy'},{korean:'피곤하다',english:'to be tired'}
  ]}
]
