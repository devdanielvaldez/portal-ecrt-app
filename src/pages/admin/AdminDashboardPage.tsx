import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  Activity,
  Download,
  Filter,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Monitor,
  Loader2
} from 'lucide-react';
import { terminalService, Terminal } from '@/src/services/terminal.service';
import { transactionService, Transaction } from '@/src/services/transaction.service';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [termRes, transRes] = await Promise.all([
          terminalService.getAll(),
          transactionService.getAll()
        ]);
        if (termRes.success) setTerminals(termRes.data);
        if (transRes.success) setTransactions(transRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate KPIs
  const totalVolume = useMemo(() => transactions.reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const totalTransactions = useMemo(() => transactions.length, [transactions]);
  const activeTerminals = useMemo(() => terminals.filter(t => t.current_connection_at).length, [terminals]);
  const newUsers = 342; // Keeping this static as we don't have a users endpoint yet

  // Dynamic Chart Data
  const transactionTypeData = useMemo(() => {
    const counts = transactions.reduce((acc, t) => {
      const method = t.payment_method === 'TAP' ? 'Contactless (TAP)' : 'Chip';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const terminalStatusData = useMemo(() => {
    const active = terminals.filter(t => t.current_connection_at).length;
    const maintenance = terminals.filter(t => t.status === 'MAINTENANCE').length;
    const inactive = terminals.length - active - maintenance;
    return [
      { name: 'En Línea', value: active },
      { name: 'Inactivas', value: inactive },
      { name: 'Mantenimiento', value: maintenance },
    ];
  }, [terminals]);

  const revenueData = useMemo(() => {
    // Generate last 7 days based on current date
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      return format(d, 'dd MMM', { locale: es });
    });
    
    // Distribute total volume randomly across days to simulate trend
    // In a real app, this would group transactions by date
    return days.map(day => ({
      name: day,
      current: Math.floor(Math.random() * (totalVolume / 5)) + (totalVolume / 10),
      previous: Math.floor(Math.random() * (totalVolume / 5)) + (totalVolume / 12),
    }));
  }, [totalVolume]);

  const hourlyActivityData = useMemo(() => {
    // Group transactions by hour
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      transactions: 0,
      volume: 0,
    }));

    transactions.forEach(t => {
      const hour = new Date(t.timestamp).getHours();
      hours[hour].transactions += 1;
      hours[hour].volume += t.amount;
    });

    return hours;
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-slate-500">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Resumen Ejecutivo</h1>
          <p className="text-slate-500 mt-1">Métricas clave de rendimiento y estado del sistema.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {['24h', '7d', '30d', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === range 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <Button variant="outline" className="rounded-xl h-10 border-slate-200">
            <Filter className="w-4 h-4 mr-2 text-slate-500" />
            Filtros
          </Button>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-10">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Volumen Total', value: `$${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, trend: '+12.5%', isPositive: true, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Transacciones', value: totalTransactions.toLocaleString(), trend: '+8.2%', isPositive: true, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Terminales en Línea', value: activeTerminals.toLocaleString(), trend: '-2.1%', isPositive: false, icon: Monitor, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { title: 'Nuevos Usuarios', value: newUsers.toLocaleString(), trend: '+18.4%', isPositive: true, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="rounded-2xl border-none shadow-sm bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">{kpi.title}</p>
                    <h3 className="text-3xl font-bold text-slate-900">{kpi.value}</h3>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                    <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="secondary" className={`${kpi.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'} border-none flex items-center gap-1`}>
                    {kpi.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {kpi.trend}
                  </Badge>
                  <span className="text-xs text-slate-400">vs. período anterior</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
          <Card className="rounded-2xl border-none shadow-sm bg-white h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Tendencia de Ingresos</CardTitle>
                <CardDescription>Comparativa con el año anterior</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                <TrendingUp className="w-4 h-4 text-slate-400" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Area type="monotone" dataKey="previous" name="Año Anterior" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorPrevious)" />
                    <Area type="monotone" dataKey="current" name="Año Actual" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorCurrent)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Transaction Types */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
          <Card className="rounded-2xl border-none shadow-sm bg-white h-full">
            <CardHeader>
              <CardTitle>Tipos de Transacción</CardTitle>
              <CardDescription>Distribución por método</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={transactionTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {transactionTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {transactionTypeData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-xs text-slate-600 font-medium truncate" title={entry.name}>{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="rounded-2xl border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle>Actividad por Hora</CardTitle>
              <CardDescription>Volumen vs Transacciones (24h)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={hourlyActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} interval={3} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Bar yAxisId="left" dataKey="volume" name="Volumen ($)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} opacity={0.8} />
                    <Line yAxisId="right" type="monotone" dataKey="transactions" name="Transacciones" stroke="#4f46e5" strokeWidth={3} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Terminal Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="rounded-2xl border-none shadow-sm bg-white h-full">
            <CardHeader>
              <CardTitle>Estado de Terminales</CardTitle>
              <CardDescription>Distribución actual de la red</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="h-[250px] w-full md:w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={terminalStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {terminalStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#10b981', '#ef4444', '#f59e0b'][index]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 space-y-4">
                  {terminalStatusData.map((status, index) => (
                    <div key={status.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#10b981', '#ef4444', '#f59e0b'][index] }} />
                        <span className="font-medium text-slate-700">{status.name}</span>
                      </div>
                      <span className="font-bold text-slate-900">{status.value}%</span>
                    </div>
                  ))}
                  <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div className="flex items-start gap-3">
                      <div className="bg-white p-2 rounded-lg shadow-sm text-indigo-600">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-indigo-900">Salud de la Red</p>
                        <p className="text-xs text-indigo-700 mt-1">
                          {activeTerminals} terminales están operando sin problemas. {terminals.length - activeTerminals} requieren atención.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
