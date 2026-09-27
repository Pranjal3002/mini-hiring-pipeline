from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.lib.utils import simpleSplit

OUT='Mini_Hiring_Pipeline_Architecture.pdf'
W,H=letter
GREEN=colors.HexColor('#567b59'); DARK=colors.HexColor('#262923'); MUTED=colors.HexColor('#73776f'); PALE=colors.HexColor('#f3f6f1'); LINE=colors.HexColor('#e4e8e1'); BLUE=colors.HexColor('#718bb4')
c=canvas.Canvas(OUT,pagesize=letter)
c.setTitle('Mini Hiring Pipeline - Architecture and Design')

def header(page,title,subtitle):
 c.setFillColor(GREEN); c.rect(0,H-9,W,9,fill=1,stroke=0)
 c.setFillColor(MUTED); c.setFont('Helvetica-Bold',8); c.drawString(48,H-39,'MINI HIRING PIPELINE  /  DESIGN NOTES')
 c.setFillColor(DARK); c.setFont('Helvetica-Bold',22); c.drawString(48,H-77,title)
 c.setFillColor(MUTED); c.setFont('Helvetica',10); c.drawString(48,H-97,subtitle)
 c.setStrokeColor(LINE);c.line(48,H-111,W-48,H-111)
 c.setFillColor(MUTED);c.setFont('Helvetica',8);c.drawString(48,25,'Local-first recruiting workflow · UTC timestamps · SQLite')
 c.drawRightString(W-48,25,f'{page} / 6')
def para(text,x,y,width,size=10,leading=15,color=DARK,font='Helvetica'):
 c.setFillColor(color);c.setFont(font,size)
 lines=simpleSplit(text,font,size,width)
 for line in lines:c.drawString(x,y,line);y-=leading
 return y
def section(title,x,y):
 c.setFillColor(GREEN);c.setFont('Helvetica-Bold',12);c.drawString(x,y,title);return y-22
def box(x,y,w,h,title,body,fill=colors.white):
 c.setFillColor(fill);c.setStrokeColor(LINE);c.roundRect(x,y,w,h,8,fill=1,stroke=1)
 c.setFillColor(DARK);c.setFont('Helvetica-Bold',10);c.drawCentredString(x+w/2,y+h-21,title)
 for i,line in enumerate(body):c.setFillColor(MUTED);c.setFont('Helvetica',8);c.drawCentredString(x+w/2,y+h-39-i*12,line)
def arrow(x1,y1,x2,y2):
 c.setStrokeColor(GREEN);c.setFillColor(GREEN);c.setLineWidth(1.4);c.line(x1,y1,x2,y2)
 import math
 a=math.atan2(y2-y1,x2-x1);q=6
 p=c.beginPath();p.moveTo(x2,y2);p.lineTo(x2-q*math.cos(a-.5),y2-q*math.sin(a-.5));p.lineTo(x2-q*math.cos(a+.5),y2-q*math.sin(a+.5));p.close();c.drawPath(p,fill=1,stroke=0)

header(1,'A dependable hiring pipeline','Architecture and design summary · Associate Gen AI Engineer assessment')
y=H-155;y=section('Problem',48,y);y=para('A recruiter needs one clear view of candidates for a role, safe stage progression, a reviewable decision history, and a practical way to find people using plain-language questions.',48,y,510,11,17)
y-=22;y=section('Solution',48,y);y=para('A single Next.js application backed by local SQLite. The board reads the current candidate projection; candidate changes append an immutable event; a constrained search parser maps supported phrases to safe, deterministic filters.',48,y,510,11,17)
y-=22;y=section('Key requirements',48,y)
for t in ['Five ordered stages plus rejection before hire','Server side transition validation: one step forward only','Append only UTC audit events, protected by SQLite triggers','Fuzzy candidate name lookup and stage, time, history, and exclusion filters','No paid service, external model, API key, or cloud dependency']:
 c.setFillColor(GREEN);c.circle(54,y+3,2,fill=1,stroke=0);y=para(t,65,y,490,10,15)-4
c.showPage()

header(2,'Application architecture','A thin web layer delegates business rules and persistence to local modules.')
box(215,570,180,60,'Recruiter','Browser · React board',PALE)
box(215,470,180,60,'Next.js application','UI · validated route handlers')
box(65,350,195,75,'Candidate service','Create · transition · history')
box(350,350,195,75,'Search engine','Parser · validation · ranking')
box(350,245,195,60,'Intent parser','Constrained phrase recognition',PALE)
box(350,160,195,60,'Query validation','Structured filters · safe values',PALE)
box(215,70,180,60,'SQLite database','Candidates + append only events')
arrow(305,570,305,530);arrow(260,470,165,425);arrow(350,470,445,425);arrow(447,350,447,305);arrow(447,245,447,220);arrow(350,350,330,130);arrow(165,350,260,130);arrow(305,70,305,49)
c.setFillColor(MUTED);c.setFont('Helvetica-Oblique',8);c.drawString(48,135,'All state changes are validated on the server. Query text is never compiled into SQL.')
c.showPage()

