import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Layers,
  Building2,
  Monitor,
  Loader2,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Link as LinkIcon,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { terminalGroupService, TerminalGroup, GroupStatus } from '@/src/services/terminal-group.service';
import { organizationService, Organization } from '@/src/services/organization.service';
import { terminalService, Terminal } from '@/src/services/terminal.service';
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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function TerminalGroupsPage() {
  const [groups, setGroups] = useState<TerminalGroup[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orgFilter, setOrgFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Create/Edit Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<TerminalGroup | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    organization_id: '',
    status: 'ACTIVE' as GroupStatus
  });

  // Assign Terminals Dialog State
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [assigningGroup, setAssigningGroup] = useState<TerminalGroup | null>(null);
  const [availableTerminals, setAvailableTerminals] = useState<Terminal[]>([]);
  const [selectedTerminalIds, setSelectedTerminalIds] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  // View Details Dialog State
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [detailsGroup, setDetailsGroup] = useState<TerminalGroup | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const orgResponse = await organizationService.getAll({ type: 'COMMERCE' });
      if (orgResponse.success) {
        setOrganizations(orgResponse.data);
      }

      const params: any = {};
      if (orgFilter !== 'ALL') params.organization_id = orgFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      
      const response = await terminalGroupService.getAll(params);
      if (response.success) {
        setGroups(response.data);
      }
    } catch (error) {
      toast.error('Error al cargar los grupos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [orgFilter, statusFilter]);

  const handleOpenCreate = () => {
    setSelectedGroup(null);
    setFormData({
      name: '',
      organization_id: '',
      status: 'ACTIVE'
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (group: TerminalGroup) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      organization_id: group.organization_id,
      status: group.status
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
      if (selectedGroup) {
        const response = await terminalGroupService.update(selectedGroup.id, {
          name: formData.name,
          status: formData.status
        });
        if (response.success) {
          toast.success('Grupo actualizado correctamente');
          setIsDialogOpen(false);
          fetchData();
        }
      } else {
        const response = await terminalGroupService.create(formData);
        if (response.success) {
          toast.success('Grupo creado correctamente');
          setIsDialogOpen(false);
          fetchData();
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al procesar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este grupo? Las terminales asociadas quedarán sin grupo.')) return;
    try {
      const response = await terminalGroupService.delete(id);
      if (response.success) {
        toast.success('Grupo eliminado correctamente');
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al eliminar');
    }
  };

  const handleOpenAssign = async (group: TerminalGroup) => {
    setAssigningGroup(group);
    setSelectedTerminalIds([]);
    setIsAssignDialogOpen(true);
    setIsAssigning(true);
    try {
      // Fetch terminals for this organization
      const response = await terminalService.getAll({ organization_id: group.organization_id });
      if (response.success) {
        // Filter out terminals already in this group (optional, but good for UX)
        setAvailableTerminals(response.data);
        // Pre-select terminals that are already in this group if possible
        // Note: The API response for getAll terminals might not have group_id easily accessible if it's nested
        // But we can check if terminal.group_id === group.id
      }
    } catch (error) {
      toast.error('Error al cargar terminales disponibles');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAssignSubmit = async () => {
    if (!assigningGroup) return;
    setIsAssigning(true);
    try {
      const response = await terminalGroupService.assignTerminals({
        group_id: assigningGroup.id,
        terminal_ids: selectedTerminalIds
      });
      if (response.success) {
        toast.success(response.message || 'Terminales asignadas correctamente');
        setIsAssignDialogOpen(false);
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al asignar terminales');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleOpenDetails = async (group: TerminalGroup) => {
    setDetailsGroup(group);
    setIsDetailsDialogOpen(true);
    setIsDetailsLoading(true);
    try {
      const response = await terminalGroupService.getById(group.id);
      if (response.success) {
        setDetailsGroup(response.data);
      }
    } catch (error) {
      toast.error('Error al cargar detalles del grupo');
    } finally {
      setIsDetailsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Grupos de Terminales</h1>
          <p className="text-slate-500 mt-1">Organiza tus dispositivos por sucursales o áreas.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/90 text-white rounded-xl h-12 px-6 shadow-lg shadow-primary/20 transition-all active:scale-95">
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Grupo
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total Grupos', value: groups.length, icon: Layers, color: 'bg-indigo-500' },
          { label: 'Grupos Activos', value: groups.filter(g => g.status === 'ACTIVE').length, icon: CheckCircle2, color: 'bg-green-500' },
          { label: 'Total Terminales en Grupos', value: groups.reduce((acc, g) => acc + (g.total_terminals || 0), 0), icon: Monitor, color: 'bg-primary' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="flex flex-wrap gap-3">
          <Select value={orgFilter} onValueChange={setOrgFilter}>
            <SelectTrigger className="w-[250px] h-11 border-slate-200 rounded-xl">
              <Building2 className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Filtrar por Comercio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los comercios</SelectItem>
              {organizations.map(org => (
                <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] h-11 border-slate-200 rounded-xl">
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
              <TableHead className="font-bold text-slate-700 py-5 pl-6">Nombre del Grupo</TableHead>
              <TableHead className="font-bold text-slate-700">Comercio</TableHead>
              <TableHead className="font-bold text-slate-700 text-center">Terminales</TableHead>
              <TableHead className="font-bold text-slate-700">Estado</TableHead>
              <TableHead className="font-bold text-slate-700">Fecha Creación</TableHead>
              <TableHead className="text-right pr-6">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6} className="py-8">
                    <div className="h-10 w-full bg-slate-100 animate-pulse rounded-xl" />
                  </TableCell>
                </TableRow>
              ))
            ) : groups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Layers className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-lg font-medium">No se encontraron grupos</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              groups.map((group) => (
                <TableRow key={group.id} className="hover:bg-slate-50/50 transition-colors group">
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Layers className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-slate-900">{group.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{group.organizations?.name || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 rounded-lg">
                      {group.total_terminals || 0} dispositivos
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "rounded-lg px-2.5 py-0.5 border-none",
                      group.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                    )}>
                      {group.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(group.created_at), 'dd MMM yyyy', { locale: es })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 rounded-lg hover:bg-slate-100")}>
                        <MoreVertical className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Opciones de Grupo</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleOpenDetails(group)} className="rounded-lg cursor-pointer gap-2">
                            <Info className="w-4 h-4 text-slate-400" /> Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenAssign(group)} className="rounded-lg cursor-pointer gap-2">
                            <LinkIcon className="w-4 h-4 text-slate-400" /> Asignar Terminales
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenEdit(group)} className="rounded-lg cursor-pointer gap-2">
                            <Edit2 className="w-4 h-4 text-slate-400" /> Editar Nombre
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(group.id)} className="rounded-lg cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/5">
                          <Trash2 className="w-4 h-4" /> Eliminar Grupo
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
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <form onSubmit={handleSubmit}>
            <div className="p-8 bg-indigo-900 text-white relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-10%] w-64 h-64 rounded-full bg-primary/20 blur-3xl" />
              <DialogHeader className="relative z-10">
                <DialogTitle className="text-2xl font-bold">
                  {selectedGroup ? 'Editar Grupo' : 'Nuevo Grupo'}
                </DialogTitle>
                <DialogDescription className="text-indigo-200">
                  Agrupa terminales para facilitar la gestión de anuncios y reportes.
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-8 space-y-6 bg-white">
              <div className="space-y-2">
                <Label htmlFor="organization_id">Comercio Propietario</Label>
                <Select 
                  disabled={!!selectedGroup}
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
                {selectedGroup && <p className="text-[10px] text-slate-400 italic">No se puede cambiar el comercio de un grupo existente.</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Grupo</Label>
                <Input 
                  id="name" 
                  placeholder="Ej. Sucursal Reforma" 
                  className="h-11 rounded-xl border-slate-200"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v: GroupStatus) => setFormData({...formData, status: v})}
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

            <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-11">
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="rounded-xl h-11 px-8 text-white bg-indigo-900 hover:bg-indigo-800"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (selectedGroup ? 'Guardar Cambios' : 'Crear Grupo')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Terminals Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-8 bg-slate-900 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Asignar Terminales</DialogTitle>
              <DialogDescription className="text-slate-400">
                Selecciona las terminales de <span className="text-white font-semibold">{assigningGroup?.organizations?.name}</span> para el grupo <span className="text-white font-semibold">{assigningGroup?.name}</span>.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 bg-white max-h-[400px] overflow-y-auto">
            {isAssigning && availableTerminals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Cargando terminales...</p>
              </div>
            ) : availableTerminals.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Monitor className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No hay terminales registradas para este comercio.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-sm font-medium text-slate-500">Terminales Disponibles</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-primary h-7"
                    onClick={() => {
                      if (selectedTerminalIds.length === availableTerminals.length) {
                        setSelectedTerminalIds([]);
                      } else {
                        setSelectedTerminalIds(availableTerminals.map(t => t.id));
                      }
                    }}
                  >
                    {selectedTerminalIds.length === availableTerminals.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                  </Button>
                </div>
                {availableTerminals.map((terminal) => (
                  <div 
                    key={terminal.id} 
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer",
                      selectedTerminalIds.includes(terminal.id) 
                        ? "border-primary bg-primary/5" 
                        : "border-slate-100 hover:border-slate-200"
                    )}
                    onClick={() => {
                      setSelectedTerminalIds(prev => 
                        prev.includes(terminal.id) 
                          ? prev.filter(id => id !== terminal.id) 
                          : [...prev, terminal.id]
                      );
                    }}
                  >
                    <Checkbox 
                      checked={selectedTerminalIds.includes(terminal.id)}
                      onCheckedChange={() => {}} // Handled by parent div click
                      className="rounded-md"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{terminal.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{terminal.serial_number}</p>
                    </div>
                    {terminal.group_id && terminal.group_id !== assigningGroup?.id && (
                      <Badge variant="secondary" className="text-[10px] bg-amber-50 text-amber-600 border-none">
                        En otro grupo
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsAssignDialogOpen(false)} className="rounded-xl h-11">
              Cancelar
            </Button>
            <Button 
              onClick={handleAssignSubmit}
              className="rounded-xl h-11 px-8 text-white bg-slate-900 hover:bg-slate-800"
              disabled={isAssigning || selectedTerminalIds.length === 0}
            >
              {isAssigning ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Asignación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-8 bg-indigo-900 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{detailsGroup?.name}</DialogTitle>
              <DialogDescription className="text-indigo-200">
                Detalles del grupo y terminales asignadas.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 bg-white max-h-[500px] overflow-y-auto">
            {isDetailsLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-slate-500">Cargando información...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Organización</p>
                    <p className="font-semibold text-slate-900">{detailsGroup?.organizations?.name}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Estado</p>
                    <Badge variant="outline" className={cn(
                      "rounded-lg px-2.5 py-0.5 border-none",
                      detailsGroup?.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                    )}>
                      {detailsGroup?.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-primary" />
                    Terminales en este grupo ({detailsGroup?.terminals?.length || 0})
                  </h4>
                  {detailsGroup?.terminals && detailsGroup.terminals.length > 0 ? (
                    <div className="space-y-3">
                      {detailsGroup.terminals.map((terminal) => (
                        <div key={terminal.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                              <Monitor className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{terminal.name}</p>
                              <p className="text-xs text-slate-500 font-mono">{terminal.serial_number}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className={cn(
                            "rounded-lg px-2 py-0.5 border-none text-[10px]",
                            terminal.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-500'
                          )}>
                            {terminal.status === 'ACTIVE' ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-sm text-slate-400">No hay terminales asignadas a este grupo.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100">
            <Button onClick={() => setIsDetailsDialogOpen(false)} className="rounded-xl h-11 px-8 text-white bg-indigo-900 hover:bg-indigo-800">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper icons
function Calendar(props: any) {
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
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}

function Store(props: any) {
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
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
      <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
    </svg>
  )
}
