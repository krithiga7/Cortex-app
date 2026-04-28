import { AppLayout } from "@/components/layout/AppLayout";
import { useCortex } from "@/store/cortex";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { TrendingUp, MapPin, Clock, Users } from "lucide-react";

const requestsOverTime = [
  { hour: "6h", count: 8 },
  { hour: "9h", count: 14 },
  { hour: "12h", count: 22 },
  { hour: "15h", count: 31 },
  { hour: "18h", count: 48 },
  { hour: "21h", count: 36 },
  { hour: "0h", count: 18 },
];

const efficiency = [
  { name: "Arjun", value: 92 },
  { name: "Anitha", value: 95 },
  { name: "Lakshmi", value: 90 },
  { name: "Rahul", value: 88 },
  { name: "Meena", value: 85 },
  { name: "Priya", value: 79 },
];

export default function Analytics() {
  const { requests } = useCortex();

  const byType = ["Medical", "Food", "Shelter", "Water", "Clothes"].map((t) => ({
    name: t,
    value: requests.filter((r) => r.type === t).length,
  }));

  return (
    <AppLayout title="Analytics" subtitle="Strategic insights for NGO operations">
      <div className="grid gap-4 md:grid-cols-3">
        <Insight icon={<MapPin className="h-4 w-4" />} title="Top Demand Area" value="T Nagar" sub="High medical demand cluster" />
        <Insight icon={<Clock className="h-4 w-4" />} title="Peak Hours" value="6PM – 9PM" sub="Allocate 30% extra volunteers" />
        <Insight icon={<TrendingUp className="h-4 w-4" />} title="Predicted Spike" value="Saidapet · +45%" sub="Within next 2 hours" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-5">
          <h3 className="font-display font-semibold mb-1">Requests Over Time</h3>
          <p className="text-xs text-muted-foreground mb-4">Last 24 hours · live</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={requestsOverTime}>
              <defs>
                <linearGradient id="cyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(187 100% 50%)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(187 100% 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(218 35% 20%)" strokeDasharray="3 3" />
              <XAxis dataKey="hour" stroke="hsl(215 20% 65%)" fontSize={11} />
              <YAxis stroke="hsl(215 20% 65%)" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(218 45% 10%)", border: "1px solid hsl(218 35% 20%)", borderRadius: 12 }} />
              <Area type="monotone" dataKey="count" stroke="hsl(187 100% 50%)" strokeWidth={2} fill="url(#cyan)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-display font-semibold mb-1">Demand by Category</h3>
          <p className="text-xs text-muted-foreground mb-4">All open requests</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byType}>
              <CartesianGrid stroke="hsl(218 35% 20%)" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="hsl(215 20% 65%)" fontSize={11} />
              <YAxis stroke="hsl(215 20% 65%)" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(218 45% 10%)", border: "1px solid hsl(218 35% 20%)", borderRadius: 12 }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {byType.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "hsl(0 100% 65%)" : "hsl(187 100% 50%)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="font-display font-semibold mb-1 flex items-center gap-2">
            <Users className="h-4 w-4 text-accent" /> Volunteer Efficiency Score
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Composite of trust × response time × completion rate</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={efficiency} layout="vertical">
              <CartesianGrid stroke="hsl(218 35% 20%)" strokeDasharray="3 3" />
              <XAxis type="number" stroke="hsl(215 20% 65%)" fontSize={11} domain={[0, 100]} />
              <YAxis dataKey="name" type="category" stroke="hsl(215 20% 65%)" fontSize={11} width={70} />
              <Tooltip contentStyle={{ background: "hsl(218 45% 10%)", border: "1px solid hsl(218 35% 20%)", borderRadius: 12 }} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} fill="hsl(187 100% 50%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AppLayout>
  );
}

function Insight({ icon, title, value, sub }: { icon: React.ReactNode; title: string; value: string; sub: string }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-mono">
        {icon} {title}
      </div>
      <div className="mt-2 font-display text-2xl font-bold text-accent text-glow">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}
