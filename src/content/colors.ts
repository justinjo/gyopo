export interface ColorEntry { id: string; korean: string; english: string; hex: string; aliasesKo: string[]; aliasesEn: string[] }
export const colors: ColorEntry[] = [
  ['red','빨간색','red','#b85c4a',['빨강','붉은색'],['crimson']],['orange','주황색','orange','#d7894c',['주황'],[]],
  ['yellow','노란색','yellow','#ddb95b',['노랑'],[]],['green','초록색','green','#6f8d70',['초록','녹색'],[]],
  ['blue','파란색','blue','#587d9c',['파랑','푸른색'],[]],['purple','보라색','purple','#88709a',['보라'],['violet']],
  ['pink','분홍색','pink','#cf8f91',['분홍','핑크색'],[]],['brown','갈색','brown','#8a6953',[],[]],
  ['black','검은색','black','#292c2a',['검정색','검정'],[]],['white','흰색','white','#eeeae0',['하얀색','하양'],[]],
  ['gray','회색','gray','#8a8c87',['회색빛'],['grey']]
].map(([id,korean,english,hex,aliasesKo,aliasesEn]) => ({id,korean,english,hex,aliasesKo,aliasesEn})) as ColorEntry[]
