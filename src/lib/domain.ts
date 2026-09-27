export const STAGES = ['APPLIED','SCREENING','INTERVIEW','OFFER','HIRED','REJECTED'] as const;
export type Stage = typeof STAGES[number];
export const LABEL: Record<Stage,string> = {APPLIED:'Applied',SCREENING:'Screening',INTERVIEW:'Interview',OFFER:'Offer',HIRED:'Hired',REJECTED:'Rejected'};
export const PIPELINE: Stage[] = ['APPLIED','SCREENING','INTERVIEW','OFFER','HIRED'];
export function nextStage(current: Stage, target: Stage): void {
 if (current==='HIRED') throw new Error('Hired candidates have reached a final stage.');
 if (current==='REJECTED') throw new Error('Rejected candidates cannot be moved to another stage.');
 if (target==='REJECTED') return;
 if (PIPELINE.indexOf(target)!==PIPELINE.indexOf(current)+1) throw new Error(`Cannot move from ${LABEL[current]} directly to ${LABEL[target]}. Candidates must move one stage at a time.`);
}
export type Candidate = {id:number;name:string;email:string;stage:Stage;createdAt:string;updatedAt:string};
export type Event = {id:number;candidateId:number;fromStage:Stage|null;toStage:Stage;eventType:string;createdAt:string};