header(3,'Data model and audit trail','Current state is convenient to read; events retain the full history.')
box(65,440,220,160,'candidates',['id · integer primary key','name · required, bounded','email · unique, validated','stage · constrained enum','createdAt · UTC ISO timestamp','updatedAt · current-stage entry time'],PALE)
box(325,440,220,160,'stage_events',['id · integer primary key','candidateId · foreign key','fromStage · nullable on creation','toStage · valid stage','eventType · CREATED / MOVED / REJECTED','createdAt · UTC ISO timestamp'],colors.white)
arrow(285,515,325,515)
y=section('Atomic writes',48,395);y=para('Candidate creation inserts the initial APPLIED event in the same transaction. A stage change updates the candidate projection and appends its event in one transaction. A failure cannot leave half of a transition recorded.',48,y,510,10,15)
y-=18;y=section('Immutability',48,y);y=para('SQLite triggers reject UPDATE and DELETE against stage_events, including accidental future code paths. Foreign keys are enabled. History is read in timestamp and event-id order; the current-stage duration is calculated from updatedAt.',48,y,510,10,15)
y-=18;y=section('Indexes',48,y);para('Candidate stage and name; event candidate ID, target stage, and timestamp. This keeps common board and history lookups small and direct.',48,y,510,10,15)
c.showPage()

header(4,'Natural language search','A bounded grammar turns supported phrases into explainable local queries.')
steps=[('Natural language','“Who moved to Interview since Monday?”'),('Normalize','Case · whitespace · punctuation'),('Parse intent','Target stage · transition · date boundary'),('Validate query','Supported fields and bounded values'),('Deterministic execution','Prepared SQLite queries + event history'),('Rank and explain','Name similarity · condition match · reason')]
yy=H-155
for i,(title,body) in enumerate(steps):
 box(88,yy-48,436,54,title,[body],PALE if i%2==0 else colors.white)
 if i<len(steps)-1:arrow(306,yy-49,306,yy-65)
 yy-=77
c.setFillColor(MUTED);c.setFont('Helvetica',9);c.drawString(48,67,'Name ranking: exact full name → exact token → substring/email → local Levenshtein typo match.')
c.showPage()

header(5,'Rules, security, and design judgment','Reliability comes from small, explicit rules with testable boundaries.')
y=H-145;y=section('Stage transitions',48,y)
for t in ['Applied → Screening → Interview → Offer → Hired','Rejection is allowed from Applied, Screening, Interview, or Offer.','Hired and Rejected are final outcomes. Skips and reversals are rejected server side.']:
 y=para('•  '+t,55,y,500,10,15)-3
y-=12;y=section('Security and tests',48,y)
y=para('Zod validates request input. Prepared statements bind all values. No query string becomes SQL. Browser-facing errors stay concise. Unit and query tests cover progression, final outcomes, fuzzy names, stage filters, exclusions, offer history, and unsupported requests.',48,y,510,10,15)
y-=20;y=section('AI-assisted design decision',48,y)
para('AI coding assistance was used during implementation. An AI-assisted design discussion suggested an LLM-first approach that would translate recruiter questions directly into SQL. I chose a constrained parser and validated execution for the critical path because dates, stage rules, duration, exclusions, and audit queries should stay deterministic and testable. No LLM runs in the application.',48,y,510,10,15)
c.showPage()

header(6,'Trade-offs and next steps','Built for an understandable local demo; scope is intentionally focused.')
y=H-150;y=section('Future improvements',48,y)
for t in ['Browser-level accessibility and end-to-end tests','More date phrase coverage and explicit parsed-filter previews','Schema migrations and safe multi-user concurrency','Optional intent normalization behind a strict validated schema']:
 y=para('•  '+t,55,y,500,10,15)-4
y-=17;y=section('Limitations',48,y)
y=para('Single-role, single-user local SQLite demo. No authentication, hosted synchronization, document storage, integrations, or runtime generative AI. Search understands a documented English subset; Monday boundaries use UTC.',48,y,510,10,15)
y-=22;y=section('Repository',48,y)
c.setFillColor(GREEN);c.setFont('Helvetica-Bold',11);c.drawString(48,y,'https://github.com/Pranjal3002/mini-hiring-pipeline')
c.linkURL('https://github.com/Pranjal3002/mini-hiring-pipeline',(48,y-3,480,y+14),relative=0)
c.setFillColor(MUTED);c.setFont('Helvetica',9);c.drawString(48,y-33,'Run locally: npm install · npm run db:seed · npm run dev')
c.save()
print(f'Wrote {OUT}')
