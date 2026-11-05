// 예전 버전(서비스워커 저장본)이 있는 기기에서 새 버전이 보이기까지 — 예전 커밋으로 열고, 파일을 새 버전으로 바꾼 뒤 새로고침.
// 사용: node tests/update.test.cjs  (git 저장소 안에서, 포트 8768 사용)
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http');
const {execSync}=require('node:child_process');
const OLD=process.env.OLD_COMMIT||'a1a39a6';
const FILES=['index.html','cook-conti.html','cook-sw.js','assets/editor.js','assets/sketch.js','assets/conti.js','assets/conti.css','assets/github.js'];
(async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'conti-update-'));const dir=path.join(root,'youtube-tools');fs.mkdirSync(path.join(dir,'assets'),{recursive:true});
 const put=(src)=>{for(const f of FILES){let body;try{body=src==='new'?fs.readFileSync(f):execSync(`git show ${OLD}:${f}`,{stdio:['ignore','pipe','ignore']})}catch{continue}fs.writeFileSync(path.join(dir,f),body)}};
 put('old');
 const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css'};
 const server=http.createServer((req,res)=>{let p=path.join(root,decodeURIComponent(new URL(req.url,'http://x').pathname));if(p.endsWith(path.sep))p=path.join(p,'index.html');fs.readFile(p,(e,b)=>{if(e){res.writeHead(404);return res.end()}res.writeHead(200,{'content-type':types[path.extname(p)]||'application/octet-stream','cache-control':'max-age=600'});res.end(b)})}).listen(8768);
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const page=await (await browser.newContext()).newPage();
  const url='http://127.0.0.1:8768/youtube-tools/cook-conti.html';
  await page.goto(url);await page.waitForFunction(()=>navigator.serviceWorker.controller);
  assert.equal(await page.locator('#github-mode').count(),0,'예전 버전에는 버튼 없음');
  put('new');
  let reloads=0;
  for(;reloads<3;){await page.reload();reloads++;await page.waitForTimeout(3000);if(await page.locator('#github-mode').count())break}
  assert.ok(await page.locator('#github-mode').count(),'새로고침 3번 안에 새 버전');
  console.log(`update test passed: 새로고침 ${reloads}번 만에 새 버전`);
  assert.ok(reloads<=2,`새로고침 ${reloads}번은 너무 많음`);
  // 오프라인에서도 새 버전 저장본이 열림
  await page.context().setOffline(true);await page.reload();
  assert.ok(await page.locator('#github-mode').count(),'오프라인에서도 새 버전');
 }finally{await browser.close();server.close();fs.rmSync(root,{recursive:true,force:true})}
})().catch(e=>{console.error(e);process.exit(1)});
