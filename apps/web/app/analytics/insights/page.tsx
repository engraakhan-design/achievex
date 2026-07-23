import { AdminShell } from '../../../components/admin-shell';
const capabilities=[
 ['Unified insight feed','Bring KPI anomalies, predictive signals and decision recommendations into one prioritized tenant-scoped stream.'],
 ['Priority scoring','Sort by severity, confidence, expected impact and recency while retaining source evidence.'],
 ['Acknowledgement trail','Record who acknowledged, reviewed, resolved or dismissed an insight and why.'],
 ['Subscriptions and digests','Save filters and delivery preferences for immediate, daily or weekly insight digests.'],
 ['Entity context','Connect insights to objectives, projects, portfolios, teams and other enterprise entities.'],
 ['Source traceability','Preserve links to metric snapshots, prediction results and decision recommendations.'],
];
export default function InsightsHubPage(){return <AdminShell title="Enterprise insights hub" subtitle="A governed, prioritized stream of signals, recommendations and executive attention items."><section className="grid">{capabilities.map(([name,description])=><article className="card" key={name}><p className="eyebrow">Insights capability</p><h2>{name}</h2><p>{description}</p></article>)}</section><section className="card"><h2>Attention workflow</h2><p>Insights move through new, acknowledged, in-review, resolved, dismissed and expired states. Status changes are append-only acknowledgement records, preserving human accountability.</p></section><section className="card"><h2>Governance boundary</h2><p>The hub summarizes evidence and attention needs. It does not manufacture KPI values, retrain prediction models, approve recommendations, or execute operational changes.</p></section></AdminShell>}
