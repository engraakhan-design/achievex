'use client';
import { useEffect, useState } from 'react';
import { AdminShell } from '../../components/admin-shell';
import { api } from '../../lib/api';
type Conversation={id:string;title?:string;domain:string;messages?:Message[]}; type Message={id:string;role:string;content:string;citations?:Array<{type:string;id:string;label:string}>};
export default function CopilotPage(){
 const [items,setItems]=useState<Conversation[]>([]),[active,setActive]=useState<Conversation|null>(null),[domain,setDomain]=useState('okr'),[input,setInput]=useState('Summarize the most important issues and recommend next steps.'),[loading,setLoading]=useState(false),[error,setError]=useState('');
 const refresh=()=>api<Conversation[]>('/copilot/conversations').then(setItems).catch(e=>setError(e.message)); useEffect(()=>{void refresh()},[]);
 const open=async(id:string)=>{try{setActive(await api<Conversation>(`/copilot/conversations/${id}`))}catch(e:any){setError(e.message)}};
 const create=async()=>{setError('');try{const c=await api<Conversation>('/copilot/conversations',{method:'POST',body:JSON.stringify({domain,title:`${domain.toUpperCase()} copilot`})});setItems([c,...items]);setActive({...c,messages:[]})}catch(e:any){setError(e.message)}};
 const send=async()=>{if(!active||!input.trim())return;setLoading(true);setError('');try{await api(`/copilot/conversations/${active.id}/messages`,{method:'POST',body:JSON.stringify({content:input})});await open(active.id);setInput('')}catch(e:any){setError(e.message)}finally{setLoading(false)}};
 return <AdminShell title="Enterprise AI Copilot" subtitle="Grounded, tenant-aware assistance for OKRs, projects, governance, analytics, and daily execution">
  <div className="enterpriseTabs"><select value={domain} onChange={e=>setDomain(e.target.value)}><option value="okr">OKRs</option><option value="project">Projects</option><option value="governance">Governance</option><option value="analytics">Analytics</option><option value="general">General</option></select><button onClick={create}>New conversation</button></div>
  {error&&<div className="formError">{error}</div>}
  <div className="aiGrid"><article className="panel"><div className="panelHead"><div><h2>Conversations</h2><p>Each conversation is isolated to your organization and user account.</p></div></div>{items.length?items.map(c=><button className="secondary" key={c.id} onClick={()=>open(c.id)}>{c.title||c.domain}</button>):<div className="emptyState"><strong>No conversations</strong><p>Create one to start using the governed copilot.</p></div>}</article>
  <article className="panel aiResult"><div className="panelHead"><div><h2>{active?.title||'Copilot workspace'}</h2><p>Responses use the centralized AI gateway and include available record citations.</p></div></div>{active?.messages?.map(m=><div key={m.id} className="aiNotice"><strong>{m.role}</strong><p>{m.content}</p>{m.citations?.length?<small>Sources: {m.citations.map(x=>x.label).join(', ')}</small>:null}</div>)}{active?<div className="enterpriseForm"><textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask about current goals, projects, risks, or performance"/><button onClick={send} disabled={loading}>{loading?'Thinking…':'Send'}</button></div>:<div className="emptyState"><strong>Select a conversation</strong><p>Or create a new domain-specific workspace.</p></div>}</article></div>
 </AdminShell>;
}
