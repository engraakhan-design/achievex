'use client';
import { FormEvent, useEffect, useState } from 'react';
import { AdminShell } from '../../components/admin-shell';
import { api } from '../../lib/api';
type Definition={id:string;key:string;name:string;description?:string;status:string;currentVersion:number;updatedAt:string};
export default function WorkflowsPage(){
 const[rows,setRows]=useState<Definition[]>([]),[name,setName]=useState(''),[key,setKey]=useState(''),[error,setError]=useState('');
 const load=()=>api<Definition[]>('/workflow/definitions').then(setRows).catch(e=>setError(e.message));useEffect(()=>{void load()},[]);
 async function create(e:FormEvent){e.preventDefault();setError('');try{await api('/workflow/definitions',{method:'POST',body:JSON.stringify({name,key})});setName('');setKey('');load()}catch(e){setError(e instanceof Error?e.message:'Unable to create workflow')}}
 return <AdminShell title="Workflows" subtitle="Create, version, publish, and monitor enterprise workflows.">
  {error&&<div className="formError">{error}</div>}
  <section className="panel"><h2>Create workflow definition</h2><form onSubmit={create} className="inlineForm"><label>Key<input value={key} onChange={e=>setKey(e.target.value)} placeholder="project-approval" required/></label><label>Name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Project approval" required/></label><button>Create</button></form></section>
  <section className="panel"><div className="panelHead"><div><h2>Definitions</h2><p>Draft and published workflow definitions.</p></div></div><div className="executionTable"><div className="executionRow executionHead"><span>Name</span><span>Key</span><span>Status</span><span>Version</span><span>Updated</span></div>{rows.map(r=><div className="executionRow" key={r.id}><span><strong>{r.name}</strong><small>{r.description||'No description'}</small></span><span>{r.key}</span><span>{r.status}</span><span>v{r.currentVersion}</span><span>{new Date(r.updatedAt).toLocaleDateString()}</span></div>)}</div></section>
 </AdminShell>
}
