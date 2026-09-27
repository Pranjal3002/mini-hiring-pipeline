import {NextResponse} from 'next/server';
import {z} from 'zod';
import {allCandidates,createCandidate} from '@/lib/db';
export const runtime='nodejs';
export async function GET(){return NextResponse.json(allCandidates());}
export async function POST(req:Request){try{const body=z.object({name:z.string().trim().min(2).max(100),email:z.string().trim().email().max(254)}).parse(await req.json());return NextResponse.json({id:createCandidate(body.name,body.email)},{status:201});}catch(e){return NextResponse.json({error:e instanceof Error&&e.message.includes('UNIQUE')?'That email is already in use.':'Please provide a valid name and email.'},{status:400});}}
