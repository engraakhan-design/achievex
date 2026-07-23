'use client';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { api } from '../../lib/api';
export default function LoginPage() {
  const [error,setError]=useState(''); const [loading,setLoading]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setLoading(true);setError('');const fd=new FormData(e.currentTarget);try{const data=await api<{tokens:{accessToken:string;refreshToken:string}}>('/auth/login',{method:'POST',body:JSON.stringify(Object.fromEntries(fd))});localStorage.setItem('achievex_access_token',data.tokens.accessToken);localStorage.setItem('achievex_refresh_token',data.tokens.refreshToken);location.href='/';}catch(err){setError(err instanceof Error?err.message:'Login failed');}finally{setLoading(false)}}
  return <main className="authPage"><section className="authCard"><div className="authBrand"><span>A</span>AchieveX</div><p className="eyebrow">Welcome back</p><h1>Sign in to your workspace</h1><p className="authHint">Continue managing goals, teams, and execution.</p><form onSubmit={submit}><label>Workspace slug<input name="organizationSlug" required placeholder="acme" /></label><label>Work email<input name="email" type="email" required placeholder="you@company.com" /></label><label>Password<input name="password" type="password" required minLength={10} /></label>{error&&<div className="formError">{error}</div>}<button disabled={loading}>{loading?'Signing in…':'Sign in'}</button></form><p className="authFooter">New to AchieveX? <Link href="/register">Create a workspace</Link></p></section></main>
}
