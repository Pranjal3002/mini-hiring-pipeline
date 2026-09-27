import {allCandidates,historyFor} from './db';
import {LABEL,type Candidate,type Stage} from './domain';

export type SearchResult={candidate:Candidate;reason:string;score:number};
export type SearchResponse={results:SearchResult[];message:string;understood:boolean};
const normalize=(s:string)=>s.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9@.\s]/g,' ').replace(/\s+/g,' ').trim();
function distance(a:string,b:string):number{const row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let prev=row[0];row[0]=i;for(let j=1;j<=b.length;j++){const old=row[j];row[j]=Math.min(row[j]+1,row[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));prev=old;}}return row[b.length];}
export function searchCandidates(raw:string):SearchResponse{
 const q=normalize(raw);
 if(!q)return{results:[],message:'Enter a name or ask about stage, duration, transition, or date.',understood:false};
 const stageWords:Record<string,Stage>={applied:'APPLIED',application:'APPLIED',screening:'SCREENING',interview:'INTERVIEW',offer:'OFFER',hired:'HIRED',rejected:'REJECTED'};
 const exclusion=/except|excluding|exclude|everyone/.test(q);
 const found=exclusion?undefined:Object.entries(stageWords).find(([word])=>new RegExp(`\\b${word}\\b`).test(q));
 const moving=/moved|entered|transition|reached/.test(q);
 const duration=/stuck|been in|more than|longer than/.test(q);
 const historicalOffer=/reached the offer/.test(q);
 const current=/right now|currently|\bin\s+|stuck/.test(q);
 const known=!!found||moving||duration||exclusion||historicalOffer||/since|after|before|today|yesterday|monday|week/.test(q)||/^(who|everyone|all|find|search|show|sharam)/.test(q);
 let since:Date|undefined;
 if(/since monday/.test(q)){const now=new Date();const delta=(now.getUTCDay()+6)%7;since=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()-delta));}
 const durationDays=/week/.test(q)?7:Number(q.match(/(\d+)\s+days?/)?.[1]??0)||undefined;
 const startsWithCommand=/^(find|search for|show)\s+/.test(q);
 const queryName=(startsWithCommand?q.replace(/^(find|search for|show)\s+/,''):q).replace(/\b(find|who|is|are|the|a|an|in|right|now|currently|everyone|except|excluding|exclude|rejected|candidates|candidate|has|been|stuck|for|more|than|week|moved|to|since|monday|reached|stage|but|didnt|didn|t|get|hired|applied|application|screening|interview|offer)\b/g,' ').trim();
 const candidates=allCandidates();const results:SearchResult[]=[];
 for(const candidate of candidates){
  const events=historyFor(candidate.id);const reasons:string[]=[];let score=0;
  if(found){
   if(current||duration||!moving){if(candidate.stage!==found[1])continue;reasons.push(`Currently in ${LABEL[candidate.stage]}`);score+=20;}
   else {if(!events.some(e=>e.toStage===found[1]&&(!since||new Date(e.createdAt)>=since)))continue;reasons.push(`Moved to ${LABEL[found[1]]}${since?' since Monday':''}`);score+=20;}
  }
  if(moving&&found&&!events.some(e=>e.toStage===found[1]&&(!since||new Date(e.createdAt)>=since)))continue;
  if(duration){if(!found||candidate.stage!==found[1])continue;const elapsed=(Date.now()-new Date(candidate.updatedAt).getTime())/86400000;if(durationDays!==undefined&&elapsed<=durationDays)continue;reasons.push(`In ${LABEL[candidate.stage]} for ${Math.floor(elapsed)} days`);score+=10;}
  if(exclusion&&candidate.stage==='REJECTED')continue;
  if(historicalOffer){if(!events.some(e=>e.toStage==='OFFER')||candidate.stage==='HIRED')continue;reasons.push('Reached Offer and is not Hired');score+=15;}
  if(since&&moving&&!found)continue;
  if(queryName.length>1){const name=normalize(candidate.name),tokens=name.split(' '),terms=queryName.split(' ').filter(t=>t.length>1);const exact=name===queryName;const token=terms.some(t=>tokens.includes(t));const fuzzy=terms.some(t=>tokens.some(x=>distance(t,x)<=Math.max(1,Math.floor(Math.min(t.length,x.length)*.34))));const substring=name.includes(queryName)||candidate.email.toLowerCase().includes(queryName);if(!exact&&!token&&!fuzzy&&!substring)continue;score+=exact?100:token?80:substring?70:45;reasons.push(exact?'Exact name match':fuzzy?'Fuzzy name match':token?'Name token match':'Name match');}
  if(!reasons.length){if(!known)continue;reasons.push(exclusion?'Not rejected':'Matches supported query');score+=1;}
  results.push({candidate,reason:reasons.join('; '),score});
 }
 results.sort((a,b)=>b.score-a.score||a.candidate.name.localeCompare(b.candidate.name));
 return{results,message:!known?'I could not interpret that request. Try a candidate name, stage, duration, transition, or exclusion.':results.length?'':'I understood the request, but no candidates match those conditions.',understood:known};
}
