// A local composition guide from explicit shot metadata, never a generated claim about the recipe.
(() => {
 const NS='http://www.w3.org/2000/svg';
 const node=(name,attrs={},value)=>{const el=document.createElementNS(NS,name);for(const [key,val] of Object.entries(attrs))el.setAttribute(key,String(val));if(value!==undefined)el.textContent=value;return el;};
 window.renderContiSketch=(shot,id)=>{
  const angle=SHOT_OPTIONS.angle[shot.angle],subject=SHOT_OPTIONS.subject[shot.subject];
  const svg=node('svg',{viewBox:'0 0 360 200',role:'img','aria-label':shot.angle&&shot.subject?`${angle} · ${subject}${shot.motion&&shot.motion!=='none'?' · '+SHOT_OPTIONS.motion[shot.motion]:''}`:'구도 미지정: 편집에서 구도와 피사체를 선택하세요'});
  svg.append(node('rect',{x:1,y:1,width:358,height:198,rx:14,fill:'#f8f6ef',stroke:'#d8d5ca'}));
  const ink=node('g',{fill:'none',stroke:'#293e34','stroke-width':2.5,'stroke-linecap':'round','stroke-linejoin':'round'});svg.append(ink);
  // Crop corners define a camera frame rather than a photo or a precise equipment setup.
  ink.append(node('path',{d:'M24 48V24H48 M312 24H336V48 M336 152V176H312 M48 176H24V152',stroke:'#b4b9ac','stroke-width':1.5}));
  if(!shot.angle||!shot.subject||!angle||!subject){svg.append(node('text',{x:180,y:94,'text-anchor':'middle',fill:'#59695d','font-size':17},'구도 미지정'));svg.append(node('text',{x:180,y:119,'text-anchor':'middle',fill:'#6e786e','font-size':12},'편집에서 구도 · 피사체를 선택하세요'));return svg;}
  const top=shot.angle==='top',front=shot.angle==='front',close=shot.angle==='close';
  const object=node('g',{transform:close?'translate(-80 -47) scale(1.45)':''});ink.append(object);
  if(shot.subject==='board'){
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
  const markerId='shot-arrow-'+id;const defs=node('defs');const marker=node('marker',{id:markerId,markerWidth:7,markerHeight:7,refX:5,refY:3.5,orient:'auto'});marker.append(node('path',{d:'M0 0L6 3.5L0 7',fill:'none',stroke:'#bc642f','stroke-width':1.5}));defs.append(marker);svg.append(defs);
  const moves={left:'M249 53H112',right:'M110 53H247',down:'M180 48V91',in:'M93 50L146 85 M267 50L214 85'};
  if(moves[shot.motion])svg.append(node('path',{d:moves[shot.motion],fill:'none',stroke:'#bc642f','stroke-width':2.5,'marker-end':`url(#${markerId})`}));
  svg.append(node('text',{x:180,y:188,'text-anchor':'middle',fill:'#52665a','font-size':11},`${angle} · ${subject} · 구도 참고`));return svg;
 };
})();
