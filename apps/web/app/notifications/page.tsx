'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminShell } from '../../components/admin-shell';
import { api } from '../../lib/api';

type NotificationItem = { id:string; type:string; title:string; body:string; actionUrl?:string; readAt?:string; createdAt:string };
type NotificationResponse = { items:NotificationItem[]; unreadCount:number };

export default function NotificationsPage(){
  const [data,setData]=useState<NotificationResponse>({items:[],unreadCount:0});
  const [error,setError]=useState('');
  const load=()=>api<NotificationResponse>('/notifications').then(setData).catch(e=>setError(e.message));
  useEffect(()=>{load()},[]);
  const markRead=async(id:string)=>{await api(`/notifications/${id}/read`,{method:'PATCH'});load()};
  const markAll=async()=>{await api('/notifications/read-all',{method:'POST'});load()};
  const archive=async(id:string)=>{await api(`/notifications/${id}`,{method:'DELETE'});load()};
  return <AdminShell title="Notification center" subtitle="Reminders, risk alerts, assignments, comments, and system activity." action={<button onClick={markAll}>Mark all read</button>}>
    <section className="panel notificationSummary"><strong>{data.unreadCount}</strong><span>Unread notifications</span><Link href="/settings/notifications">Manage preferences</Link></section>
    {error&&<p className="formError">{error}</p>}
    <section className="panel notificationList">{data.items.length===0?<div className="emptyState"><h2>You are all caught up</h2><p>No notifications need your attention.</p></div>:data.items.map(item=><article className={`notificationItem ${item.readAt?'':'unread'}`} key={item.id}>
      <i className={item.type.toLowerCase()}>{item.type==='WARNING'?'!':item.type==='ACTION_REQUIRED'?'→':'✓'}</i>
      <div>{item.actionUrl?<Link href={item.actionUrl} onClick={()=>markRead(item.id)}><strong>{item.title}</strong></Link>:<strong>{item.title}</strong>}<p>{item.body}</p><small>{new Date(item.createdAt).toLocaleString()}</small></div>
      <div className="notificationActions">{!item.readAt&&<button className="secondary" onClick={()=>markRead(item.id)}>Read</button>}<button className="secondary" onClick={()=>archive(item.id)}>Archive</button></div>
    </article>)}</section>
  </AdminShell>
}
