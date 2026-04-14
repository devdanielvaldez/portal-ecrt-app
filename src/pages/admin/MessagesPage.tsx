import React, { useState, useEffect } from 'react';
import { 
  Send, 
  MessageSquare, 
  Monitor, 
  Layers, 
  Building2, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { messageService } from '@/src/services/message.service';
import { organizationService, Organization } from '@/src/services/organization.service';
import { terminalService, Terminal } from '@/src/services/terminal.service';
import { terminalGroupService, TerminalGroup } from '@/src/services/terminal-group.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

export default function MessagesPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [groups, setTerminalGroups] = useState<TerminalGroup[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [targetType, setTargetType] = useState<'TERMINAL' | 'GROUP'>('TERMINAL');
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    terminal_id: '',
    group_id: ''
  });

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const response = await organizationService.getAll({ type: 'COMMERCE' });
        if (response.success) {
          setOrganizations(response.data);
        }
      } catch (error) {
        toast.error('Error al cargar organizaciones');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrgs();
  }, []);

  useEffect(() => {
    if (!selectedOrgId) return;

    const fetchTargets = async () => {
      try {
        const [termResponse, groupResponse] = await Promise.all([
          terminalService.getAll({ organization_id: selectedOrgId }),
          terminalGroupService.getAll({ organization_id: selectedOrgId })
        ]);

        if (termResponse.success) setTerminals(termResponse.data);
        if (groupResponse.success) setTerminalGroups(groupResponse.data);
      } catch (error) {
        toast.error('Error al cargar terminales o grupos');
      }
    };

    fetchTargets();
    // Reset selections when org changes
    setFormData(prev => ({ ...prev, terminal_id: '', group_id: '' }));
  }, [selectedOrgId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast.error('Por favor completa el título y el contenido');
      return;
    }

    if (targetType === 'TERMINAL' && !formData.terminal_id) {
      toast.error('Por favor selecciona una terminal');
      return;
    }

    if (targetType === 'GROUP' && !formData.group_id) {
      toast.error('Por favor selecciona un grupo');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        terminal_id: targetType === 'TERMINAL' ? formData.terminal_id : null,
        group_id: targetType === 'GROUP' ? formData.group_id : null
      };

      const response = await messageService.send(payload);
      if (response.success) {
        toast.success('Mensaje enviado correctamente');
        setFormData({
          title: '',
          content: '',
          terminal_id: '',
          group_id: ''
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al enviar el mensaje');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900">Mensajería Directa</h1>
        <p className="text-slate-500">Envía notificaciones y alertas en tiempo real a las tablets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <CardTitle>Redactar Mensaje</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                El mensaje aparecerá como una notificación emergente en el dispositivo.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <Label>1. Seleccionar Destinatario</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="org" className="text-xs text-slate-500 uppercase font-bold">Comercio</Label>
                      <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                        <SelectTrigger className="h-11 rounded-xl border-slate-200">
                          <Building2 className="w-4 h-4 mr-2 text-slate-400" />
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
                      <Label className="text-xs text-slate-500 uppercase font-bold">Tipo de Envío</Label>
                      <RadioGroup 
                        value={targetType} 
                        onValueChange={(v: any) => setTargetType(v)}
                        className="flex gap-4 h-11 items-center"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="TERMINAL" id="t-term" />
                          <Label htmlFor="t-term" className="cursor-pointer">Terminal</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="GROUP" id="t-group" />
                          <Label htmlFor="t-group" className="cursor-pointer">Grupo</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  {selectedOrgId && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="target" className="text-xs text-slate-500 uppercase font-bold">
                        {targetType === 'TERMINAL' ? 'Seleccionar Terminal' : 'Seleccionar Grupo'}
                      </Label>
                      <Select 
                        value={targetType === 'TERMINAL' ? formData.terminal_id : formData.group_id} 
                        onValueChange={(v) => setFormData(prev => ({
                          ...prev, 
                          [targetType === 'TERMINAL' ? 'terminal_id' : 'group_id']: v
                        }))}
                      >
                        <SelectTrigger className="h-11 rounded-xl border-slate-200">
                          {targetType === 'TERMINAL' ? <Monitor className="w-4 h-4 mr-2 text-slate-400" /> : <Layers className="w-4 h-4 mr-2 text-slate-400" />}
                          <SelectValue placeholder={`Seleccionar ${targetType === 'TERMINAL' ? 'terminal' : 'grupo'}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {targetType === 'TERMINAL' ? (
                            terminals.map(t => (
                              <SelectItem key={t.id} value={t.id}>{t.name} ({t.serial_number})</SelectItem>
                            ))
                          ) : (
                            groups.map(g => (
                              <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <Label>2. Contenido del Mensaje</Label>
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-xs text-slate-500 uppercase font-bold">Título</Label>
                    <Input 
                      id="title"
                      placeholder="Ej. Mantenimiento Programado"
                      className="h-11 rounded-xl border-slate-200"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-xs text-slate-500 uppercase font-bold">Mensaje</Label>
                    <Textarea 
                      id="content"
                      placeholder="Escribe aquí el mensaje que verá el usuario..."
                      className="min-h-[120px] rounded-xl border-slate-200 resize-none"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !selectedOrgId}
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 px-8 shadow-lg shadow-slate-200"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Send className="w-5 h-5 mr-2" />
                  )}
                  Enviar Mensaje
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Info Section */}
        <div className="space-y-6">
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Información
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <p>Los mensajes se envían instantáneamente si el dispositivo está en línea.</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <p>Si el dispositivo está desconectado, recibirá el mensaje al reconectarse.</p>
              </div>
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <p>Solo se conservan los últimos 20 mensajes por terminal.</p>
              </div>
            </CardContent>
          </Card>

          <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6">
            <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Vista Previa
            </h4>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Info className="w-3 h-3 text-white" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notificación Sistema</span>
              </div>
              <p className="font-bold text-slate-900 text-sm mb-1">{formData.title || 'Título del Mensaje'}</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                {formData.content || 'Aquí aparecerá el contenido de tu mensaje una vez que lo redactes...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
