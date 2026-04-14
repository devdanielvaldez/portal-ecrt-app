import React, { useMemo } from 'react';
import { Terminal } from '@/src/services/terminal.service';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell
} from 'recharts';
import { 
  Monitor, 
  Wifi, 
  Activity, 
  MapPin, 
  ArrowUpRight,
  Signal,
  WifiOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TerminalDashboardProps {
  terminals: Terminal[];
}

export default function TerminalDashboard({ terminals }: TerminalDashboardProps) {
  // Process data
  const onlineTerminals = terminals.filter(t => t.current_connection_at);
  const totalTransactions = terminals.reduce((acc, t) => acc + (t.total_transactions || 0), 0);
  
  // Top networks
  const networkCounts = terminals.reduce((acc, t) => {
    if (t.network) {
      acc[t.network] = (acc[t.network] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  const topNetwork = Object.entries(networkCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Chart data: Transactions per terminal (Top 10)
  const chartData = useMemo(() => {
    return [...terminals]
      .sort((a, b) => (b.total_transactions || 0) - (a.total_transactions || 0))
      .slice(0, 10)
      .map(t => ({
        name: t.name,
        transactions: t.total_transactions || 0,
        serial: t.serial_number
      }));
  }, [terminals]);

  // Map data (Simulated locations)
  const mapData = useMemo(() => {
    return terminals.map((t, i) => {
      // Use provided coordinates or simulate around the base coordinate if missing
      const baseLat = 18.48260400;
      const baseLng = -69.94444700;
      
      const lat = t.latitude || (baseLat + (Math.random() - 0.5) * 0.05);
      const lng = t.longitude || (baseLng + (Math.random() - 0.5) * 0.05);
      
      return {
        ...t,
        lat,
        lng,
        isOnline: !!t.current_connection_at
      };
    });
  }, [terminals]);

  const openGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-sm">
          <p className="font-bold mb-1">{data.name}</p>
          <p className="text-slate-300 text-xs mb-2">{data.serial_number}</p>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${data.isOnline ? 'bg-emerald-400' : 'bg-slate-500'}`} />
            <span>{data.isOnline ? 'En línea' : 'Desconectada'}</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <Wifi className="w-3 h-3 text-slate-400" />
            <span>{data.network || 'Sin red'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-slate-400" />
            <span>{data.total_transactions || 0} txns</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="rounded-2xl border-none shadow-sm bg-white h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Terminales</p>
                  <h3 className="text-3xl font-bold text-slate-900">{terminals.length}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Monitor className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="rounded-2xl border-none shadow-sm bg-white h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">En Línea</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-emerald-600">{onlineTerminals.length}</h3>
                    <span className="text-sm text-slate-500">/ {terminals.length}</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Signal className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="rounded-2xl border-none shadow-sm bg-white h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Transacciones</p>
                  <h3 className="text-3xl font-bold text-indigo-600">{totalTransactions}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="rounded-2xl border-none shadow-sm bg-white h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Red Principal</p>
                  <h3 className="text-xl font-bold text-slate-900 truncate max-w-[120px]">{topNetwork}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Wifi className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="lg:col-span-2">
          <Card className="rounded-2xl border-none shadow-sm bg-white h-full">
            <CardHeader>
              <CardTitle>Transacciones por Terminal</CardTitle>
              <CardDescription>Top 10 terminales con mayor volumen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="transactions" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Terminals List */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
          <Card className="rounded-2xl border-none shadow-sm bg-white h-full">
            <CardHeader>
              <CardTitle>Top Terminales</CardTitle>
              <CardDescription>Mayor cantidad de transacciones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chartData.slice(0, 5).map((t, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + (i * 0.1) }}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        #{i + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-900">{t.name}</p>
                        <p className="text-xs text-slate-500">{t.serial}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-white">{t.transactions} txns</Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
        <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">

        <CardHeader className="bg-slate-900 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Directorio de Ubicaciones</CardTitle>
              <CardDescription className="text-slate-400">Estado de conexión en tiempo real</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
            <div className="h-[400px] overflow-y-auto p-4 space-y-3 bg-white">
              {mapData.map((t) => (
                <div key={t.id} className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm text-slate-900">{t.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${t.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span className="text-[10px] text-slate-500">{t.isOnline ? 'En línea' : 'Desconectada'}</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                      onClick={() => openGoogleMaps(t.lat, t.lng)}
                      title="Ver en Google Maps"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <div className="flex items-center gap-1 text-slate-400 mb-1">
                        <Wifi className="w-3 h-3" />
                        <span className="text-[10px] font-medium uppercase">Red</span>
                      </div>
                      <p className="text-xs font-medium text-slate-700 truncate">{t.network || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <div className="flex items-center gap-1 text-slate-400 mb-1">
                        <MapPin className="w-3 h-3" />
                        <span className="text-[10px] font-medium uppercase">Coords</span>
                      </div>
                      <p className="text-[10px] font-mono text-slate-600 truncate">
                        {t.lat.toFixed(4)}, {t.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  );
}
