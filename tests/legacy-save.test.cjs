// Synthetic data: old-tool and new-tool storage must not overwrite each other.
const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const c=await b.newContext();await c.addInitScript(()=>{if(!localStorage.getItem('synthetic-seed')){localStorage.setItem('cookContiV2',JSON.stringify({dishName:'이전 콘티',seg1_screen:'기존 장면',seg1_script:'기존 멘트'}));localStorage.setItem('cookContiShootV3',JSON.stringify({checks:{'scene:seg1':true},order:['seg1']}));localStorage.setItem('synthetic-seed','1')}});
 const p=await c.newPage();p.on('dialog',d=>d.accept());await p.goto(process.env.CONTI_TEST_URL||'http://127.0.0.1:8767/youtube-tools/cook-conti.html');assert.equal(await p.locator('#dishName').inputValue(),'이전 콘티');await p.locator('#shoot-mode').click();assert.equal(await p.locator('.scene-card:visible input[type=checkbox]').isChecked(),true);
 await p.locator('#edit-mode').click();await p.locator('#seg1_notes').fill('새 버전의 팁');await p.locator('#seg1_angle').selectOption('top');await p.evaluate(()=>saveAll());assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('cookContiV2')).seg1_notes),undefined);
 await p.evaluate(()=>localStorage.setItem('cookContiV2',JSON.stringify({dishName:'구형 도구의 별도 수정',seg1_script:'과거 내용'})));await p.reload();assert.equal(await p.locator('#dishName').inputValue(),'이전 콘티');assert.equal(await p.locator('#seg1_notes').inputValue(),'새 버전의 팁');
 await p.evaluate(()=>clearAll());await p.reload();assert.equal(await p.locator('#dishName').inputValue(),'');assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('cookContiV2')).dishName),'구형 도구의 별도 수정');
 console.log('PASS: one-time legacy draft/check migration, isolated new fields, old keys unchanged, cleared draft not resurrected');await c.close();
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
