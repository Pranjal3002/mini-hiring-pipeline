import {describe,it,expect} from 'vitest';
import {searchCandidates} from './search';
describe('recruiter query understanding',()=>{
 it('uses fuzzy matching for a misspelled name',()=>{const r=searchCandidates('sharam');expect(r.results[0]?.candidate.name).toBe('Priya Sharma');});
 it('filters current stage',()=>{const r=searchCandidates("Who's in Interview right now?");expect(r.understood).toBe(true);expect(r.results.length).toBeGreaterThan(0);expect(r.results.every(x=>x.candidate.stage==='INTERVIEW')).toBe(true);});
 it('filters historical Interview moves since Monday',()=>{const r=searchCandidates('Who moved to Interview since Monday?');expect(r.results.some(x=>x.candidate.name==='Maya Iyer')).toBe(true);expect(r.results.every(x=>x.reason.includes('Moved to Interview since Monday'))).toBe(true);});
 it('combines name and current-stage conditions',()=>{const r=searchCandidates('Find Priya Sharma in Screening');expect(r.results.map(x=>x.candidate.name)).toEqual(['Priya Sharma']);});
 it('filters current stage by duration',()=>{const r=searchCandidates('Who has been stuck in Screening for more than a week?');expect(r.results.some(x=>x.candidate.name==='Priya Sharma')).toBe(true);expect(r.results.every(x=>x.candidate.stage==='SCREENING')).toBe(true);});
 it('can exclude rejected candidates',()=>{const r=searchCandidates('Everyone except rejected candidates');expect(r.results.length).toBeGreaterThan(0);expect(r.results.every(x=>x.candidate.stage!=='REJECTED')).toBe(true);});
 it('explains an unsupported request',()=>{const r=searchCandidates('tell me a joke');expect(r.understood).toBe(false);expect(r.message).toMatch(/interpret that request/i);});
 it('finds candidates who reached offer and were not hired',()=>{const r=searchCandidates("Who reached the Offer stage but didn't get hired?");expect(r.results.some(x=>x.candidate.stage==='REJECTED')).toBe(true);});
});
