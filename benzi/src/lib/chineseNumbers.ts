const digits = '零一二三四五六七八九'
function group(value:number):string {
  let result='',zero=false
  for(let position=3;position>=0;position--){
    const digit=Math.floor(value/10**position)%10
    if(!digit){if(result)zero=true;continue}
    if(zero)result+='零'
    result+=digits[digit]+['','十','百','千'][position]
    zero=false
  }
  return result
}
export function toChinese(value:number):string {
  if(!Number.isInteger(value)||value<0||value>999_999_999)throw new RangeError('Mandarin range is 0–999,999,999')
  if(!value)return '零'
  let result=''
  for(let position=2;position>=0;position--){
    const part=Math.floor(value/10**(position*4))%10000
    if(!part)continue
    if(result&&part<1000)result+='零'
    result+=group(part)+['','万','亿'][position]
    if(position>0&&value%10**(position*4)>0&&value%10**(position*4)<10**((position-1)*4))result+='零'
  }
  return result.replace(/零+/g,'零').replace(/^一十/,'十')
}
export function toFinancialChinese(value:number):string {
  // Financial numerals retain the leading 壹 in 壹拾.
  const normal=toChinese(value)
  return (normal.startsWith('十')?'一'+normal:normal).replace(/[零一二三四五六七八九十百千]/g,char=> '零壹贰叁肆伍陆柒捌玖拾佰仟'['零一二三四五六七八九十百千'.indexOf(char)])
}
export function parseIntegerAnswer(value:string):number|null {
  const compact=value.replace(/[,_\s]/g,'')
  return /^\d+$/.test(compact)?Number(compact):null
}
