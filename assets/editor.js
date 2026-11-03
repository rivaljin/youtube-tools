const SEGMENTS=[
 ['5-1. 오프닝','seg1'],
 ['5-2. 재료·분량','seg2'],
 ['5-3. 준비·실패방지','seg3'],
 ['5-4. 핵심 조리','seg4'],
 ['5-5. 꺼내기·마무리','seg5'],
 ['5-6. 응용형 (선택)','seg6'],
 ['5-7. 완성량·플레이팅','seg7'],
 ['5-8. 시식·마무리','seg8'],
];
const FIELDS=['time','screen','script','subtitle','angle','subject','motion','notes'];
const SHOT_OPTIONS={angle:{'':'구도 미지정',top:'탑뷰 · 위에서',oblique:'45도 · 비스듬히',front:'정면',close:'클로즈업'},subject:{'':'피사체 미지정',board:'도마',bowl:'그릇',pan:'팬',plate:'완성 접시',hands:'손동작',roll:'롤 · 김밥',section:'단면',mold:'성형틀',sheet:'감싸기'},motion:{'':'움직임 없음',none:'움직임 없음',left:'왼쪽으로',right:'오른쪽으로',down:'아래로',up:'위로',in:'가운데로'}};
const FIELD_LABELS={time:'시간',screen:'화면',script:'멘트',subtitle:'자막',angle:'구도',subject:'피사체',motion:'동작',notes:'주의 / 팁'};

// 세그먼트 입력란 생성
(function(){
  const c=document.getElementById('segments');
  SEGMENTS.forEach(([title,prefix])=>{
    const div=document.createElement('div');
    div.className='seg-box';
    let h=`<h4>${title}</h4><div class="grid2">`;
    FIELDS.forEach(f=>{
      h+=`<div><label for="${prefix}_${f}">${FIELD_LABELS[f]}</label>${SHOT_OPTIONS[f]?`<select id="${prefix}_${f}">${Object.entries(SHOT_OPTIONS[f]).map(([v,label])=>`<option value="${v}">${label}</option>`).join('')}</select>`:f==='time'?`<input type="text" id="${prefix}_${f}" placeholder="${FIELD_LABELS[f]}">`:`<textarea id="${prefix}_${f}" placeholder="${FIELD_LABELS[f]}"></textarea>`}</div>`;
    });
    h+='</div>';
    div.innerHTML=h;
    c.appendChild(div);
  });
})();

// 자동 저장
const ALL_IDS=['dishName','writeDate','editLength','constraints','concept1','concept3','viewerGain','toVerify','checklist','ingredients','tools','variation','cookSteps','failPoint','shootOrder','mustShots','titles','thumbnail','remaining'];
SEGMENTS.forEach(([t,p])=>FIELDS.forEach(f=>ALL_IDS.push(`${p}_${f}`)));

function saveAll(){
  const data={};
  ALL_IDS.forEach(id=>{const el=document.getElementById(id);if(el)data[id]=el.value;});
  try{localStorage.setItem('cookContiV31',JSON.stringify(data));}catch(e){document.getElementById('autosaveMsg').textContent='저장 실패 · JSON 백업을 다운로드하세요';return false;}
  document.getElementById('autosaveMsg').textContent='✓ 자동 저장됨 '+new Date().toLocaleTimeString();
}
function restoreAll(){
  try{
    const data=JSON.parse(localStorage.getItem('cookContiV31')||'{}');
    ALL_IDS.forEach(id=>{const el=document.getElementById(id);if(el&&data[id]!==undefined)el.value=data[id];});
    if(Object.keys(data).length>0)document.getElementById('autosaveMsg').textContent='✓ 이전 입력 복원됨';
  }catch(e){}
}
ALL_IDS.forEach(id=>{
  const el=document.getElementById(id);
  if(el)el.addEventListener('input',()=>{window._lastMd='';document.getElementById('afterGen').style.display='none';document.getElementById('output').style.display='none';document.getElementById('warnBox').dataset.confirmed='';clearTimeout(window._st);window._st=setTimeout(saveAll,800);});
});
document.getElementById('writeDate').value=new Date().toLocaleDateString('sv-SE');
// Copy a legacy draft once; never modify the old tool's saved data.
try{
 if(!localStorage.getItem('cookContiV31Migrated')){
  if(localStorage.getItem('cookContiV31')===null){
   const raw=localStorage.getItem('cookContiV2');
   if(raw){const data=JSON.parse(raw);if(data&&typeof data==='object'&&!Array.isArray(data)&&ALL_IDS.every(id=>data[id]===undefined||typeof data[id]==='string'))localStorage.setItem('cookContiV31',raw);}
  }
  localStorage.setItem('cookContiV31Migrated','1');
 }
}catch(e){}
restoreAll();

