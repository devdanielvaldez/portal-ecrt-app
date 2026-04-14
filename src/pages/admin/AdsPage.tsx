import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  Play, 
  Calendar,
  Building2,
  Tag,
  Loader2,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { adService, Ad, AdStatus } from '@/src/services/ad.service';
import { organizationService, Organization } from '@/src/services/organization.service';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdStatus | 'ALL'>('ALL');
  const [orgFilter, setOrgFilter] = useState<string | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'ACTIVE' | 'REJECTED' | 'INACTIVE' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAds();
    fetchOrganizations();
  }, [page, statusFilter, orgFilter]);

  const fetchAds = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page,
        limit: 10,
        search: search || undefined,
      };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (orgFilter !== 'ALL') params.organization_id = orgFilter;

      const response = await adService.getAll(params);
      if (response.success) {
        setAds(response.data);
        setTotalPages(response.meta.total_pages);
      }
    } catch (error) {
      toast.error('Error al cargar anuncios');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await organizationService.getAll({ type: 'COMMERCE' });
      if (response.success) {
        setOrganizations(response.data);
      }
    } catch (error) {
      console.error('Error fetching organizations', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAds();
  };

  const handleReview = async () => {
    if (!selectedAd || !reviewAction) return;

    setIsSubmitting(true);
    try {
      const response = await adService.review(selectedAd.id, reviewAction);
      if (response.success) {
        toast.success(`Anuncio ${reviewAction === 'ACTIVE' ? 'aprobado' : 'rechazado'} correctamente`);
        setIsReviewOpen(false);
        fetchAds();
      }
    } catch (error) {
      toast.error('Error al procesar la revisión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: AdStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200">Activo</Badge>;
      case 'IN_REVIEW':
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-200">En Revisión</Badge>;
      case 'REJECTED':
        return <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-200">Rechazado</Badge>;
      case 'INACTIVE':
        return <Badge className="bg-slate-500/10 text-slate-600 hover:bg-slate-500/20 border-slate-200">Inactivo</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Anuncios</h1>
          <p className="text-slate-500 mt-1">Gestiona y supervisa el catálogo de publicidad.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por nombre..."
              className="pl-10 h-10 rounded-xl border-slate-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger className="w-[180px] h-10 rounded-xl border-slate-200">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <SelectValue placeholder="Estado" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los estados</SelectItem>
              <SelectItem value="IN_REVIEW">En Revisión</SelectItem>
              <SelectItem value="ACTIVE">Activos</SelectItem>
              <SelectItem value="REJECTED">Rechazados</SelectItem>
              <SelectItem value="INACTIVE">Inactivos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={orgFilter} onValueChange={(v: any) => setOrgFilter(v)}>
            <SelectTrigger className="w-[220px] h-10 rounded-xl border-slate-200">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <SelectValue placeholder="Organización" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas las organizaciones</SelectItem>
              {organizations.map(org => (
                <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button type="submit" variant="secondary" className="h-10 rounded-xl">
            Filtrar
          </Button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-semibold">Anuncio</TableHead>
              <TableHead className="font-semibold">Organización</TableHead>
              <TableHead className="font-semibold">Horario</TableHead>
              <TableHead className="font-semibold">Días</TableHead>
              <TableHead className="font-semibold">Estado</TableHead>
              <TableHead className="text-right font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-slate-500">Cargando anuncios...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : ads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-8 h-8 text-slate-300" />
                    <p className="text-slate-500">No se encontraron anuncios</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              ads.map((ad) => (
                <TableRow key={ad.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center overflow-hidden border border-slate-800 shadow-inner group-hover:border-primary/50 transition-colors">
                        <Video className="w-5 h-5 text-primary animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900">{ad.name}</p>
                          <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-slate-100 text-slate-500 border-none">MP4</Badge>
                        </div>
                        <p className="text-xs text-slate-500 font-mono">{ad.id.split('-')[0]}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{ad.organizations?.name || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {ad.is_all_day ? (
                      <Badge variant="outline" className="font-normal">Todo el día</Badge>
                    ) : (
                      <div className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-sm">{ad.start_time} - {ad.end_time}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {ad.days_of_week.map(day => (
                        <span key={day} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {day}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(ad.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 rounded-full")}>
                        <MoreVertical className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        </DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => {
                          setSelectedAd(ad);
                          setIsPreviewOpen(true);
                        }}>
                          <Eye className="w-4 h-4 mr-2" /> Previsualizar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {ad.status === 'IN_REVIEW' && (
                          <>
                            <DropdownMenuItem 
                              className="text-emerald-600 focus:text-emerald-600"
                              onClick={() => {
                                setSelectedAd(ad);
                                setReviewAction('ACTIVE');
                                setIsReviewOpen(true);
                              }}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" /> Aprobar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-rose-600 focus:text-rose-600"
                              onClick={() => {
                                setSelectedAd(ad);
                                setReviewAction('REJECTED');
                                setIsReviewOpen(true);
                              }}
                            >
                              <XCircle className="w-4 h-4 mr-2" /> Rechazar
                            </DropdownMenuItem>
                          </>
                        )}
                        {ad.status === 'ACTIVE' && (
                          <DropdownMenuItem 
                            className="text-slate-600"
                            onClick={() => {
                              setSelectedAd(ad);
                              setReviewAction('INACTIVE');
                              setIsReviewOpen(true);
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-2" /> Desactivar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Siguiente <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>{selectedAd?.name}</DialogTitle>
            <DialogDescription>
              Vista previa del contenido multimedia
            </DialogDescription>
          </DialogHeader>
          <div className="aspect-video rounded-xl bg-black overflow-hidden flex items-center justify-center border border-slate-800 shadow-2xl relative group">
            <video 
              src={selectedAd?.media_url} 
              controls 
              className="w-full h-full"
              autoPlay
              playsInline
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Organización</p>
              <p className="font-medium text-slate-900">{selectedAd?.organizations?.name}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Estado</p>
              <div className="mt-1">{selectedAd && getStatusBadge(selectedAd.status)}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'ACTIVE' ? 'Aprobar Anuncio' : 
               reviewAction === 'REJECTED' ? 'Rechazar Anuncio' : 'Desactivar Anuncio'}
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas {
                reviewAction === 'ACTIVE' ? 'aprobar' : 
                reviewAction === 'REJECTED' ? 'rechazar' : 'desactivar'
              } el anuncio "{selectedAd?.name}"?
              {reviewAction === 'ACTIVE' && ' Una vez aprobado, el anuncio podrá ser visualizado en las terminales asignadas.'}
              {reviewAction === 'INACTIVE' && ' El anuncio dejará de mostrarse en las terminales hasta que sea activado nuevamente.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsReviewOpen(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button 
              variant={reviewAction === 'ACTIVE' ? 'default' : 'destructive'}
              onClick={handleReview}
              disabled={isSubmitting}
              className="rounded-xl min-w-[100px]"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
