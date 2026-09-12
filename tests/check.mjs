import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),C=require('../src/core.js');
const root=path.resolve(import.meta.dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const bank=Object.fromEntries(C.LANGS.map(l=>[l,read('src/locales/'+l+'.json')]));
const flat=Object.fromEntries(C.LANGS.map(l=>[l,bank[l].flatMap(c=>c.questions)]));
const ids=flat.en.map(q=>q.id),now='2026-09-10T00:00:00.000Z';
// Validate the JSON Schema vocabulary used by this project's schema.
function validate(v,s,p='$'){
 if(s.anyOf){assert(s.anyOf.some(x=>{try{validate(v,x,p);return true;}catch{return false;}}),p+' anyOf');return;}
 if(s.const!==undefined)assert.deepEqual(v,s.const,p);
 if(s.enum)assert(s.enum.includes(v),p+' enum');
 if(s.type){const t=v===null?'null':Array.isArray(v)?'array':typeof v;assert(Array.isArray(s.type)?s.type.includes(t):s.type==='integer'?Number.isInteger(v):t===s.type,p+' type');}
 if(s.minimum!==undefined)assert(v>=s.minimum,p);
 if(s.minLength!==undefined)assert(v.length>=s.minLength,p);
 if(s.type==='object'){for(const k of s.required||[])assert(Object.hasOwn(v,k),p+'.'+k);for(const k of Object.keys(v)){if(s.additionalProperties===false)assert(Object.hasOwn(s.properties,k),p+'.'+k);if(s.properties?.[k])validate(v[k],s.properties[k],p+'.'+k);}}
 if(s.type==='array'&&s.items)v.forEach((x,i)=>validate(x,s.items,p+'['+i+']'));
}
const schema=read('src/schema.json');let checks=0;
for(const lang of C.LANGS){
 assert.equal(flat[lang].length,100);assert.deepEqual(flat[lang].map(q=>q.id),ids);
 const data={language:lang,categories:bank[lang],canonical:bank.en,allQuestions:flat,ui:read('src/locales/'+lang+'.ui.json'),docs:read('src/locales/'+lang+'.docs.json'),schema,protocol:read('src/protocol.json'),termsEnglish:read('src/locales/en.docs.json').usage.slice(1).join('\n\n')};
 assert.throws(()=>C.envelope(data,{},now));
 let answers={};for(let i=0;i<100;i++)answers=C.applyBatch(answers,[{questionId:ids[i],...(i%5?{responseStatus:C.STATES[i%5]}:{optionIndex:i%4}),freeText:'原文 ``` </script> café 🎮',freeTextLanguage:'ja'}],ids,lang,now);
 const p=C.envelope(data,answers,now);validate(p,schema);
 assert.equal(p.relationshipData.items.length,100);assert(p.relationshipData.items.every(x=>x.belief===null));assert(p.initialObservations.every(x=>x.freeTextLanguage==='ja'&&x.freeText.includes('</script>')));
 const switched=C.envelope({...data,language:'en'},answers,now);assert(switched.initialObservations.every(x=>x.responseLanguage===lang));
 const md=C.markdown(p,data.ui),fence=md.match(/\n(`+)json\n/)[1];assert(fence.length>3);assert.deepEqual(JSON.parse(md.split(fence+'json\n')[1].split('\n'+fence)[0]),p);
 for(const n of [0,1,101]){const later=structuredClone(p);later.relationshipData.items=Array.from({length:n},(_,i)=>({...p.relationshipData.items[0],id:'later:'+i}));validate(later,schema);}
 const before=JSON.stringify(answers);assert.throws(()=>C.applyBatch(answers,[{questionId:ids[0],optionIndex:2},{questionId:'bad',optionIndex:2}],ids,lang,now));assert.equal(JSON.stringify(answers),before);
 assert.throws(()=>C.applyBatch(answers,[{questionId:ids[0],optionIndex:0,responseStatus:'declined'}],ids,lang,now));
 assert.throws(()=>C.applyBatch(answers,[{questionId:ids[0],freeText:'x'.repeat(501)}],ids,lang,now));
 const cleared=C.applyBatch(answers,[{questionId:ids[0],responseStatus:'unanswered'}],ids,lang,now);assert.equal(C.status(cleared[ids[0]]),'unanswered');assert.throws(()=>C.envelope(data,cleared,now));checks++;
}
assert.equal(C.status({freeText:'   '}),'unanswered');assert.equal(C.status({optionIndex:99}),'unanswered');assert.equal(C.status({responseStatus:'declined'}),'declined');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const files=walk(path.join(root,'dist'));let links=0;
for(const file of files.filter(f=>f.endsWith('.html'))){const html=fs.readFileSync(file,'utf8');for(const m of html.matchAll(/(?:href|src)="(\/[^"#]*)/g)){let target=path.join(root,'dist',m[1]);if(target.endsWith('/'))target+='index.html';assert(fs.existsSync(target),file+' broken '+m[1]);links++;}}
const sitemap=fs.readFileSync(path.join(root,'dist/sitemap.xml'),'utf8');assert.equal([...sitemap.matchAll(/<loc>/g)].length,C.LANGS.length*6);
for(const l of C.LANGS)for(const suffix of ['', 'about/','guide/','privacy/','terms/','questions/'])assert(sitemap.includes('https://preferencecompass.info/'+l+'/'+suffix+'</loc>'));
assert(!fs.readFileSync(path.join(root,'dist/robots.txt'),'utf8').includes('Disallow:'));
console.log(`PASS: ${checks} complete multilingual export/state suites; variable-length updates; schema constraints; ${links} local links; ${C.LANGS.length*6} sitemap pages.`);
// Exercise startup, review and download handlers with a minimal DOM, without a browser.
const {default:vm}=await import('node:vm');
for(const lang of C.LANGS){
 const elements=new Map(),registered={},downloads=[];
 const element=id=>{if(!elements.has(id))elements.set(id,{value:'',style:{},dataset:{},classList:{add(){},remove(){}},handlers:{},setAttribute(){},querySelectorAll(){return [];},addEventListener(n,f){this.handlers[n]=f;},focus(){},showModal(){this.open=true;},appendChild(){},remove(){},click(){downloads.push(this.download);}});return elements.get(id);};
 const context={window:{PC_DATA:{language:lang,ui:read('src/locales/'+lang+'.ui.json'),docs:read('src/locales/'+lang+'.docs.json'),schema,protocol:read('src/protocol.json'),termsEnglish:'test'},PCCore:C,PC_QUESTIONS:bank,addEventListener(){},scrollTo(){}},document:{getElementById:element,querySelectorAll(){return [];},addEventListener(){},createElement(){return element('download');},body:element('body'),modelContext:{registerTool(t){registered[t.name]=t;}}},localStorage:{getItem(){return null;},setItem(){},removeItem(){}},location:{hash:''},history:{replaceState(){}},navigator:{},AbortController,Blob,URL:{createObjectURL(){return 'blob:test';},revokeObjectURL(){}},setTimeout(){},clearTimeout(){}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'src/app.js'),'utf8'),context);
 assert.equal(element('appError').hidden,true);assert.equal(element('progressCount').textContent,'0 / 100');
 assert.throws(()=>registered.download_preference_profile.execute({format:'json'}));
 registered.set_preference_answers.execute({answers:ids.map(questionId=>({questionId,responseStatus:'unknown'}))});
 registered.show_profile_review.execute();assert.equal(element('downloadJson').disabled,false);
 registered.download_preference_profile.execute({format:'json'});registered.download_preference_profile.execute({format:'markdown'});assert.equal(downloads.length,2);
 element('confirmReset').handlers.click();assert.equal(element('progressCount').textContent,'0 / 100');
}
console.log('PASS: all language application startups, full response updates, review, download handlers and reset (minimal DOM).');
