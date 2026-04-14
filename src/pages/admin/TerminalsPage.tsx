import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Monitor,
  Building2,
  Store,
  Wifi,
  WifiOff,
  Calendar,
  Loader2,
  Key,
  Hash,
  MapPin,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { terminalService, Terminal, TerminalStatus } from '@/src/services/terminal.service';
import { organizationService, Organization } from '@/src/services/organization.service';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import TerminalDashboard from '@/src/components/admin/TerminalDashboard';

export default function TerminalsPage() {
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [orgFilter, setOrgFilter] = useState<string>('ALL');
  const [claimedFilter, setClaimedFilter] = useState<string>('ALL');
  
  // Create/Edit Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    serial_number: '',
    merchant_id: '',
    api_key: '',
    organization_id: '',
    status: 'ACTIVE' as TerminalStatus
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch organizations first (only COMMERCE as per request)
      const orgResponse = await organizationService.getAll({ type: 'COMMERCE' });
      if (orgResponse.success) {
        setOrganizations(orgResponse.data);
      }

      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (orgFilter !== 'ALL') params.organization_id = orgFilter;
      if (claimedFilter !== 'ALL') params.is_claimed = claimedFilter;
      if (search) params.search = search;
      
      const response = await terminalService.getAll(params);
      if (response.success) {
        setTerminals(response.data);
      }
    } catch (error) {
      toast.error('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, orgFilter, claimedFilter]);

  const handleOpenCreate = () => {
    setSelectedTerminal(null);
    setFormData({
      name: '',
      serial_number: '',
      merchant_id: '',
      api_key: '',
      organization_id: '',
      status: 'ACTIVE'
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (terminal: Terminal) => {
    setSelectedTerminal(terminal);
    setFormData({
      name: terminal.name,
      serial_number: terminal.serial_number,
      merchant_id: terminal.merchant_id,
      api_key: terminal.api_key,
      organization_id: terminal.organization_id,
      status: terminal.status
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.organization_id) {
      toast.error('Debes seleccionar una organización');
      return;
    }
    setIsSubmitting(true);
    try {
      if (selectedTerminal) {
        const response = await terminalService.update(selectedTerminal.id, formData);
        if (response.success) {
          toast.success('Terminal actualizada correctamente');
          setIsDialogOpen(false);
          fetchData();
        }
      } else {
        const response = await terminalService.create(formData);
        if (response.success) {
          toast.success(response.message || 'Terminal creada correctamente');
          setIsDialogOpen(false);
          fetchData();
        }
      }
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Error al procesar la solicitud';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta terminal?')) return;
    
    try {
      const response = await terminalService.delete(id);
      if (response.success) {
        toast.success('Terminal eliminada correctamente');
        fetchData();
      }
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Error al eliminar';
      toast.error(msg);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      const response = await terminalService.deactivate(id);
      if (response.success) {
        toast.success('Terminal inactivada correctamente');
        fetchData();
      }
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Error al inactivar';
      toast.error(msg);
    }
  };

  const getOrgName = (id: string) => {
    return organizations.find(o => o.id === id)?.name || 'Desconocida';
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Terminales</h1>
          <p className="text-slate-500 mt-1">Gestiona los dispositivos y puntos de venta.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/90 text-white rounded-xl h-12 px-6 shadow-lg shadow-primary/20 transition-all active:scale-95">
          <Plus className="w-5 h-5 mr-2" />
          Nueva Terminal
        </Button>
      </div>

      <Tabs defaultValue="list" className="w-full space-y-6">
        <TabsList className="bg-slate-100/50 p-1 rounded-xl">
          <TabsTrigger value="list" className="rounded-lg px-6">Listado</TabsTrigger>
          <TabsTrigger value="dashboard" className="rounded-lg px-6">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-0 outline-none">
          <TerminalDashboard terminals={terminals} />
        </TabsContent>

        <TabsContent value="list" className="mt-0 outline-none space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Terminales', value: terminals.length, icon: Monitor, color: 'bg-blue-500' },
          { label: 'En Línea', value: terminals.filter(t => t.current_connection_at).length, icon: Wifi, color: 'bg-green-500' },
          { label: 'Inactivas', value: terminals.filter(t => t.status === 'INACTIVE').length, icon: WifiOff, color: 'bg-slate-500' },
          { label: 'Transacciones Hoy', value: terminals.reduce((acc, t) => acc + (t.total_transactions || 0), 0), icon: Activity, color: 'bg-primary' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none">Tiempo Real</Badge>
            </div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Buscar por nombre o número de serie..." 
            className="pl-10 h-11 border-slate-200 rounded-xl focus:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Select value={orgFilter} onValueChange={setOrgFilter}>
            <SelectTrigger className="w-[200px] h-11 border-slate-200 rounded-xl">
              <Building2 className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Organización" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas las orgs</SelectItem>
              {organizations.map(org => (
                <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] h-11 border-slate-200 rounded-xl">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los estados</SelectItem>
              <SelectItem value="ACTIVE">Activas</SelectItem>
              <SelectItem value="INACTIVE">Inactivas</SelectItem>
              <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
            </SelectContent>
          </Select>

          <Select value={claimedFilter} onValueChange={setClaimedFilter}>
            <SelectTrigger className="w-[160px] h-11 border-slate-200 rounded-xl">
              <SelectValue placeholder="Vinculación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Cualquier vínculo</SelectItem>
              <SelectItem value="true">Vinculadas</SelectItem>
              <SelectItem value="false">No vinculadas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold text-slate-700 py-5 pl-6">Terminal</TableHead>
              <TableHead className="font-bold text-slate-700">Organización</TableHead>
              <TableHead className="font-bold text-slate-700">Serie / Merchant</TableHead>
              <TableHead className="font-bold text-slate-700">Estado</TableHead>
              <TableHead className="font-bold text-slate-700">Conexión</TableHead>
              <TableHead className="text-right pr-6">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6} className="py-8">
                    <div className="flex items-center gap-3 pl-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-40 bg-slate-100 animate-pulse rounded" />
                        <div className="h-3 w-24 bg-slate-50 animate-pulse rounded" />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : terminals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Monitor className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-lg font-medium">No se encontraron terminales</p>
                    <p className="text-sm">Intenta ajustar tus filtros de búsqueda</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              terminals.map((terminal) => (
                <TableRow key={terminal.id} className="hover:bg-slate-50/50 transition-colors group">
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                        <Monitor className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{terminal.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{terminal.id.split('-')[0]}...</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">
                        {terminal.organizations?.name || getOrgName(terminal.organization_id)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Hash className="w-3 h-3" />
                        {terminal.serial_number}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Store className="w-3 h-3" />
                        {terminal.merchant_id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className={cn(
                        "rounded-lg px-2.5 py-0.5 border-none w-fit",
                        terminal.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                        terminal.status === 'MAINTENANCE' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                      )}>
                        {terminal.status === 'ACTIVE' ? 'Activa' : 
                         terminal.status === 'MAINTENANCE' ? 'Mantenimiento' : 'Inactiva'}
                      </Badge>
                      <span className={cn(
                        "text-[10px] font-medium px-2 py-0.5 rounded-full w-fit",
                        terminal.is_claimed ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-400"
                      )}>
                        {terminal.is_claimed ? "Vinculada" : "Pendiente"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        terminal.current_connection_at ? "bg-green-500 animate-pulse" : "bg-slate-300"
                      )} />
                      <span className="text-xs text-slate-500">
                        {terminal.current_connection_at ? 'En línea' : 'Desconectada'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 rounded-lg hover:bg-slate-100")}>
                        <MoreVertical className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Gestión</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleOpenEdit(terminal)} className="rounded-lg cursor-pointer gap-2">
                            <Edit2 className="w-4 h-4 text-slate-400" /> Editar
                          </DropdownMenuItem>
                          {terminal.status === 'ACTIVE' && (
                            <DropdownMenuItem onClick={() => handleDeactivate(terminal.id)} className="rounded-lg cursor-pointer gap-2 text-amber-600 focus:text-amber-600 focus:bg-amber-50">
                              <WifiOff className="w-4 h-4" /> Inactivar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(terminal.id)} className="rounded-lg cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/5">
                          <Trash2 className="w-4 h-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <form onSubmit={handleSubmit}>
            <div className="p-8 bg-slate-900 text-white relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-10%] w-64 h-64 rounded-full bg-primary/20 blur-3xl" />
              <DialogHeader className="relative z-10">
                <DialogTitle className="text-2xl font-bold">
                  {selectedTerminal ? 'Editar Terminal' : 'Nueva Terminal'}
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  {selectedTerminal ? 'Actualiza los parámetros técnicos del dispositivo.' : 'Registra un nuevo punto de venta en el sistema.'}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-8 space-y-6 bg-white">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="organization_id">Organización (Comercio)</Label>
                  <Select 
                    value={formData.organization_id} 
                    onValueChange={(v) => setFormData({...formData, organization_id: v})}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-slate-200">
                      <SelectValue placeholder="Seleccionar comercio" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map(org => (
                        <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Estado Inicial</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(v: TerminalStatus) => setFormData({...formData, status: v})}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-slate-200">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Activa</SelectItem>
                      <SelectItem value="INACTIVE">Inactiva</SelectItem>
                      <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Terminal</Label>
                <Input 
                  id="name" 
                  placeholder="Ej. Caja Principal Centro" 
                  className="h-11 rounded-xl border-slate-200"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="serial_number">Número de Serie (SN)</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      id="serial_number" 
                      placeholder="SN-0000000000" 
                      className="pl-10 h-11 rounded-xl border-slate-200"
                      value={formData.serial_number}
                      onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="merchant_id">Merchant ID</Label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      id="merchant_id" 
                      placeholder="MERCH-000-XYZ" 
                      className="pl-10 h-11 rounded-xl border-slate-200"
                      value={formData.merchant_id}
                      onChange={(e) => setFormData({...formData, merchant_id: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api_key">API Key (Planet)</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    id="api_key" 
                    type="text"
                    placeholder="Introduce la llave proporcionada" 
                    className="pl-10 h-11 rounded-xl border-slate-200"
                    value={formData.api_key}
                    onChange={(e) => setFormData({...formData, api_key: e.target.value})}
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 italic">Esta llave es necesaria para la comunicación con el procesador de pagos.</p>
              </div>
            </div>

            <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-11">
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="rounded-xl h-11 px-8 text-white bg-slate-900 hover:bg-slate-800"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (selectedTerminal ? 'Guardar Cambios' : 'Crear Terminal')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper component for shield check icon if not imported
function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
