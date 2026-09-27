import {NextResponse} from 'next/server';
import {z} from 'zod';
import {searchCandidates} from '@/lib/search';
export const runtime='nodejs';
export async function GET(req:Request){const q=z.string().max(200).safeParse(new URL(req.url).searchParams.get('q')??'');if(!q.success)return NextResponse.json({error:'Search is limited to 200 characters.'},{status:400});return NextResponse.json(searchCandidates(q.data));}
