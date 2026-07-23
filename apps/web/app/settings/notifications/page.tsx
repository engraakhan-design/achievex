'use client';
import { useEffect, useState } from 'react';
import { AdminShell } from '../../../components/admin-shell';
import { api } from '../../../lib/api';

type Preferences={inAppEnabled:boolean;emailEnabled:boolean;checkInReminders:boolean;riskAlerts:boolean;assignmentAlerts:boolean;commentAlerts:boolean;weeklyDigest:boolean;reminderDayOfWeek:number;reminderHour:number;digestDayOfWeek:number;digestHour:number};
const fields:[keyof Preferences,string,string][]=[['inAppEnabled','In-app notifications','Show notifications inside AchieveX'],['emailEnabled','Email notifications','Deliver important notifications by email'],['checkInReminders','Check-in reminders','Remind owners when key results are stale'],['riskAlerts','Risk alerts','Alert owners about at-risk and off-track objectives'],['assignmentAlerts','Assignment alerts','Notify users when OKRs are assigned'],['commentAlerts','Comment alerts','Notify owners about new discussions'],['weeklyDigest','Weekly executive digest','Receive a weekly strategy summary']];
export default function NotificationSettings(){
 const [prefs,setPrefs]=useState<Preferences|null>(null);const [notice,setNotice]=useState('');const [error,setError]=useState('');
 useEffect(()=>{api<Preferences>('/notifications/preferences/me').then(setPrefs).catch(e=>setError(e.message))},[]);
 const save=async()=>{if(!prefs)return;setNotice('');try{setPrefs(await api<Preferences>('/notifications/preferences/me',{method:'PATCH',body:JSON.stringify(prefs)}));setNotice('Preferences saved.')}catch(e){setError(e instanceof Error?e.message:'Unable to save')}};
 return <AdminShell title="Notification preferences" subtitle="Choose how and when AchieveX keeps you informed." action={<button onClick={save}>Save preferences</button>}>
  {error&&<p className="formError">{error}</p>}{notice&&<p className="formNotice">{notice}</p>}
  <section className="panel preferenceList">{prefs&&fields.map(([key,title,description])=><label className="preferenceRow" key={key}><div><strong>{title}</strong><p>{description}</p></div><input type="checkbox" checked={Boolean(prefs[key])} onChange={e=>setPrefs({...prefs,[key]:e.target.checked})}/></label>)}</section>
  {prefs&&<section className="panel scheduleGrid"><div><h2>Check-in reminder schedule</h2><label>Day of week<select value={prefs.reminderDayOfWeek} onChange={e=>setPrefs({...prefs,reminderDayOfWeek:Number(e.target.value)})}>{['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((x,i)=><option value={i} key={x}>{x}</option>)}</select></label><label>Hour<select value={prefs.reminderHour} onChange={e=>setPrefs({...prefs,reminderHour:Number(e.target.value)})}>{Array.from({length:24},(_,i)=><option key={i} value={i}>{String(i).padStart(2,'0')}:00</option>)}</select></label></div><div><h2>Weekly digest schedule</h2><label>Day of week<select value={prefs.digestDayOfWeek} onChange={e=>setPrefs({...prefs,digestDayOfWeek:Number(e.target.value)})}>{['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((x,i)=><option value={i} key={x}>{x}</option>)}</select></label><label>Hour<select value={prefs.digestHour} onChange={e=>setPrefs({...prefs,digestHour:Number(e.target.value)})}>{Array.from({length:24},(_,i)=><option key={i} value={i}>{String(i).padStart(2,'0')}:00</option>)}</select></label></div></section>}
 </AdminShell>
}
