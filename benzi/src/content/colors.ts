export interface ColorEntry { id:string; chinese:string; english:string; hex:string; aliasesZh:string[]; aliasesEn:string[] }
export const colors:ColorEntry[] = [
 ['red','红色','red','#b85c4a',['红'],[]],['orange','橙色','orange','#d7894c',['橙'],[]],
 ['yellow','黄色','yellow','#ddb95b',['黄'],[]],['green','绿色','green','#6f8d70',['绿'],[]],
 ['blue','蓝色','blue','#587d9c',['蓝'],[]],['purple','紫色','purple','#88709a',['紫'],['violet']],
 ['pink','粉红色','pink','#cf8f91',['粉色','粉红'],[]],['brown','棕色','brown','#8a6953',['褐色'],[]],
 ['black','黑色','black','#292c2a',['黑'],[]],['white','白色','white','#eeeae0',['白'],[]],
 ['gray','灰色','gray','#8a8c87',['灰'],['grey']]
].map(([id,chinese,english,hex,aliasesZh,aliasesEn])=>({id,chinese,english,hex,aliasesZh,aliasesEn})) as ColorEntry[]
