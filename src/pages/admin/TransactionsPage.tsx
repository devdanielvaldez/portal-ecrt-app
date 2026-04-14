import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  ArrowUpRight,
  Loader2,
  Activity,
  Smartphone,
  CreditCard as CardIcon
} from 'lucide-react';
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
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { transactionService, Transaction } from '@/src/services/transaction.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await transactionService.getAll();
        if (response.success) {
          setTransactions(response.data);
        }
      } catch (error) {
        console.error('Error fetching transactions', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  // Metrics
  const totalAmount = useMemo(() => transactions.reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const highestAmount = useMemo(() => Math.max(...transactions.map(t => t.amount), 0), [transactions]);
  
  // Card Brand Data
  const cardBrandData = useMemo(() => {
    const counts = transactions.reduce((acc, t) => {
      const brand = t.card_brand === 'OTHER' ? 'SUBSIDIADO' : t.card_brand;
      acc[brand] = (acc[brand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // Payment Method Data
  const paymentMethodData = useMemo(() => {
    const counts = transactions.reduce((acc, t) => {
      acc[t.payment_method] = (acc[t.payment_method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // Map Data
  const mapData = useMemo(() => {
    return transactions.map(t => ({
      ...t,
      lat: t.latitude,
      lng: t.longitude,
      z: t.amount // Size of bubble based on amount
    }));
  }, [transactions]);

  const openGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  const CustomMapTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-sm">
          <p className="font-bold mb-1 text-emerald-400">${data.amount.toFixed(2)}</p>
          <p className="text-slate-300 text-xs mb-2">{format(new Date(data.timestamp), "dd MMM yyyy, HH:mm", { locale: es })}</p>
          <div className="flex items-center gap-2 mb-1">
            <CardIcon className="w-3 h-3 text-slate-400" />
            <span>{data.card_brand === 'OTHER' ? 'SUBSIDIADO' : data.card_brand}</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-3 h-3 text-slate-400" />
            <span>{data.payment_method}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-slate-500">Cargando transacciones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Transacciones</h1>
          <p className="text-slate-500 mt-1">Dashboard de operaciones de Palmares Mall.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="rounded-2xl border-none shadow-sm bg-white h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Volumen Total</p>
                  <h3 className="text-3xl font-bold text-slate-900">${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
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
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Transacciones</p>
                  <h3 className="text-3xl font-bold text-blue-600">{transactions.length}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-600" />
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
                  <p className="text-sm font-medium text-slate-500 mb-1">Monto Más Alto</p>
                  <h3 className="text-3xl font-bold text-indigo-600">${highestAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
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
                  <p className="text-sm font-medium text-slate-500 mb-1">Método Principal</p>
                  <h3 className="text-xl font-bold text-slate-900 truncate max-w-[120px]">
                    {paymentMethodData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card Brands Chart */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
          <Card className="rounded-2xl border-none shadow-sm bg-white h-full">
            <CardHeader>
              <CardTitle>Marcas de Tarjeta</CardTitle>
              <CardDescription>Distribución por tipo de tarjeta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={cardBrandData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {cardBrandData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {cardBrandData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-xs text-slate-600 font-medium">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Methods Chart */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
          <Card className="rounded-2xl border-none shadow-sm bg-white h-full">
            <CardHeader>
              <CardTitle>Métodos de Pago</CardTitle>
              <CardDescription>TAP vs CHIP</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paymentMethodData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60}>
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'TAP' ? '#3b82f6' : '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Transactions List */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}>
          <Card className="rounded-2xl border-none shadow-sm bg-white h-full">
            <CardHeader>
              <CardTitle>Transacciones Altas</CardTitle>
              <CardDescription>Top 5 por monto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...transactions].sort((a, b) => b.amount - a.amount).slice(0, 5).map((t, i) => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-900">
                          {t.card_brand === 'OTHER' ? 'SUBSIDIADO' : t.card_brand}
                        </p>
                        <p className="text-xs text-slate-500">{format(new Date(t.timestamp), "dd MMM, HH:mm", { locale: es })}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">${t.amount.toFixed(2)}</span>
                  </div>
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
                <CardTitle className="text-white">Listado de Transacciones</CardTitle>
                <CardDescription className="text-slate-400">Historial reciente de operaciones</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[400px] overflow-y-auto bg-white">
              <Table>
                <TableHeader className="sticky top-0 bg-white shadow-sm z-10">
                  <TableRow>
                    <TableHead>Detalle</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 50).map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 text-sm">
                            {t.card_brand === 'OTHER' ? 'SUBSIDIADO' : t.card_brand} • {t.payment_method}
                          </span>
                          <span className="text-xs text-slate-500">
                            {format(new Date(t.timestamp), "dd MMM, HH:mm", { locale: es })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-900 text-sm">
                        ${t.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => openGoogleMaps(t.latitude, t.longitude)}
                          title="Ver en Google Maps"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
