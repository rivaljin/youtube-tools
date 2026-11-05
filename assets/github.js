// 비공개 콘티 저장소(rivaljin/nampy-conti)에서 콘티 열기 — 읽기 전용 키만 받는다.
// 키는 기본으로 이 탭에만(sessionStorage) 두고, 사용자가 고를 때만 이 기기(localStorage)에 기억한다.
// 받은 콘티는 기존 '가져오기 → 내용 확인 → 교체' 절차를 그대로 거친다(바로 덮어쓰지 않음).
(() => {
 const REPO='rivaljin/nampy-conti', DIR='conti', API='https://api.github.com';
 const KEY_NAME='nampyContiGithubKeyV1';
 const store={
  get(){try{return sessionStorage.getItem(KEY_NAME)||localStorage.getItem(KEY_NAME)||''}catch{return ''}},
  set(key,remember){try{sessionStorage.setItem(KEY_NAME,key);if(remember)localStorage.setItem(KEY_NAME,key);else localStorage.removeItem(KEY_NAME)}catch{}},
  clear(){try{sessionStorage.removeItem(KEY_NAME);localStorage.removeItem(KEY_NAME)}catch{}},
  remembered(){try{return !!localStorage.getItem(KEY_NAME)}catch{return false}},
 };
 const toolbar=document.querySelector('.conti-toolbar');
 const button=document.createElement('button');button.id='github-mode';button.textContent='저장소에서 열기';toolbar.append(button);
 const panel=document.createElement('section');panel.className='conti-import conti-github';panel.hidden=true;
 panel.innerHTML='<h2>저장소에서 열기</h2>'+
  '<p class="conti-note">비공개 저장소 <b>nampy-conti</b>의 콘티를 바로 엽니다. 키는 이 저장소만 <b>읽을 수 있는</b> 키를 넣으세요. 저장·수정은 이 도구에서 하지 않습니다(JSON 백업을 Claude에게 전달).</p>'+
  '<div id="gh-key-box"><label for="gh-key">읽기 전용 키 (github_pat_로 시작)</label><input id="gh-key" type="password" autocomplete="off" spellcheck="false">'+
  '<label class="shoot-check"><input id="gh-remember" type="checkbox"> 이 기기에 기억 (끄면 이 탭을 닫을 때 지워짐)</label>'+
  '<button id="gh-connect">연결</button></div>'+
  '<div id="gh-connected" hidden><p class="conti-note" id="gh-state"></p><button id="gh-refresh">목록 새로고침</button> <button id="gh-forget">키 지우기</button></div>'+
  '<p id="gh-status" role="status"></p><ul id="gh-list" class="gh-list"></ul>';
 toolbar.nextElementSibling.after(panel);
 const $=id=>document.getElementById(id);
 const status=t=>{$('gh-status').textContent=t};

 function render(){
  const has=!!store.get();
  $('gh-key-box').hidden=has;$('gh-connected').hidden=!has;
  $('gh-state').textContent=has?(store.remembered()?'연결됨 · 이 기기에 기억 중':'연결됨 · 이 탭에서만'):'';
  if(!has)$('gh-list').replaceChildren();
 }
 async function api(path,raw){
  const key=store.get();if(!key)throw Error('키를 먼저 넣어 주세요.');
  let res;
  try{res=await fetch(`${API}/repos/${REPO}/contents/${path}`,{headers:{Authorization:`Bearer ${key}`,Accept:raw?'application/vnd.github.raw+json':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},cache:'no-store',referrerPolicy:'no-referrer'})}
  catch{throw Error('GitHub에 연결하지 못했습니다. 인터넷 연결을 확인하세요.')}
  if(res.status===401)throw Error('키가 맞지 않거나 만료됐습니다. 키 지우기 후 새 키를 넣으세요.');
  if(res.status===403)throw Error('이 키로 읽을 수 없습니다. 키 권한(Contents: Read-only)을 확인하세요.');
  if(res.status===404)throw Error('저장소나 파일을 찾지 못했습니다. 키를 만들 때 nampy-conti 저장소를 선택했는지 확인하세요.');
  if(!res.ok)throw Error(`GitHub 응답 오류 (${res.status})`);
  return raw?res.text():res.json();
 }
 async function load(){
  status('목록을 불러오는 중…');$('gh-list').replaceChildren();
  try{
   let items;
   try{const index=JSON.parse(await api(`${DIR}/index.json`,true));items=Array.isArray(index.items)?index.items:[]}
   catch(e){if(!/찾지 못했습니다/.test(e.message))throw e;items=(await api(DIR)).filter(x=>x.type==='dir'&&!x.name.startsWith('_')).map(x=>({id:x.name}))}
   items=items.filter(x=>x&&typeof x.id==='string'&&/^[a-z0-9]+(-[a-z0-9]+)*$/.test(x.id));
   if(!items.length){status('저장소에 콘티가 없습니다.');return}
   for(const it of items){
    const li=document.createElement('li');const b=document.createElement('button');
    b.textContent=[it.dish||it.id,it.status,it.updated].filter(x=>typeof x==='string'&&x).join(' · ');
    b.onclick=()=>open(it.id);li.append(b);$('gh-list').append(li);
   }
   status(`콘티 ${items.length}개 · 열 콘티를 고르세요.`);
  }catch(e){status(e.message)}
 }
 async function open(id){
  status(`${id} 불러오는 중…`);
  try{
   const text=await api(`${DIR}/${id}/conti.json`,true);
   if(text.length>16e6)throw Error('콘티가 너무 큽니다.');
   const importer=document.querySelector('.conti-import:not(.conti-github)');
   const input=$('import-text');input.value=text;input.dispatchEvent(new Event('input',{bubbles:true}));
   importer.hidden=false;panel.hidden=true;
   $('import-preview').click();
   status('');
   importer.scrollIntoView({behavior:'smooth'});
  }catch(e){status(e.message)}
 }
 button.onclick=()=>{panel.hidden=!panel.hidden;render();if(!panel.hidden&&store.get()&&!$('gh-list').children.length)load()};
 $('gh-connect').onclick=()=>{
  const key=$('gh-key').value.trim();$('gh-key').value='';
  if(/^(ghp|gho|ghu|ghs)_/.test(key)){status('예전 방식(classic) 키는 모든 저장소를 열 수 있어 받지 않습니다. Fine-grained 키(github_pat_)를 만들어 주세요.');return}
  if(!/^github_pat_[A-Za-z0-9_]{20,}$/.test(key)){status('github_pat_로 시작하는 키를 넣어 주세요.');return}
  store.set(key,$('gh-remember').checked);render();load();
 };
 $('gh-refresh').onclick=load;
 $('gh-forget').onclick=()=>{store.clear();render();status('키를 지웠습니다.')};
})();
