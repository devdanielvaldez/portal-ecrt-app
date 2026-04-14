import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye, 
  Building2, 
  Store, 
  Briefcase,
  ExternalLink,
  Mail,
  Phone,
  Calendar,
  ChevronRight, 
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { organizationService, Organization, OrgType, OrgStatus } from '@/src/services/organization.service';
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
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function OrganizationsPage() {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Create/Edit Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'COMMERCE' as OrgType,
    email: '',
    phone: '',
    business_category: '',
    address: '',
    contact_person: '',
    website: '',
    status: 'ACTIVE' as OrgStatus
  });

  const fetchOrganizations = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (typeFilter !== 'ALL') params.type = typeFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search) params.search = search;
      
      const response = await organizationService.getAll(params);
      if (response.success) {
        setOrganizations(response.data);
      }
    } catch (error) {
      toast.error('Error al cargar las organizaciones');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrganizations();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, typeFilter, statusFilter]);

  const handleOpenCreate = () => {
    setSelectedOrg(null);
    setFormData({
      name: '',
      type: 'COMMERCE',
      email: '',
      phone: '',
      business_category: '',
      address: '',
      contact_person: '',
      website: '',
      status: 'ACTIVE'
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (org: Organization) => {
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      type: org.type,
      email: org.email,
      phone: org.phone,
      business_category: org.business_category || '',
      address: org.address || '',
      contact_person: org.contact_person || '',
      website: org.website || '',
      status: org.status
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (selectedOrg) {
        const response = await organizationService.update(selectedOrg.id, formData);
        if (response.success) {
          toast.success('Organización actualizada correctamente');
          setIsDialogOpen(false);
          fetchOrganizations();
        }
      } else {
        const response = await organizationService.create(formData);
        if (response.success) {
          toast.success('Organización creada correctamente');
          // Show the generated password from the new response structure
          if (response.data.default_password) {
            toast.info(`Contraseña temporal: ${response.data.default_password}`, {
              duration: 10000,
            });
          }
          setIsDialogOpen(false);
          fetchOrganizations();
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
    if (!confirm('¿Estás seguro de que deseas eliminar esta organización?')) return;
    
    try {
      const response = await organizationService.delete(id);
      if (response.success) {
        toast.success('Organización eliminada correctamente');
        fetchOrganizations();
      }
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Error al eliminar';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Organizaciones</h1>
          <p className="text-slate-500 mt-1">Gestiona tus comercios y agencias publicitarias.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/90 text-white rounded-xl h-12 px-6 shadow-lg shadow-primary/20 transition-all active:scale-95">
          <Plus className="w-5 h-5 mr-2" />
          Nueva Organización
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total', value: organizations.length, icon: Building2, color: 'bg-blue-500' },
          { label: 'Comercios', value: organizations.filter(o => o.type === 'COMMERCE').length, icon: Store, color: 'bg-primary' },
          { label: 'Agencias', value: organizations.filter(o => o.type === 'AGENCY').length, icon: Briefcase, color: 'bg-secondary' },
          { label: 'Activas', value: organizations.filter(o => o.status === 'ACTIVE').length, icon: ShieldCheck, color: 'bg-green-500' },
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
              <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none">Hoy</Badge>
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
            placeholder="Buscar por nombre o email..." 
            className="pl-10 h-11 border-slate-200 rounded-xl focus:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px] h-11 border-slate-200 rounded-xl">
              <Filter className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los tipos</SelectItem>
              <SelectItem value="COMMERCE">Comercios</SelectItem>
              <SelectItem value="AGENCY">Agencias</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] h-11 border-slate-200 rounded-xl">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los estados</SelectItem>
              <SelectItem value="ACTIVE">Activos</SelectItem>
              <SelectItem value="INACTIVE">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold text-slate-700 py-5 pl-6">Organización</TableHead>
              <TableHead className="font-bold text-slate-700">Tipo</TableHead>
              <TableHead className="font-bold text-slate-700">Contacto</TableHead>
              <TableHead className="font-bold text-slate-700">Estado</TableHead>
              <TableHead className="font-bold text-slate-700">Creado</TableHead>
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
            ) : organizations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Building2 className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-lg font-medium">No se encontraron organizaciones</p>
                    <p className="text-sm">Intenta ajustar tus filtros de búsqueda</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              organizations.map((org) => (
                <TableRow key={org.id} className="hover:bg-slate-50/50 transition-colors group">
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        org.type === 'COMMERCE' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                      }`}>
                        {org.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{org.name}</p>
                        <p className="text-xs text-slate-500">{org.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`rounded-lg px-2.5 py-0.5 border-none ${
                      org.type === 'COMMERCE' 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-secondary/10 text-secondary'
                    }`}>
                      {org.type === 'COMMERCE' ? 'Comercio' : 'Agencia'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Phone className="w-3 h-3" />
                        {org.phone}
                      </div>
                      {org.website && (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <ExternalLink className="w-3 h-3" />
                          {org.website}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${org.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-300'}`} />
                      <span className={`text-sm font-medium ${org.status === 'ACTIVE' ? 'text-green-600' : 'text-slate-500'}`}>
                        {org.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(org.created_at), 'dd MMM, yyyy', { locale: es })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 rounded-lg hover:bg-slate-100")}>
                        <MoreVertical className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem className="rounded-lg cursor-pointer gap-2">
                            <Eye className="w-4 h-4 text-slate-400" /> Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenEdit(org)} className="rounded-lg cursor-pointer gap-2">
                            <Edit2 className="w-4 h-4 text-slate-400" /> Editar
                          </DropdownMenuItem>
                          {org.type === 'AGENCY' && (
                            <DropdownMenuItem 
                              onClick={() => navigate(`/dashboard/admin/agencies/${org.id}/assignments`)} 
                              className="rounded-lg cursor-pointer gap-2"
                            >
                              <ShieldCheck className="w-4 h-4 text-indigo-500" /> Gestionar Asignaciones
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(org.id)} className="rounded-lg cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/5">
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

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <form onSubmit={handleSubmit}>
            <div className={`p-8 ${formData.type === 'COMMERCE' ? 'bg-primary' : 'bg-secondary'} text-white relative overflow-hidden`}>
              <div className="absolute top-[-20%] right-[-10%] w-64 h-64 rounded-full bg-white/10 blur-3xl" />
              <DialogHeader className="relative z-10">
                <DialogTitle className="text-2xl font-bold">
                  {selectedOrg ? 'Editar Organización' : 'Nueva Organización'}
                </DialogTitle>
                <DialogDescription className="text-white/80">
                  {selectedOrg ? 'Actualiza la información de la empresa.' : 'Completa los datos para registrar un nuevo cliente.'}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-8 space-y-6 bg-white">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Organización</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(v: OrgType) => setFormData({...formData, type: v})}
                    disabled={!!selectedOrg}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-slate-200">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COMMERCE">Comercio</SelectItem>
                      <SelectItem value="AGENCY">Agencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(v: OrgStatus) => setFormData({...formData, status: v})}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-slate-200">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Activo</SelectItem>
                      <SelectItem value="INACTIVE">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Empresa</Label>
                <Input 
                  id="name" 
                  placeholder="Ej. Supermercado XYZ" 
                  className="h-11 rounded-xl border-slate-200"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="contacto@empresa.com" 
                    className="h-11 rounded-xl border-slate-200"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    disabled={!!selectedOrg}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input 
                    id="phone" 
                    placeholder="+1 809 000 0000" 
                    className="h-11 rounded-xl border-slate-200"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {formData.type === 'COMMERCE' ? (
                  <motion.div 
                    key="commerce-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoría de Negocio</Label>
                      <Input 
                        id="category" 
                        placeholder="Ej. Retail, Farmacia, etc." 
                        className="h-11 rounded-xl border-slate-200"
                        value={formData.business_category}
                        onChange={(e) => setFormData({...formData, business_category: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección Física</Label>
                      <Input 
                        id="address" 
                        placeholder="Av. Principal #123..." 
                        className="h-11 rounded-xl border-slate-200"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="agency-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="contact">Persona de Contacto</Label>
                      <Input 
                        id="contact" 
                        placeholder="Nombre del representante" 
                        className="h-11 rounded-xl border-slate-200"
                        value={formData.contact_person}
                        onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Sitio Web</Label>
                      <Input 
                        id="website" 
                        placeholder="https://www.agencia.com" 
                        className="h-11 rounded-xl border-slate-200"
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-11">
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className={`rounded-xl h-11 px-8 text-white ${formData.type === 'COMMERCE' ? 'bg-primary hover:bg-primary/90' : 'bg-secondary hover:bg-secondary/90'}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (selectedOrg ? 'Guardar Cambios' : 'Crear Organización')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
