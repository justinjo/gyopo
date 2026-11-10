export type CounterLevel='A1'|'A2'|'B1'|'B2'
export interface CounterEntry {id:string;counter:string;level:CounterLevel;gloss:string;examples:{sentence:string;translation:string;answer:string;aliases?:string[]}[]}
// Each blank asks for a measure word; the quantity is already supplied.
const rows:[string,string,CounterLevel,string,string,string][]=[
 ['people','个','A1','people','教室里有三___学生。','There are three students in the classroom.'],
 ['people-honor','位','A1','people (polite)','欢迎这___先生。','Welcome this gentleman.'],
 ['things','个','A1','general objects','我买了四___苹果。','I bought four apples.'],
 ['animals','只','A1','small animals','一___猫在睡觉。','One cat is sleeping.'],
 ['books','本','A1','books','我读了三___书。','I read three books.'],
 ['bottles','瓶','A1','bottles','请给我两___水。','Please give me two bottles of water.'],
 ['cups','杯','A1','cups','我喝了一___咖啡。','I drank one cup of coffee.'],
 ['sheets','张','A1','flat sheets','我需要五___纸。','I need five sheets of paper.'],
 ['vehicles','辆','A2','vehicles','停车场里有六___汽车。','There are six cars in the parking lot.'],
 ['clothes','件','A2','clothes','我买了两___衬衫。','I bought two shirts.'],
 ['pairs','双','A2','pairs','我带了三___鞋。','I packed three pairs of shoes.'],
 ['houses','栋','A2','buildings','山上有四___房子。','There are four houses on the hill.'],
 ['flowers','朵','A2','flowers','我收到了十___玫瑰。','I received ten roses.'],
 ['trees','棵','A2','trees','我们种了五___树。','We planted five trees.'],
 ['meals','顿','A2','meals','我每天吃三___饭。','I eat three meals a day.'],
 ['times','次','A2','occurrences','我去过北京两___。','I have been to Beijing twice.'],
 ['age','岁','B1','years of age','我的侄女八___了。','My niece is eight years old.'],
 ['years','年','B1','years','我在北京住了五___。','I lived in Beijing for five years.'],
 ['months','个','B1','months','我学了六___月中文。','I studied Chinese for six months.'],
 ['days','天','B1','days','旅行一共三___。','The trip lasts three days.'],
 ['hours','个','B1','hours','会议开了两___小时。','The meeting took two hours.'],
 ['minutes','分钟','B1','minutes','到车站要走十___。','It takes ten minutes to walk to the station.'],
 ['floors','层','B1','floors','办公室在七___。','The office is on the seventh floor.'],
 ['chapters','课','B1','lessons','今天我们学习第四___。','Today we study lesson four.'],
 ['pieces','块','B2','pieces','我吃了两___蛋糕。','I ate two pieces of cake.'],
 ['drops','滴','B2','drops','三___眼泪落了下来。','Three tears fell.'],
 ['spoonfuls','勺','B2','spoonfuls','请加一___糖。','Please add one spoonful of sugar.'],
 ['mouthfuls','口','B2','sips','我喝了两___水。','I took two sips of water.'],
 ['songs','首','B2','songs','她唱了五___歌。','She sang five songs.'],
 ['films','部','B2','films','周末我看了三___电影。','I watched three films this weekend.'],
 ['letters','封','B2','letters','我收到了两___信。','I received two letters.']
]
export const counters:CounterEntry[]=rows.map(([id,counter,level,gloss,sentence,translation])=>({id,counter,level,gloss,examples:[{sentence,translation,answer:counter,aliases:id==='people'?['位']:id==='people-honor'?['个']:undefined}]}))
