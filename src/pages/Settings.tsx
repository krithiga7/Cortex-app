import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Save } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const [name, setName] = useState("Chennai Relief Collective");
  const [email, setEmail] = useState("ops@chennairelief.org");
  const [highThreshold, setHighThreshold] = useState(80);
  const [autoDispatch, setAutoDispatch] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);

  return (
    <AppLayout title="Settings" subtitle="NGO profile · alert thresholds · notifications">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass-card p-6">
          <h3 className="font-display font-semibold mb-4">NGO Profile</h3>
          <div className="space-y-4">
            <Field label="Organization Name" value={name} onChange={setName} />
            <Field label="Operations Email" value={email} onChange={setEmail} />
            <Field label="Region" value="Chennai · Tamil Nadu" onChange={() => {}} />
          </div>
        </section>

        <section className="glass-card p-6">
          <h3 className="font-display font-semibold mb-4">Alert Thresholds</h3>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-foreground">High-priority score cutoff</label>
                <span className="font-mono text-accent">{highThreshold}</span>
              </div>
              <input
                type="range"
                min={50}
                max={100}
                value={highThreshold}
                onChange={(e) => setHighThreshold(+e.target.value)}
                className="w-full accent-[hsl(187_100%_50%)]"
              />
              <p className="text-xs text-muted-foreground mt-1">Requests scoring ≥ {highThreshold} trigger immediate dispatch.</p>
            </div>
            <Toggle label="Auto Smart Dispatch" desc="Engine assigns volunteers without confirmation" value={autoDispatch} onChange={setAutoDispatch} />
            <Toggle label="Push Alerts" desc="Notify operators of high-priority spikes" value={pushAlerts} onChange={setPushAlerts} />
          </div>
        </section>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => toast.success("Settings saved")}
          className="px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold flex items-center gap-2 hover:opacity-90 transition glow-accent"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>
    </AppLayout>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full px-3 py-2.5 rounded-lg border border-border bg-background/50 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
      />
    </div>
  );
}

function Toggle({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 p-3 rounded-xl border border-border bg-background/30">
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition-colors ${value ? "bg-accent" : "bg-secondary"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-all ${value ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}
