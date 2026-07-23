'use client';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { AdminShell } from '../../../../../components/admin-shell';
import { api } from '../../../../../lib/api';

type Project={id:string;key:string;name:string;description?:string;status:string;health:string;progress:string};
type Result=Record<string,any> & {generationId?:string};
const pretty=(v:any)=>typeof v==='string'?v:JSON.stringify(v,null,2);
export default function ProjectAssistant({params}:{params:Promise<{id:string}>}){
 const {id}=use(params); const [project,setProject]=useState<Project|null>(null),[result,setResult]=useState<Result|null>(null),[busy,setBusy]=useState(''),[error,setError]=useState(''),[context,setContext]=useState(''),[detail,setDetail]=useState('standard');
 useEffect(()=>{api<Project>(`/execution/projects/${id}`).then(setProject).catch(e=>setError(e.message))},[id]);
 async function run(kind:string){setBusy(kind);setError('');setResult(null);try{let path='',body:any={projectId:id};if(kind==='plan'){path='/ai/projects/plan';body={...body,planningContext:context,workstreamCount:4,includeTasks:true}}if(kind==='risk')path='/ai/projects/risks/analyze';if(kind==='summary'){path='/ai/projects/health-summary';body={...body,detail,audience:'project steering committee'}}const r=await api<Result>(path,{method:'POST',body:JSON.stringify(body)});setResult(r)}catch(e){setError(e instanceof Error?e.message:'AI request failed')}finally{setBusy('')}}
 if(!project)return <AdminShell title="AI Project Assistant" subtitle="Loading project context…">{error?<div className="formError">{error}</div>:<section className="panel">Loading…</section>}</AdminShell>;
 return <AdminShell title={`AI Assistant · ${project.key}`} subtitle={`Evidence-grounded planning and delivery support for ${project.name}`} action={<div className="actionGroup"><Link className="buttonLink secondary" href={`/execution/projects/${id}`}>Back to project</Link></div>}>
  {error&&<div className="formError">{error}</div>}
  <section className="projectHero panel"><div><div className="projectBadges"><i className="status">{project.status.replaceAll('_',' ')}</i><i className="status">{project.health.replaceAll('_',' ')}</i></div><h2>{project.name}</h2><p>{project.description||'No project description supplied.'}</p></div><div className="projectScore"><strong>{Math.round(Number(project.progress))}%</strong><span>delivery progress</span></div></section>
  <section className="three-column aiProjectActions">
   <article className="panel"><h2>Generate delivery plan</h2><p>Create workstreams, milestones, tasks, dependencies, risks, and a first-30-days plan.</p><textarea rows={5} placeholder="Optional planning assumptions, constraints, or delivery context" value={context} onChange={e=>setContext(e.target.value)}/><button disabled={!!busy} onClick={()=>run('plan')}>{busy==='plan'?'Generating…':'Generate plan'}</button></article>
   <article className="panel"><h2>Analyze delivery risk</h2><p>Evaluate schedule, budget, overdue work, open risks, critical issues, and blocked dependencies.</p><button disabled={!!busy} onClick={()=>run('risk')}>{busy==='risk'?'Analyzing…':'Analyze risk'}</button></article>
   <article className="panel"><h2>Draft health summary</h2><p>Prepare an evidence-grounded update for a steering committee or sponsor.</p><select value={detail} onChange={e=>setDetail(e.target.value)}><option value="brief">Brief</option><option value="standard">Standard</option><option value="detailed">Detailed</option></select><button disabled={!!busy} onClick={()=>run('summary')}>{busy==='summary'?'Drafting…':'Draft summary'}</button></article>
  </section>
  <section className="panel"><div className="panelHead"><div><h2>Assistant output</h2><p>Review and validate recommendations before applying them to the project.</p></div>{result?.generationId&&<small>Generation {result.generationId.slice(0,8)}</small>}</div>{!result?<div className="emptyState">Choose an AI capability above.</div>:<div className="aiResult">{Object.entries(result).filter(([k])=>!['generationId','project','developmentMode'].includes(k)).map(([k,v])=><article key={k}><h3>{k.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase())}</h3>{Array.isArray(v)?<div className="resultList">{v.map((x,i)=><div className="workItem" key={i}><pre>{pretty(x)}</pre></div>)}</div>:typeof v==='object'?<pre>{pretty(v)}</pre>:<p>{pretty(v)}</p>}</article>)}</div>}</section>
 </AdminShell>
}