function val(id){const el=document.getElementById(id);return el?el.value.trim():'';}
function segVal(prefix){
  const o={};
  FIELDS.forEach(f=>o[f]=val(`${prefix}_${f}`));
  return o;
}

function loadExample(){
 if(!confirm('현재 콘티를 공개 기능 예시로 교체할까요? 먼저 JSON 백업을 권합니다.'))return;
 ALL_IDS.forEach(id=>{document.getElementById(id).value='';});
 document.getElementById('dishName').value='공개 기능 예시';
 document.getElementById('writeDate').value=new Date().toLocaleDateString('sv-SE');
 document.getElementById('concept1').value='도구 기능 확인을 위한 가상 예시입니다.';
 document.getElementById('cookSteps').value='1. 준비하기\n2. 과정 촬영하기\n3. 마무리하기';
 document.getElementById('checklist').value='- [ ] 배터리 확인';
 document.getElementById('shootOrder').value='1. 준비 장면\n2. 핵심 과정\n3. 완성 장면';
 document.getElementById('mustShots').value='- [ ] 완성 장면';
 for(const [title,prefix] of SEGMENTS){document.getElementById(prefix+'_screen').value='가상 예시: '+title;document.getElementById(prefix+'_script').value='이곳에 논의한 멘트를 입력하세요.';document.getElementById(prefix+'_angle').value=['top','oblique','close'][Number(prefix.slice(3))%3];document.getElementById(prefix+'_subject').value=prefix==='seg1'?'plate':'board';document.getElementById(prefix+'_notes').value='빛이 손에 가리지 않게 확인하세요.';}
 localStorage.removeItem('cookContiShootV31');window.dispatchEvent(new Event('conti-replaced'));saveAll();
}
function clearAll(){
  if(!confirm('모든 입력과 촬영 체크를 지울까요? 필요한 내용은 먼저 JSON 백업하세요.'))return;
  clearTimeout(window._st);
  localStorage.removeItem('cookContiShootV31');
  window.dispatchEvent(new Event('conti-replaced'));
  ALL_IDS.forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  localStorage.removeItem('cookContiV31');
  document.getElementById('writeDate').value=new Date().toLocaleDateString('sv-SE');
}

