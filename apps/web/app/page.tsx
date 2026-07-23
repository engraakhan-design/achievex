'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminShell } from '../components/admin-shell';
import { api } from '../lib/api';

type Executive = {
  cycle:{id:string;name:string};
  scorecard:{objectives:number;averageProgress:number;completionRate:number;atRisk:number;checkInsLast7Days:number;checkInCoverage:number};
  risks:Array<{id:string;title:string;progress:number;status:string;owner:string;area:string;reason:string}>;
  topObjectives:Array<{id:string;title:string;progress:number;status:string;owner:string}>;
};

export default function Home(){
  const [data,setData]=useState<Executive|null>(null); const [error,setError]=useState('');
  useEffect(()=>{api<Executive>('/analytics/executive').then(setData).catch(e=>setError(e.message))},[]);
  const metrics=data?[['Average progress',`${data.scorecard.averageProgress}%`],['Active objectives',String(data.scorecard.objectives)],['At risk',String(data.scorecard.atRisk)],['Check-in coverage',`${data.scorecard.checkInCoverage}%`]]:[];
  return <AdminShell title="Executive cockpit" subtitle={data?`${data.cycle.name} strategy health and execution signals`:'Organization strategy health and execution signals'} action={<Link className="buttonLink" href="/okrs">Open OKRs</Link>}>
    {error&&<div className="formError">{error}</div>}
    {!data&&!error&&<div className="panel emptyState">Loading executive insights…</div>}
    {data&&<>
      <div className="metrics">{metrics.map(([label,value])=><article key={label}><p>{label}</p><strong>{value}</strong><span>{label==='At risk'?'Requires attention':'Current cycle'}</span></article>)}</div>
      <div className="grid"><article className="panel"><div className="panelHead"><div><h2>Strategic objectives</h2><p>Highest-progress objectives in this cycle</p></div><Link href="/okrs">View all</Link></div>{data.topObjectives.map(o=><Link className="objective objectiveLink" href={`/okrs/${o.id}`} key={o.id}><div><strong>{o.title}</strong><small>{o.owner} · {o.status.replace('_',' ')}</small></div><div className="bar"><i style={{width:`${o.progress}%`}} /></div><b>{Math.round(o.progress)}%</b></Link>)}</article>
      <article className="panel"><div className="panelHead"><div><h2>Check-in health</h2><p>Weekly participation across key results</p></div></div><div className="donut"><div style={{background:`conic-gradient(#6d5dfc 0 ${data.scorecard.checkInCoverage}%,#eceefa ${data.scorecard.checkInCoverage}%)`}}><strong>{data.scorecard.checkInCoverage}%</strong><span>covered</span></div></div><div className="legend"><span>{data.scorecard.checkInsLast7Days} updates</span><span>{data.scorecard.completionRate}% completed</span></div></article></div>
      <article className="panel"><div className="panelHead"><div><h2>Priority risks</h2><p>Objectives requiring executive attention</p></div><Link href="/reports">Open reports</Link></div>{data.risks.length===0?<p className="muted">No material risks detected.</p>:data.risks.map(r=><Link className="riskRow" href={`/okrs/${r.id}`} key={r.id}><div><strong>{r.title}</strong><small>{r.area} · {r.owner}</small></div><span>{r.reason}</span><b>{Math.round(r.progress)}%</b></Link>)}</article>
    </>}
  </AdminShell>
}
