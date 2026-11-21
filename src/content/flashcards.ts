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
  ]},
  {id:'requests-obligations',number:4,title:'Requests and obligations',koreanTitle:'요청과 의무',cards:[
    {korean:'앉다',english:'to sit'},{korean:'기다리다',english:'to wait'},{korean:'일어나다',english:'to wake up, to get up'},{korean:'자다',english:'to sleep'},{korean:'씻다',english:'to wash'},
    {korean:'청소하다',english:'to clean'},{korean:'요리하다',english:'to cook'},{korean:'쉬다',english:'to rest'},{korean:'운동하다',english:'to exercise'},{korean:'듣다',english:'to listen'},
    {korean:'읽다',english:'to read'},{korean:'쓰다',english:'to write'},{korean:'말하다',english:'to speak'},{korean:'내리다',english:'to get off'},{korean:'찍다',english:'to take (a photo)'},
    {korean:'팔다',english:'to sell'},{korean:'만들다',english:'to make'},{korean:'외우다',english:'to memorize'},{korean:'숙제',english:'homework'},{korean:'시험',english:'exam, test'},
    {korean:'질문하다',english:'to ask a question'},{korean:'녹음하다',english:'to record'},{korean:'벗다',english:'to take off'},{korean:'약',english:'medicine'},{korean:'감기에 걸리다',english:'to catch a cold'}
  ]},
  {id:'casual-speech',number:5,title:'Casual speech',koreanTitle:'반말',cards:[
    {korean:'반말',english:'casual speech'},{korean:'살다',english:'to live'},{korean:'아늑하다',english:'to be cozy'},{korean:'근처',english:'nearby'},{korean:'산책하다',english:'to take a walk'},
    {korean:'체육관',english:'gym'},{korean:'분위기',english:'atmosphere, vibe'},{korean:'얌전하다',english:'to be calm, well-behaved'},{korean:'단어',english:'word, vocabulary'},{korean:'혼자',english:'alone'},
    {korean:'같이',english:'together'},{korean:'매일',english:'every day'},{korean:'아침',english:'morning'},{korean:'저녁',english:'evening, dinner'},{korean:'주말',english:'weekend'},
    {korean:'바쁘다',english:'to be busy'},{korean:'재미있다',english:'to be fun'},{korean:'보통',english:'usually'},{korean:'진짜',english:'really'},{korean:'친하다',english:'to be close (friends)'},
    {korean:'마시다',english:'to drink'},{korean:'좋아하다',english:'to like'},{korean:'오늘',english:'today'},{korean:'내일',english:'tomorrow'},{korean:'뭐',english:'what'}
  ]},
  {id:'formal-speech-news',number:6,title:'Formal speech and news',koreanTitle:'존댓말과 뉴스',cards:[
    {korean:'존댓말',english:'polite/honorific speech'},{korean:'뉴스',english:'news'},{korean:'앵커',english:'news anchor'},{korean:'인터뷰',english:'interview'},{korean:'겨울',english:'winter'},
    {korean:'춥다',english:'to be cold'},{korean:'입다',english:'to wear (clothes)'},{korean:'모자를 쓰다',english:'to wear a hat'},{korean:'유명하다',english:'to be famous'},{korean:'가르치다',english:'to teach'},
    {korean:'열심히',english:'hard, diligently'},{korean:'매주',english:'every week'},{korean:'직업',english:'job, occupation'},{korean:'만족하다',english:'to be satisfied'},{korean:'행복하다',english:'to be happy'},
    {korean:'기분',english:'mood, feeling'},{korean:'감사하다',english:'to thank'},{korean:'죄송하다',english:'to be sorry'},{korean:'맞다',english:'to be correct'},{korean:'아니다',english:'to not be'},
    {korean:'잘 먹겠습니다',english:'(said before a meal)'},{korean:'잘 먹었습니다',english:'(said after a meal)'},{korean:'일기',english:'diary'},{korean:'편지',english:'letter'},{korean:'시장',english:'market'}
  ]},
  {id:'location-connectors-appearance',number:7,title:'Location, connectors, and appearance',koreanTitle:'위치, 접속사, 외모',cards:[
    {korean:'앞',english:'front'},{korean:'뒤',english:'behind'},{korean:'옆',english:'next to'},{korean:'오른쪽',english:'right side'},{korean:'왼쪽',english:'left side'},
    {korean:'사이',english:'between'},{korean:'위',english:'on, above'},{korean:'아래',english:'under, below'},{korean:'하고',english:'and, with'},{korean:'랑/이랑',english:'and, with (casual)'},
    {korean:'와/과',english:'and, with (written)'},{korean:'그리고',english:'and (between sentences)'},{korean:'그런데 (근데)',english:'but, by the way'},{korean:'하지만',english:'but, however'},{korean:'그러면 (그럼)',english:'then, in that case'},
    {korean:'그때',english:'at that time, then'},{korean:'키',english:'height'},{korean:'얼굴',english:'face'},{korean:'눈',english:'eye'},{korean:'뚱뚱하다',english:'to be fat, chubby'},
    {korean:'날씬하다',english:'to be slim'},{korean:'몸이 좋다',english:'to be fit, muscular'},{korean:'머리',english:'hair, head'},{korean:'길다',english:'to be long'},{korean:'짧다',english:'to be short (length)'}
  ]}
]
