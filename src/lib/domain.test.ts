import {describe,it,expect} from 'vitest';
import {nextStage} from './domain';
describe('server stage rules',()=>{
 it('allows exactly one forward step',()=>{expect(()=>nextStage('APPLIED','SCREENING')).not.toThrow();expect(()=>nextStage('OFFER','HIRED')).not.toThrow();});
 it('blocks skipped and reversed outcomes',()=>{expect(()=>nextStage('APPLIED','INTERVIEW')).toThrow(/one stage at a time/);expect(()=>nextStage('HIRED','OFFER')).toThrow(/final stage/);expect(()=>nextStage('REJECTED','APPLIED')).toThrow(/cannot be moved/);});
 it('allows rejection before hire',()=>{expect(()=>nextStage('OFFER','REJECTED')).not.toThrow();expect(()=>nextStage('HIRED','REJECTED')).toThrow();});
});
