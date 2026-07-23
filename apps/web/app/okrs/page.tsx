'use client';
import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { AdminShell } from '../../components/admin-shell';
import { api } from '../../lib/api';
type Cycle={id:string;name:string;status:string;isDefault:boolean};
type User={id:string;firstName:string;lastName:string};
type Objective={id:string;title:string;scope:string;status:string;progress:number;owner:User;cycle:Cycle;keyResults:{id:string;title:string;progress:number;status:string}[]};
export default function OkrsPage(){
 const [cycles,setCycles]=useState<Cycle[]>([]),[users,setUsers]=useState<User[]>([]),[items,setItems]=useState<Objective[]>([]),[error,setError]=useState(''),[open,setOpen]=useState(false);
 const [form,setForm]=useState({title:'',cycleId:'',scope:'COMPANY',ownerId:'',description:''});
 async function load(){try{const [c,u,o]=await Promise.all([api<Cycle[]>('/okrs/cycles'),api<User[]>('/users'),api<Objective[]>('/okrs/objectives')]);setCycles(c);setUsers(u);setItems(o);setForm(f=>({...f,cycleId:f.cycleId||c.find(x=>x.isDefault)?.id||c[0]?.id||'',ownerId:f.ownerId||u[0]?.id||''}));}catch(e){setError((e as Error).message)}}
 useEffect(()=>{load()},[]);
 async function submit(e:FormEvent){e.preventDefault();try{await api('/okrs/objectives',{method:'POST',body:JSON.stringify({...form,status:'ACTIVE'})});setOpen(false);setForm(f=>({...f,title:'',description:''}));await load()}catch(e){setError((e as Error).message)}}
 return <AdminShell title="OKRs" subtitle="Align strategy, outcomes, and weekly execution." action={<button onClick={()=>setOpen(!open)}>+ Create objective</button>}>
  {error&&<p className="formError">{error}</p>}
  {open&&<form className="panel okrForm" onSubmit={submit}><div className="formGrid"><label>Objective<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/></label><label>Cycle<select value={form.cycleId} onChange={e=>setForm({...form,cycleId:e.target.value})}>{cycles.map(x=><option value={x.id} key={x.id}>{x.name}</option>)}</select></label><label>Scope<select value={form.scope} onChange={e=>setForm({...form,scope:e.target.value})}>{['COMPANY','DEPARTMENT','TEAM','INDIVIDUAL'].map(x=><option key={x}>{x}</option>)}</select></label><label>Owner<select value={form.ownerId} onChange={e=>setForm({...form,ownerId:e.target.value})}>{users.map(x=><option value={x.id} key={x.id}>{x.firstName} {x.lastName}</option>)}</select></label></div><label>Description<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><div className="formActions"><button>Create objective</button><button type="button" className="secondary" onClick={()=>setOpen(false)}>Cancel</button></div></form>}
  <div className="okrToolbar"><div className="chips">{cycles.map(x=><span key={x.id}>{x.name}{x.isDefault?' · Default':''}</span>)}</div><Link href="/cycles">Manage cycles</Link></div>
  <div className="okrList">{items.length===0?<article className="panel emptyState"><h2>No objectives yet</h2><p>Create a cycle and your first measurable objective.</p></article>:items.map(o=><Link className="panel okrCard" href={`/okrs/${o.id}`} key={o.id}><div className="okrCardTop"><div><span className={`status ${o.status.toLowerCase()}`}>{o.status.replace('_',' ')}</span><h2>{o.title}</h2><p>{o.scope} · {o.owner.firstName} {o.owner.lastName} · {o.cycle.name}</p></div><strong>{Math.round(o.progress)}%</strong></div><div className="bar"><i style={{width:`${o.progress}%`}}/></div><div className="krPreview">{o.keyResults.slice(0,3).map(k=><div key={k.id}><span>{k.title}</span><b>{Math.round(k.progress)}%</b></div>)}{!o.keyResults.length&&<small>No key results added</small>}</div></Link>)}</div>
 </AdminShell>
}
