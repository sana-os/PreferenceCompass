(function(root) {
  'use strict';
  const LANGS=['en','es','ja','zh-hans','zh-hant','pt-br','fr'];
  const STATES=['answered','unknown','context_dependent','not_applicable','declined'];
  function status(a) {
    if(!a) return 'unanswered';
    if(STATES.includes(a.responseStatus)&&a.responseStatus!=='answered') return a.responseStatus;
    return Number.isInteger(a.optionIndex)&&a.optionIndex>=0&&a.optionIndex<4 || typeof a.freeText==='string'&&a.freeText.trim() ? 'answered':'unanswered';
  }
  function cleanAnswer(a) {
    if(!a||typeof a!=='object') return {};
    const r={};
    if(STATES.includes(a.responseStatus))r.responseStatus=a.responseStatus;
    if(Number.isInteger(a.optionIndex)&&a.optionIndex>=0&&a.optionIndex<4)r.optionIndex=a.optionIndex;
    if(r.responseStatus&&r.responseStatus!=='answered')delete r.optionIndex;
    if(typeof a.freeText==='string')r.freeText=a.freeText.slice(0,500);
    r.responseLanguage=LANGS.includes(a.responseLanguage)?a.responseLanguage:'und';
    r.freeTextLanguage=LANGS.includes(a.freeTextLanguage)?a.freeTextLanguage:'und';
    r.updatedAt=typeof a.updatedAt==='string'?a.updatedAt:null;
    return r;
  }
  function applyBatch(answers,batch,ids,language,now) {
    if(!Array.isArray(batch)||batch.length<1||batch.length>100)throw Error('Expected 1–100 responses');
    const seen=new Set();
    const prepared=batch.map(item=>{
      if(!item||typeof item!=='object'||Array.isArray(item))throw Error('Invalid response');
      if(Object.keys(item).some(k=>!['questionId','optionIndex','freeText','responseStatus','freeTextLanguage'].includes(k)))throw Error('Unknown response field');
      if(!ids.includes(item.questionId)||seen.has(item.questionId))throw Error('Unknown or duplicate question ID');
      seen.add(item.questionId);
      if(Object.keys(item).length<2)throw Error('No response provided');
      if(item.optionIndex!==undefined&&(!Number.isInteger(item.optionIndex)||item.optionIndex<0||item.optionIndex>3))throw Error('Invalid choice');
      if(item.freeText!==undefined&&(typeof item.freeText!=='string'||item.freeText.length>500))throw Error('Invalid note');
      if(item.responseStatus!==undefined&&!STATES.includes(item.responseStatus)&&item.responseStatus!=='unanswered')throw Error('Invalid response status');
      if(item.freeTextLanguage!==undefined&&!LANGS.includes(item.freeTextLanguage)&&item.freeTextLanguage!=='und')throw Error('Invalid note language');
      if(item.responseStatus&&item.responseStatus!=='answered'&&item.optionIndex!==undefined)throw Error('Choice conflicts with response status');
      if(item.responseStatus==='unanswered'){
        if(item.freeText!==undefined||item.freeTextLanguage!==undefined)throw Error('Unanswered cannot carry a note');
        return [item.questionId,{}];
      }
      const a=cleanAnswer(answers[item.questionId]);
      if(item.optionIndex!==undefined){a.optionIndex=item.optionIndex;a.responseStatus='answered';a.responseLanguage=language;}
      if(item.responseStatus!==undefined){a.responseStatus=item.responseStatus;a.responseLanguage=language;if(item.responseStatus!=='answered')delete a.optionIndex;}
      if(item.freeText!==undefined){a.freeText=item.freeText;if(!a.freeTextLanguage||a.freeTextLanguage==='und')a.freeTextLanguage=language;if(!a.responseLanguage||a.responseLanguage==='und')a.responseLanguage=language;}
      if(item.freeTextLanguage!==undefined)a.freeTextLanguage=item.freeTextLanguage;
      a.updatedAt=now;
      return [item.questionId,a];
    });
    const next={...answers};for(const [id,a]of prepared)next[id]=a;return next;
  }
  function envelope(data,answers,now) {
    const flat=data.categories.flatMap(c=>c.questions);
    if(flat.some(q=>status(answers[q.id])==='unanswered'))throw Error('Complete all questions before export');
    const canonical=data.canonical.flatMap(c=>c.questions);
    const initialObservations=flat.map((q,i)=>{
      const a=cleanAnswer(answers[q.id]),c=canonical[i];
      const sourceLang=LANGS.includes(a.responseLanguage)?a.responseLanguage:'en';
      const source=data.allQuestions[sourceLang][i];
      return {id:'observation:'+q.id,questionId:q.id,responseStatus:status(a),selectedOptionId:Number.isInteger(a.optionIndex)?c.options[a.optionIndex].id:null,
        questionCanonical:c.text,selectedOptionCanonical:Number.isInteger(a.optionIndex)?c.options[a.optionIndex].label:null,
        questionDisplayed:source.text,selectedOptionDisplayed:Number.isInteger(a.optionIndex)?source.options[a.optionIndex].label:null,
        responseLanguage:a.responseLanguage,freeText:a.freeText?.trim()?a.freeText:null,freeTextLanguage:a.freeText?.trim()?a.freeTextLanguage:'und',updatedAt:a.updatedAt};
    });
    return {format:'relationship-portability',formatVersion:'1.1.0',protocolVersion:'1.1.0',language:data.language,generatedAt:now,
      creator:{name:'Deshimaru Sakaguchi',website:'https://deshimarusakaguchi.com/',project:'https://preferencecompass.info/'},
      usageTerms:{version:'1.0.0',text:data.termsEnglish,url:'https://preferencecompass.info/en/terms/'},
      embeddedSchema:data.schema,protocol:data.protocol,
      localizedHandlingGuide:{language:data.language,sections:['guide','numerical'].map(k=>({title:data.docs[k][0],paragraphs:data.docs[k].slice(1)})),handoffPrompt:data.docs.handoff},
      questionnaire:{id:'preference-compass-100',version:'2.0.0',translationVersion:'1.0.0',completedAt:now,responded:flat.length,total:flat.length},
      initialObservations,
      relationshipData:{revision:'initial-'+now,parentRevision:null,retiredIds:[],items:initialObservations.map(o=>({
        id:'initial:'+o.questionId,kind:o.responseStatus==='declined'?'boundary':['unknown','context_dependent'].includes(o.responseStatus)?'open_question':'initial_observation',
        statement:JSON.stringify({question:o.questionCanonical,status:o.responseStatus,choice:o.selectedOptionCanonical,note:o.freeText,noteLanguage:o.freeTextLanguage}),language:'en',
        context:'Initial questionnaire '+o.questionId+'. Applicability outside this context is unconfirmed.',
        status:['unknown','context_dependent'].includes(o.responseStatus)?'unresolved':'active',provenance:'user_explicit',
        evidence:[{id:'evidence:'+o.questionId,source:o.id,summary:'Explicit questionnaire response; no relational agreement established.',observedAt:o.updatedAt}],
        uncertainty:'No subsequent dialogue or mutual confirmation recorded.',supersedes:[],belief:null
      }))}};
  }
  function markdown(profile,ui){
    const json=JSON.stringify(profile,null,2);
    const runs=json.match(/`+/g)||[];const fence='`'.repeat(Math.max(3,...runs.map(s=>s.length+1)));
    return '# '+ui.exportHeading+'\n\n'+ui.exportNote+'\n\nDeshimaru Sakaguchi — https://deshimarusakaguchi.com/\n\n'+fence+'json\n'+json+'\n'+fence+'\n';
  }
  const api={LANGS,STATES,status,cleanAnswer,applyBatch,envelope,markdown};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PCCore=api;
})(typeof window==='undefined'?globalThis:window);
