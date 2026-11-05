// '저장소에서 열기' — GitHub 응답은 가짜(route)로 대신한다. 실제 키·원고 없음.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const context=await browser.newContext();
  await context.addInitScript(()=>{window.cspViolations=[];document.addEventListener('securitypolicyviolation',e=>window.cspViolations.push(e.violatedDirective+' '+e.blockedURI));});
  const KEY='github_pat_'+'A'.repeat(40);
  const conti={version:1,fields:{dishName:'가상 계란찜',cookSteps:'1. 풀기',seg1_time:'0:00~0:20',seg1_script:'가상 멘트',seg1_angle:'top'},shooting:{checks:{},order:['seg1'],active:'seg1'},sketches:{}};
  const calls=[];let mode='ok';
  await context.route('https://api.github.com/**',async route=>{
   const req=route.request();calls.push({url:req.url(),auth:req.headers().authorization,accept:req.headers().accept});
   if(mode==='401')return route.fulfill({status:401,body:'{}'});
   const cors={'access-control-allow-origin':'*'};
   if(req.url().endsWith('/contents/conti/index.json'))return route.fulfill({status:200,headers:cors,contentType:'application/json',body:JSON.stringify({version:1,items:[{id:'egg-test',dish:'가상 계란찜',status:'콘티 완료',updated:'2026-11-06'},{id:'../evil',dish:'x'}]})});
   if(req.url().endsWith('/contents/conti/egg-test/conti.json'))return route.fulfill({status:200,headers:cors,contentType:'application/json',body:JSON.stringify(conti)});
   return route.fulfill({status:404,headers:cors,body:'{}'});
  });
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  await page.goto(process.env.CONTI_TEST_URL||'http://127.0.0.1:8767/youtube-tools/cook-conti.html');
  assert.match(await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content'),/connect-src 'self' https:\/\/api\.github\.com;/);
  await page.locator('#github-mode').click();
  // classic 키·형식이 틀린 키는 거절
  await page.locator('#gh-key').fill('ghp_'+'B'.repeat(36));await page.locator('#gh-connect').click();
  assert.match(await page.locator('#gh-status').textContent(),/classic/);
  await page.locator('#gh-key').fill('hello');await page.locator('#gh-connect').click();
  assert.match(await page.locator('#gh-status').textContent(),/github_pat_/);
  assert.equal(calls.length,0);
  // 기억 안 함 → 탭 저장소에만
  await page.locator('#gh-key').fill(KEY);await page.locator('#gh-connect').click();
  await page.locator('#gh-list button').first().waitFor();
  assert.equal(await page.locator('#gh-list button').count(),1,'잘못된 id는 목록에서 제외');
  assert.match(await page.locator('#gh-list button').first().textContent(),/가상 계란찜 · 콘티 완료/);
  assert.equal(await page.evaluate(()=>localStorage.getItem('nampyContiGithubKeyV1')),null);
  assert.equal(await page.evaluate(()=>sessionStorage.getItem('nampyContiGithubKeyV1')),KEY);
  assert.equal(await page.locator('#gh-key').inputValue(),'','입력창에 키를 남기지 않음');
  assert.equal(calls[0].auth,'Bearer '+KEY);assert.match(calls[0].accept,/raw/);
  // 열기 → 기존 가져오기 확인 단계, 바로 교체하지 않음
  await page.locator('#gh-list button').first().click();
  await page.waitForFunction(()=>/가상 계란찜/.test(document.getElementById('import-summary').textContent));
  assert.notEqual(await page.locator('#dishName').inputValue(),'가상 계란찜','확인 전에는 바꾸지 않음');
  await page.locator('#import-apply').click();
  assert.equal(await page.locator('#dishName').inputValue(),'가상 계란찜');
  // 키 지우기 → 다시 기억하기로 연결 → localStorage
  await page.locator('#github-mode').click();await page.locator('#gh-forget').click();
  assert.equal(await page.evaluate(()=>sessionStorage.getItem('nampyContiGithubKeyV1')),null);
  await page.locator('#gh-key').fill(KEY);await page.locator('#gh-remember').check();await page.locator('#gh-connect').click();
  await page.locator('#gh-list button').first().waitFor();
  assert.equal(await page.evaluate(()=>localStorage.getItem('nampyContiGithubKeyV1')),KEY);
  assert.match(await page.locator('#gh-state').textContent(),/이 기기에 기억/);
  // 만료된 키
  mode='401';await page.locator('#gh-refresh').click();
  await page.waitForFunction(()=>/만료/.test(document.getElementById('gh-status').textContent));
  await page.locator('#gh-forget').click();
  assert.equal(await page.evaluate(()=>localStorage.getItem('nampyContiGithubKeyV1')),null);
  // 키는 api.github.com 외에는 보내지 않음
  assert.ok(calls.every(c=>c.url.startsWith('https://api.github.com/repos/rivaljin/nampy-conti/contents/')));
  assert.deepEqual(await page.evaluate(()=>window.cspViolations),[]);
  assert.deepEqual(errors,[]);
  console.log('github-open test passed');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
