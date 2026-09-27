import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { nextStage, type Candidate, type Event, type Stage } from './domain';
const file = path.join(process.cwd(),'data','hiring.sqlite');
fs.mkdirSync(path.dirname(file),{recursive:true});
const db = new Database(file);
db.pragma('journal_mode = WAL'); db.pragma('foreign_keys = ON');
db.exec(`CREATE TABLE IF NOT EXISTS candidates(id INTEGER PRIMARY KEY,name TEXT NOT NULL CHECK(length(name) BETWEEN 2 AND 100),email TEXT NOT NULL UNIQUE CHECK(length(email)<=254),stage TEXT NOT NULL CHECK(stage IN ('APPLIED','SCREENING','INTERVIEW','OFFER','HIRED','REJECTED')),createdAt TEXT NOT NULL,updatedAt TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS stage_events(id INTEGER PRIMARY KEY,candidateId INTEGER NOT NULL REFERENCES candidates(id),fromStage TEXT,toStage TEXT NOT NULL,eventType TEXT NOT NULL,createdAt TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS candidates_stage_idx ON candidates(stage); CREATE INDEX IF NOT EXISTS candidates_name_idx ON candidates(name); CREATE INDEX IF NOT EXISTS events_candidate_idx ON stage_events(candidateId); CREATE INDEX IF NOT EXISTS events_time_idx ON stage_events(createdAt); CREATE INDEX IF NOT EXISTS events_target_idx ON stage_events(toStage);
CREATE TRIGGER IF NOT EXISTS events_no_update BEFORE UPDATE ON stage_events BEGIN SELECT RAISE(ABORT,'Stage events are immutable'); END;
CREATE TRIGGER IF NOT EXISTS events_no_delete BEFORE DELETE ON stage_events BEGIN SELECT RAISE(ABORT,'Stage events are immutable'); END;`);
export const allCandidates = () => db.prepare('SELECT * FROM candidates ORDER BY name').all() as Candidate[];
export const candidateById = (id:number) => db.prepare('SELECT * FROM candidates WHERE id=?').get(id) as Candidate|undefined;
export const historyFor = (id:number) => db.prepare('SELECT * FROM stage_events WHERE candidateId=? ORDER BY createdAt,id').all(id) as Event[];
export function createCandidate(name:string,email:string) { const now=new Date().toISOString(); const tx=db.transaction(()=>{const r=db.prepare("INSERT INTO candidates(name,email,stage,createdAt,updatedAt) VALUES(?,?,'APPLIED',?,?)").run(name,email,now,now); db.prepare("INSERT INTO stage_events(candidateId,fromStage,toStage,eventType,createdAt) VALUES(?,NULL,'APPLIED','CREATED',?)").run(r.lastInsertRowid,now); return Number(r.lastInsertRowid);}); return tx(); }
export function transition(id:number,target:Stage) { const c=candidateById(id); if(!c) throw new Error('Candidate not found.'); nextStage(c.stage,target); const now=new Date().toISOString(); const tx=db.transaction(()=>{db.prepare('UPDATE candidates SET stage=?,updatedAt=? WHERE id=? AND stage=?').run(target,now,id,c.stage); db.prepare('INSERT INTO stage_events(candidateId,fromStage,toStage,eventType,createdAt) VALUES(?,?,?,?,?)').run(id,c.stage,target,target==='REJECTED'?'REJECTED':'STAGE_MOVED',now);}); tx(); }
export default db;
