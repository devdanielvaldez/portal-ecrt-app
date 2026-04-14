import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Building2, 
  Layers, 
  Trash2, 
  Loader2, 
  ShieldCheck,
  Search,
  LayoutGrid,
  List
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { agencyService } from '@/src/services/agency.service';
import { organizationService, Organization } from '@/src/services/organization.service';
import { terminalGroupService, TerminalGroup } from '@/src/services/terminal-group.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AgencyAssignmentsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agency, setAgency] = useState<Organization | null>(null);
  const [assignedCommerces, setAssignedCommerces] = useState<Organization[]>([]);
  const [assignedGroups, setAssignedGroups] = useState<TerminalGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Assignment Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [assignType, setAssignType] = useState<'COMMERCE' | 'GROUP'>('COMMERCE');
  const [availableCommerces, setAvailableCommerces] = useState<Organization[]>([]);
  const [availableGroups, setAvailableGroups] = useState<TerminalGroup[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAgencyData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [agencyRes, commercesRes, groupsRes] = await Promise.all([
        organizationService.getById(id),
        agencyService.getAssignedCommerces(id),
        agencyService.getAssignedGroups(id)
      ]);

      if (agencyRes.success) setAgency(agencyRes.data);
      if (commercesRes.success) setAssignedCommerces(commercesRes.data);
      if (groupsRes.success) setAssignedGroups(groupsRes.data);
    } catch (error) {
      toast.error('Error al cargar datos de la agencia');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencyData();
  }, [id]);

  const handleOpenAssign = async (type: 'COMMERCE' | 'GROUP') => {
    setAssignType(type);
    setSelectedId('');
    setIsDialogOpen(true);
    try {
      if (type === 'COMMERCE') {
        const res = await organizationService.getAll({ type: 'COMMERCE' });
        if (res.success) {
          // Filter out already assigned
          const assignedIds = assignedCommerces.map(c => c.id);
          setAvailableCommerces(res.data.filter(c => !assignedIds.includes(c.id)));
        }
      } else {
        const res = await terminalGroupService.getAll();
        if (res.success) {
          // Filter out already assigned
          const assignedIds = assignedGroups.map(g => g.id);
          setAvailableGroups(res.data.filter(g => !assignedIds.includes(g.id)));
        }
      }
    } catch (error) {
      toast.error('Error al cargar recursos disponibles');
    }
  };

  const handleAssignSubmit = async () => {
    if (!id || !selectedId) return;
    setIsSubmitting(true);
    try {
      const payload: any = { agency_id: id };
      if (assignType === 'COMMERCE') payload.commerce_id = selectedId;
      else payload.group_id = selectedId;

      const response = await agencyService.assign(payload);
      if (response.success) {
        toast.success('Asignación realizada correctamente');
        setIsDialogOpen(false);
        fetchAgencyData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al asignar');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-slate-500 font-medium">Cargando configuración de agencia...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard/admin/organizations')}
          className="w-fit -ml-2 text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Organizaciones
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-indigo-900 flex items-center justify-center text-white shadow-xl shadow-indigo-900/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-slate-900">{agency?.name}</h1>
                <Badge className="bg-indigo-100 text-indigo-700 border-none rounded-lg">Agencia</Badge>
              </div>
              <p className="text-slate-500 mt-1">Gestiona los comercios y grupos que esta agencia puede administrar.</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="commerces" className="space-y-6">
        <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <TabsList className="bg-transparent border-none">
            <TabsTrigger value="commerces" className="rounded-xl data-[state=active]:bg-slate-100 data-[state=active]:shadow-none px-6 h-10">
              <Building2 className="w-4 h-4 mr-2" />
              Comercios ({assignedCommerces.length})
            </TabsTrigger>
            <TabsTrigger value="groups" className="rounded-xl data-[state=active]:bg-slate-100 data-[state=active]:shadow-none px-6 h-10">
              <Layers className="w-4 h-4 mr-2" />
              Grupos ({assignedGroups.length})
            </TabsTrigger>
          </TabsList>
          
          <div className="px-2">
            <TabsContent value="commerces" className="m-0">
              <Button onClick={() => handleOpenAssign('COMMERCE')} size="sm" className="bg-indigo-900 hover:bg-indigo-800 text-white rounded-xl">
                <Plus className="w-4 h-4 mr-2" /> Asignar Comercio
              </Button>
            </TabsContent>
            <TabsContent value="groups" className="m-0">
              <Button onClick={() => handleOpenAssign('GROUP')} size="sm" className="bg-indigo-900 hover:bg-indigo-800 text-white rounded-xl">
                <Plus className="w-4 h-4 mr-2" /> Asignar Grupo
              </Button>
            </TabsContent>
          </div>
        </div>

        <TabsContent value="commerces" className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {assignedCommerces.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500 font-medium">No hay comercios asignados a esta agencia.</p>
                </div>
              ) : (
                assignedCommerces.map((commerce) => (
                  <motion.div
                    key={commerce.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Card className="rounded-3xl border-slate-200 hover:border-indigo-200 transition-all group overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <CardTitle className="mt-4 text-lg">{commerce.name}</CardTitle>
                        <CardDescription>{commerce.business_category || 'Sin categoría'}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4 border-t border-slate-50 bg-slate-50/50">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{commerce.email}</span>
                          <Badge variant="outline" className="bg-white border-slate-200 text-[10px]">{commerce.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="groups" className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {assignedGroups.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                  <Layers className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500 font-medium">No hay grupos de terminales asignados a esta agencia.</p>
                </div>
              ) : (
                assignedGroups.map((group) => (
                  <motion.div
                    key={group.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Card className="rounded-3xl border-slate-200 hover:border-indigo-200 transition-all group overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            <Layers className="w-5 h-5" />
                          </div>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <CardTitle className="mt-4 text-lg">{group.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {group.organizations?.name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4 border-t border-slate-50 bg-slate-50/50">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{group.total_terminals || 0} terminales</span>
                          <Badge variant="outline" className="bg-white border-slate-200 text-[10px]">{group.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>

      {/* Assign Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-8 bg-indigo-900 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Asignar {assignType === 'COMMERCE' ? 'Comercio' : 'Grupo'}
              </DialogTitle>
              <DialogDescription className="text-indigo-200">
                Selecciona el recurso que deseas que la agencia pueda gestionar.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-6 bg-white">
            <div className="space-y-2">
              <Label className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                {assignType === 'COMMERCE' ? 'Comercio Disponible' : 'Grupo Disponible'}
              </Label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200">
                  <SelectValue placeholder={`Seleccionar ${assignType === 'COMMERCE' ? 'comercio' : 'grupo'}`} />
                </SelectTrigger>
                <SelectContent>
                  {assignType === 'COMMERCE' ? (
                    availableCommerces.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))
                  ) : (
                    availableGroups.map(g => (
                      <SelectItem key={g.id} value={g.id}>{g.name} ({g.organizations?.name})</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {((assignType === 'COMMERCE' && availableCommerces.length === 0) || 
                (assignType === 'GROUP' && availableGroups.length === 0)) && (
                <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                  No hay más {assignType === 'COMMERCE' ? 'comercios' : 'grupos'} disponibles para asignar.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-11">
              Cancelar
            </Button>
            <Button 
              onClick={handleAssignSubmit}
              disabled={isSubmitting || !selectedId}
              className="rounded-xl h-11 px-8 text-white bg-indigo-900 hover:bg-indigo-800"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Asignación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Label({ children, className, ...props }: React.ComponentProps<"label">) {
  return (
    <label className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props}>
      {children}
    </label>
  );
}
