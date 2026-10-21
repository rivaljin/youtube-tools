// A local composition guide from explicit shot metadata, never a generated claim about the recipe.
(() => {
 const NS='http://www.w3.org/2000/svg';
 const node=(name,attrs={},value)=>{const el=document.createElementNS(NS,name);for(const [key,val] of Object.entries(attrs))el.setAttribute(key,String(val));if(value!==undefined)el.textContent=value;return el;};
 function resolveShot(input){
  const text=input.description||'';
  const unsafeToRead=/금지|말고|아니|제외|않|안\s*(찍|씀|쓰|함)/.test(text);
  const matches=unsafeToRead?[]:[['top',/탑\s*뷰|오버헤드|위에서|수직\s*촬영|top[ -]?view|overhead/i],['oblique',/45\s*(?:도|°)|사선|비스듬/i],['front',/정면|front[ -]?view/i]].filter(([,re])=>re.test(text)).map(([key])=>key);
  const tight=/클로즈\s*업|close[ -]?up|\bCU\b/i.test(text)&&!unsafeToRead;
  const actionSubject=/성형틀|몰드|(?:^|\s)틀(?:에서|을|에|로|$)/.test(text)?'mold':/감싸|말아|말기/.test(text)?'sheet':/단면|절단면/.test(text)?(/김밥|롤/.test(input.context||'')?'roll':'section'):'';
  const subjects=unsafeToRead?[]:[['board',/도마|커팅\s*보드/],['bowl',/그릇|믹싱\s*볼|보울/],['pan',/프라이팬|후라이팬|팬\s*(?:위|에|으로)/],['plate',/접시|플레이팅/],['hands',/손동작|손만|손\s*클로즈업/]].filter(([,re])=>re.test(text)).map(([key])=>key);
  const angle=Object.hasOwn(SHOT_OPTIONS.angle,input.angle)&&input.angle?input.angle:(matches.length===1?matches[0]:matches.length===0&&tight?'close':'');
  const subject=Object.hasOwn(SHOT_OPTIONS.subject,input.subject)&&input.subject?input.subject:(subjects.length===1?subjects[0]:!unsafeToRead?actionSubject:'');
  return {...input,angle,subject,motion:input.motion||(!unsafeToRead&&subject==='mold'&&/꺼내/.test(text)?'up':!unsafeToRead&&subject==='sheet'?'in':''),tight:angle==='close'||tight,derived:(!input.angle&&!!angle)||(!input.subject&&!!subject),ambiguous:!input.angle&&matches.length>1};
 }
 window.renderContiSketch=(input,id)=>{
  const shot=resolveShot(input);
  const steps=(input.description||'').split(/\s*(?:→|⇒|->)\s*/).filter(Boolean);
  if(!input.angle&&!input.subject&&steps.length>1&&steps.length<=4){
   const rows=steps.length===4?2:1,cols=steps.length===4?2:steps.length;
   const board=node('svg',{viewBox:`0 0 360 ${rows*150+28}`,role:'img','aria-label':'설명에 적힌 장면 흐름 스케치 · '+steps.join(' → ')});
   board.append(node('rect',{x:1,y:1,width:358,height:rows*150+26,rx:14,fill:'#f8f6ef',stroke:'#d8d5ca'}));
   steps.forEach((step,i)=>{
    const w=348/cols,x=6+(i%cols)*w,y=8+Math.floor(i/cols)*150;
    const child=window.renderContiSketch({angle:shot.angle,description:step,context:input.context,generic:true},id+'-step'+i);
    child.querySelectorAll('text').forEach(el=>el.remove());child.setAttribute('viewBox','35 15 290 175');
    child.setAttribute('x',x+2);child.setAttribute('y',y);child.setAttribute('width',w-4);child.setAttribute('height',108);board.append(child);
    const chars=[...`${i+1}. ${step}`];for(let row=0;row<Math.min(3,Math.ceil(chars.length/Math.max(7,Math.floor(w/12))));row++){const n=Math.max(7,Math.floor(w/12));board.append(node('text',{x:x+w/2,y:y+112+row*14,'text-anchor':'middle',fill:'#52665a','font-size':11},chars.slice(row*n,(row+1)*n).join('')));}
   });
   board.append(node('text',{x:180,y:rows*150+18,'text-anchor':'middle',fill:'#6e786e','font-size':10},shot.angle||steps.some(step=>resolveShot({description:step}).angle)?'설명에 적힌 순서 · 구도 참고':'설명에 적힌 순서 · 카메라 시점은 미지정'));return board;
  }
  if(input.generic&&!shot.angle&&!shot.subject)shot.subject='target';
  const angle=shot.angle?SHOT_OPTIONS.angle[shot.angle]:'시점 미지정';
  const subject=SHOT_OPTIONS.subject[shot.subject]||'피사체 위치';
  const svg=node('svg',{viewBox:'0 0 360 200',role:'img','aria-label':shot.angle||shot.subject?`${angle} · ${subject}${shot.tight&&shot.angle!=='close'?' · 클로즈업':''}${shot.motion&&shot.motion!=='none'?' · '+SHOT_OPTIONS.motion[shot.motion]:''}`:'구도 미지정: 편집에서 구도를 확인하세요'});
  svg.append(node('rect',{x:1,y:1,width:358,height:198,rx:14,fill:'#f8f6ef',stroke:'#d8d5ca'}));
  const ink=node('g',{fill:'none',stroke:'#293e34','stroke-width':2.5,'stroke-linecap':'round','stroke-linejoin':'round'});svg.append(ink);
  // Crop corners define a camera frame rather than a photo or a precise equipment setup.
  ink.append(node('path',{d:'M24 48V24H48 M312 24H336V48 M336 152V176H312 M48 176H24V152',stroke:'#b4b9ac','stroke-width':1.5}));
  if(!shot.angle&&!shot.subject){svg.append(node('text',{x:180,y:94,'text-anchor':'middle',fill:'#59695d','font-size':17},'구도 미지정'));svg.append(node('text',{x:180,y:119,'text-anchor':'middle',fill:'#6e786e','font-size':12},shot.ambiguous?'여러 시점이 적혀 있습니다 · 구도를 확인하세요':'편집에서 구도를 선택하거나 화면 설명에 적어주세요'));return svg;}
  const top=shot.angle==='top',front=shot.angle==='front',close=shot.tight;
  const object=node('g',{transform:close?'translate(-80 -47) scale(1.45)':''});ink.append(object);
  if(!shot.subject||shot.subject==='target'){
   object.append(node('path',{d:top?'M94 59H266V150H94Z':front?'M78 146H282 M125 83H235V143H125Z':shot.angle?'M109 70H250L278 144H77Z':'M105 65H255V148H105Z',stroke:'#95a28f','stroke-dasharray':'5 5'}));
   object.append(node('path',{d:'M165 108H195 M180 93V123',stroke:'#687d69'}));
  }else if(shot.subject==='roll'){
   object.append(node('ellipse',{cx:180,cy:108,rx:58,ry:47}),node('ellipse',{cx:180,cy:108,rx:49,ry:38,'stroke-width':1}));
   object.append(node('path',{d:'M156 97L168 90L180 101L169 112Z M184 106L197 99L207 113L194 122Z M158 123L176 121',stroke:'#809681'}));
  }else if(shot.subject==='section'){
   object.append(node('path',{d:'M120 68L225 78L242 142L132 131Z M120 68L140 54L245 65L225 78 M225 78L245 65L259 129L242 142 M129 89L230 100 M133 111L236 122',stroke:'#687d69'}));
  }else if(shot.subject==='mold'){
   object.append(node('path',{d:'M100 100L145 77H252L216 100Z M100 100V141H216V100 M216 141L252 117V77 M114 107H201V130H114Z'}));
   object.append(node('path',{d:'M135 65L165 51H230L205 66Z M135 65V79H205V66 M205 79L230 64V51',stroke:'#809681'}));
  }else if(shot.subject==='sheet'){
   object.append(node('path',{d:'M103 69L260 80L282 145L86 135Z',stroke:'#809681'}));
   object.append(node('path',{d:'M139 97Q147 82 164 86L225 102Q241 108 234 123Q231 135 215 132L151 117Q137 114 139 97Z M143 94Q162 88 168 103Q171 117 155 118'}));
  }else if(shot.subject==='board'){
   object.append(node('path',{d:top?'M91 58Q86 58 86 64V141Q86 148 93 148H267Q274 148 274 141V64Q274 58 267 58Z':front?'M86 130H274L286 145H75Z':'M105 73L265 84L288 143L72 131Z'}));
   object.append(node('path',{d:front?'M100 128L138 105L160 128 M180 128Q202 91 225 128':'M136 91Q151 71 167 93Q150 112 136 91Z M191 109L215 89L234 113Z M132 127L166 119 M191 132L223 125'}));
  }else if(shot.subject==='bowl'){
   object.append(node('ellipse',{cx:180,cy:top?104:87,rx:71,ry:top?56:21}));
   if(!top)object.append(node('path',{d:'M109 87Q116 154 180 156Q244 154 251 87'}));
   object.append(node('path',{d:top?'M147 100Q160 78 181 103Q197 121 216 99 M147 123Q175 108 203 128':'M142 86Q161 71 182 86Q202 101 222 84',stroke:'#809681'}));
  }else if(shot.subject==='pan'){
   object.append(node('ellipse',{cx:171,cy:107,rx:67,ry:top?52:30}));object.append(node('ellipse',{cx:171,cy:107,rx:58,ry:top?43:22,'stroke-width':1}));
   object.append(node('path',{d:'M231 93L287 73Q294 74 294 82L238 112'}));object.append(node('path',{d:'M144 99L157 91L165 105L151 113Z M184 107L198 94L209 108L195 119Z'}));
  }else if(shot.subject==='plate'){
   object.append(node('ellipse',{cx:180,cy:113,rx:83,ry:top?56:32}));object.append(node('ellipse',{cx:180,cy:113,rx:66,ry:top?42:23,'stroke-width':1}));
   object.append(node('path',{d:top?'M141 95L166 80L188 99L162 117Z M181 117L207 101L230 121L204 139Z':'M142 109L162 82L185 107Z M180 116L206 89L227 114Z'}));
  }else if(shot.subject==='hands'){
   object.append(node('rect',{x:104,y:75,width:152,height:74,rx:10,stroke:'#adb9aa','stroke-width':1}));
   object.append(node('path',{d:'M69 164L93 128L100 93Q103 85 108 92L108 119L123 98Q129 91 133 98L121 124L138 110Q146 106 147 114L125 141L113 169 M291 164L267 128L260 93Q257 85 252 92L252 119L237 98Q231 91 227 98L239 124L222 110Q214 106 213 114L235 141L247 169'}));
  }
  // Camera position is meaningful even when no particular bowl/plate is specified.
  if(shot.angle){
   const [x,y]=top?[180,37]:front?[48,106]:[68,48];
   const camera=node('g',{transform:`translate(${x-9} ${y-6})`,stroke:'#687d69',fill:'#f8f6ef','stroke-width':1.5});
   camera.append(node('rect',{x:0,y:0,width:18,height:12,rx:2}),node('circle',{cx:9,cy:6,r:3}),node('path',{d:'M4 0L6 -3H12L14 0'}));svg.append(camera);
  }
  const markerId='shot-arrow-'+id;const defs=node('defs');const marker=node('marker',{id:markerId,markerWidth:7,markerHeight:7,refX:5,refY:3.5,orient:'auto'});marker.append(node('path',{d:'M0 0L6 3.5L0 7',fill:'none',stroke:'#bc642f','stroke-width':1.5}));defs.append(marker);svg.append(defs);
  const moves={left:'M249 53H112',right:'M110 53H247',down:'M180 48V91',up:'M180 89V29',in:'M93 50L146 85 M267 50L214 85'};
  if(moves[shot.motion])svg.append(node('path',{d:moves[shot.motion],fill:'none',stroke:'#bc642f','stroke-width':2.5,'marker-end':`url(#${markerId})`}));
  svg.append(node('text',{x:180,y:188,'text-anchor':'middle',fill:'#52665a','font-size':11},`${angle}${shot.tight&&shot.angle!=='close'?' · 클로즈업':''} · ${shot.derived?'설명 문구 기준':'구도 참고'}`));return svg;
 };
})();
