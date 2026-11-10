import {getServerSession} from 'next-auth';
import {authOptions,isAdmin} from '../../../lib/auth';
import {neon} from '@neondatabase/serverless';
import {randomBytes,createHash} from 'node:crypto';
import * as XLSX from 'xlsx';
import {NextResponse} from 'next/server';
export const runtime='nodejs';
const hash=t=>createHash('sha256').update(t).digest('hex');
const fail=(error,status=400)=>NextResponse.json({error},{status,headers:{'Cache-Control':'no-store'}});
async function access(){return isAdmin(await getServerSession(authOptions))}
function sql(){if(!process.env.DATABASE_URL)throw Error('DATABASE_URL not configured');return neon(process.env.DATABASE_URL)}
export async function GET(){if(!await access())return fail('Acceso no autorizado',401);try{const db=sql();const rows=await db`SELECT i.id,i.label,i.group_number,count(g.id)::int AS seats,count(g.id) FILTER (WHERE g.attending=true)::int AS yes,count(g.id) FILTER (WHERE g.attending=false)::int AS no,count(g.id) FILTER (WHERE g.attending IS NULL)::int AS pending FROM invitations i LEFT JOIN guests g ON g.invitation_id=i.id GROUP BY i.id ORDER BY i.id`;return NextResponse.json({rows},{headers:{'Cache-Control':'no-store'}})}catch(e){console.error(e);return fail('No se pudo leer la base de datos',503)}}
export async function POST(req){if(!await access())return fail('Acceso no autorizado',401);try{
const form=await req.formData();const file=form.get('file');if(!file||typeof file==='string'||file.size>2000000)return fail('Selecciona un Excel de hasta 2 MB.');
const wb=XLSX.read(Buffer.from(await file.arrayBuffer()),{type:'buffer'});const rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:''});
if(rows.length<1||rows.length>200)return fail('El Excel debe contener entre 1 y 200 invitaciones.');
const normalized=rows.map((r,i)=>{const label=String(r.Nombre??r.nombre??'').trim();let seats=Number(r.cant??r.Cant??r.cantidad);if(label.toLocaleLowerCase('es').replace(/\s+/g,' ').trim()==='vanessa duran')seats=2;if(!label||!Number.isInteger(seats)||seats<1||seats>15)throw Error('Fila '+(i+2)+': nombre o cantidad inválida');return {label,seats}});
const db=sql();const existing=await db`SELECT count(*)::int AS n FROM invitations`;if(existing[0].n>0)return fail('Ya existen invitaciones. Se bloqueó la importación para evitar duplicados.',409);
const origin=new URL(req.url).origin;const created=[];
for(const item of normalized){const token=randomBytes(24).toString('hex');const invite=await db`INSERT INTO invitations (token_hash,label) VALUES (${hash(token)},${item.label}) RETURNING id`;const id=invite[0].id;for(let j=0;j<item.seats;j++){const name=j===0?item.label:(item.label.toLowerCase().includes('familia')?'Integrante '+(j+1):'Acompañante '+j);await db`INSERT INTO guests (invitation_id,name) VALUES (${id},${name})`;}created.push({name:item.label,seats:item.seats,link:origin+'/?invite='+token})}
return NextResponse.json({created,count:created.length,seats:created.reduce((a,x)=>a+x.seats,0)},{headers:{'Cache-Control':'no-store'}});
}catch(e){console.error('Admin import:',e);return fail(e.message?.startsWith('Fila ')?e.message:'Error al importar. Revisa el esquema SQL y la conexión.',503)}}
