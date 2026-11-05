// Synthetic fixtures only. Exercise real UI handlers under the enforced CSP.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const html=fs.readFileSync('cook-conti.html','utf8');
 assert.doesNotMatch(html,/<script\b[^>]*>\s*[^<\s]/i);
 assert.doesNotMatch(html,/\son\w+\s*=/i);
 assert.match(html,/script-src 'self';/);
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const context=await browser.newContext({permissions:['clipboard-read','clipboard-write']});
  await context.addInitScript(()=>{window.cspViolations=[];document.addEventListener('securitypolicyviolation',e=>window.cspViolations.push({directive:e.violatedDirective,blocked:e.blockedURI,source:e.sourceFile,sample:e.sample,line:e.lineNumber}));});
  const page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  await page.goto(process.env.CONTI_TEST_URL||'http://127.0.0.1:8767/youtube-tools/cook-conti.html');
  assert.equal(await page.locator('meta[name=referrer]').getAttribute('content'),'no-referrer');
  assert.match(await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content'),/script-src 'self';/);
  await page.locator('#loadExample').click();
  await page.locator('#dishName').fill('보안 검증 가상 콘티');
  await page.locator('#generate').click();await page.locator('#copyOutput').click();
  assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/보안 검증 가상 콘티/);
  const mdEvent=page.waitForEvent('download');await page.locator('#downloadMd').click();
  assert.match((await mdEvent).suggestedFilename(),/-conti\.md$/);
  await page.locator('#import-mode').click();await page.locator('#gpt-format').click();
  assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/JSON/);
  await page.locator('#shoot-mode').click();
  const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aP1sAAAAASUVORK5CYII=';
  await page.locator('[data-scene="seg1"] input[type=file]').setInputFiles({name:'synthetic.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
  await page.waitForFunction(()=>document.querySelector('[data-scene="seg1"] img')?.naturalWidth===1);
  await page.locator('#edit-mode').click();
  const backupEvent=page.waitForEvent('download');await page.locator('#backup-conti').click();
  const stream=await (await backupEvent).createReadStream();let raw='';for await(const chunk of stream)raw+=chunk;
  const backup=JSON.parse(raw);assert.equal(backup.version,1);assert.equal(backup.sketches.seg1,'data:image/png;base64,'+png);
  await page.locator('#import-text').fill(raw);await page.locator('#import-preview').click();await page.locator('#import-apply').click();
  await page.waitForFunction(()=>navigator.serviceWorker.controller);
  assert.equal(await page.evaluate(async()=>!!await (await caches.open('youtube-tools-conti-v7-github-open')).match(new URL('./assets/editor.js',location.href))),true);
  assert.deepEqual(await page.evaluate(()=>window.cspViolations),[]);
  await context.setOffline(true);await page.reload();await page.locator('#shoot-mode').click();
  await page.waitForFunction(()=>document.querySelector('[data-scene="seg1"] img')?.naturalWidth===1);
  await page.locator('#edit-mode').click();await page.locator('#clearAll').click();assert.equal(await page.locator('#dishName').inputValue(),'');
  assert.deepEqual(await page.evaluate(()=>window.cspViolations),[]);assert.deepEqual(errors,[]);
  console.log('PASS: CSP/referrer, five UI handlers, clipboard/Markdown download, GPT format copy, PNG attachment/JSON restore, editor cache and offline image, no CSP violations');
  await context.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