function generate(){
  const warn=document.getElementById('warnBox');
  const missing=[];
  if(!val('dishName'))missing.push('요리명');
  if(!val('cookSteps'))missing.push('조리 순서');
  if(missing.length>0 && warn.dataset.confirmed!=='1'){
    warn.style.display='block';
    warn.innerHTML='⚠️ 다음 항목을 입력해 주세요: <b>'+missing.join(', ')+'</b><br>그래도 생성하려면 다시 눌러주세요.';
    warn.dataset.confirmed='1';
    return;
  }
  if(warn.dataset.confirmed!=='1'&&!val('concept1')){
    warn.style.display='block';
    warn.innerHTML='⚠️ 콘셉트가 비어 있습니다. 그래도 생성하려면 다시 눌러주세요.';
    warn.dataset.confirmed='1';
    return;
  }
  warn.style.display='none';
  warn.dataset.confirmed='';

  const d=val('dishName');
  const L=[];
  L.push(`# ${d} 영상 콘티 & 스크립트`);
  L.push(`작성일: ${val('writeDate')}`);
  L.push(`현재 상태: 콘티 초안`);
  L.push(`예상 편집 길이: ${val('editLength')||'[작성 필요]'}`);
  L.push(`촬영 제약: ${val('constraints')||'[작성 필요]'}`);
  L.push(``);
  L.push(`## 1. 콘셉트`);
  L.push(`한 문장: ${val('concept1')||'[작성 필요]'}`);
  L.push(``);
  L.push(`핵심 3가지:`);
  L.push(val('concept3')||'[작성 필요]');
  L.push(``);
  L.push(`- 시청자가 얻는 것: ${val('viewerGain')||'[작성 필요]'}`);
  L.push(`- 이번에 확인할 점: ${val('toVerify')||'[작성 필요]'}`);
  L.push(``);
  L.push(`## 2. 촬영 전 확인·기입`);
  L.push(val('checklist')||'[작성 필요]');
  L.push(``);
  L.push(`## 3. 재료·도구`);
  L.push(`### 기본형 재료`);
  L.push(val('ingredients')||'[작성 필요]');
  L.push(``);
  L.push(`### 도구`);
  L.push(val('tools')||'[작성 필요]');
  if(val('variation')){L.push(``);L.push(`### 응용형: ${val('variation')}`);}
  L.push(``);
  L.push(`## 4. 조리 순서`);
  L.push(val('cookSteps'));
  L.push(``);
  L.push(`- 실패 방지 포인트: ${val('failPoint')||'[작성 필요]'}`);
  L.push(``);
  L.push(`## 5. 영상 콘티`);
  SEGMENTS.forEach(([title,prefix],idx)=>{
    const s=segVal(prefix);
    const isOptional = prefix==='seg6';
    const hasAny = FIELDS.some(field=>s[field]);
    if(!hasAny && isOptional) return; // 응용형만 생략
    L.push(`### ${title}`);
    if(!hasAny){
      L.push('[작성 필요]');
    }else{
      if(s.time)L.push(`- 시간: ${s.time}`);
      if(s.screen)L.push(`- 화면: ${s.screen}`);
      if(s.script)L.push(`- 멘트: ${s.script}`);
      if(s.subtitle)L.push(`- 자막: ${s.subtitle}`);
      for(const field of ['angle','subject','motion','notes'])if(s[field])L.push(`- ${FIELD_LABELS[field]}: ${s[field]}`);
    }
    L.push(``);
  });
  L.push(`## 6. 실제 촬영 순서`);
  L.push(val('shootOrder')||'[작성 필요]');
  L.push(``);
  L.push(`## 7. 꼭 확보할 장면`);
  L.push(val('mustShots')||'[작성 필요]');
  L.push(``);
  L.push(`## 8. 제목·썸네일`);
  L.push(`### 제목 후보`);
  L.push(val('titles')||'[작성 필요]');
  L.push(``);
  L.push(`썸네일: ${val('thumbnail')||'[작성 필요]'}`);
  L.push(``);
  L.push(`## 9. 완료 전 남은 확인`);
  L.push(val('remaining')||'[작성 필요]');

  const out=L.join('\n');
  window._lastMd=out;
  window._lastTitle=d;
  const el=document.getElementById('output');
  el.textContent=out;
  el.style.display='block';
  document.getElementById('afterGen').style.display='flex';
  el.scrollIntoView({behavior:'smooth'});
}
function copyOutput(){
  generate();
  const t=window._lastMd||'';
  if(!t)return;
  navigator.clipboard.writeText(t).then(()=>{
    alert('✓ 클립보드에 복사됐습니다.');
  }).catch(()=>{
    alert('✗ 복사에 실패했습니다. .md 다운로드를 이용해 주세요.');
  });
}
function downloadMd(){
  generate();
  const t=window._lastMd||'';
  if(!t)return;
  const title=(window._lastTitle||'conti').replace(/[^\w가-힣]+/g,'-');
  const blob=new Blob([t],{type:'text/markdown;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=title+'-conti.md';
  a.click();
  URL.revokeObjectURL(a.href);
}
document.getElementById('loadExample').addEventListener('click', loadExample);
document.getElementById('clearAll').addEventListener('click', clearAll);
document.getElementById('generate').addEventListener('click', generate);
document.getElementById('copyOutput').addEventListener('click', copyOutput);
document.getElementById('downloadMd').addEventListener('click', downloadMd);
