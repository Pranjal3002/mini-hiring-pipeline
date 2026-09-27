import {NextResponse} from 'next/server';
import {z} from 'zod';
import {candidateById,historyFor,transition} from '@/lib/db';
import {STAGES} from '@/lib/domain';
export const runtime='nodejs';
export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;const parsed=z.coerce.number().int().positive().safeParse(id);if(!parsed.success)return NextResponse.json({error:'Invalid candidate.'},{status:400});const candidate=candidateById(parsed.data);return candidate?NextResponse.json({candidate,history:historyFor(candidate.id)}):NextResponse.json({error:'Candidate not found.'},{status:404});}
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){try{const {id}=await params;const parsed=z.object({stage:z.enum(STAGES)}).parse(await req.json());transition(z.coerce.number().int().positive().parse(id),parsed.stage);return NextResponse.json({ok:true});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Invalid stage change.'},{status:400});}}
