import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/src/services/auth.service.ts';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, Lock, Mail, Building2, ShieldCheck, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  type?: 'organization' | 'admin';
}

export default function LoginPage({ type = 'organization' }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    setIsLoading(true);
    try {
      let response;
      if (type === 'admin') {
        response = await authService.loginAdmin({ email, password });
      } else {
        response = await authService.loginOrganization({ email, password });
      }

      if (response.success) {
        login(response.data);
        toast.success(response.message || 'Login exitoso');
        
        // Redirect logic based on role and type
        const { user, organization } = response.data;
        if (user.role === 'ADMIN') {
          navigate('/dashboard/admin');
        } else if (user.role === 'ORG_USER' && organization) {
          if (organization.type === 'COMMERCE') {
            navigate('/dashboard/commerce');
          } else {
            navigate('/dashboard/agency');
          }
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error al iniciar sesión';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Left Side: Branding & Info */}
      <div className="hidden md:flex md:w-1/2 bg-slate-50 relative items-center justify-center p-12 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-3xl" />
        
        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block p-4 bg-slate-900 rounded-2xl mb-8 shadow-xl">
              <img 
                src="https://serviciosncf.portaldom.com.do/ncf_remote_portal/static/src/img/ncflogo.png" 
                alt="ECRT Logo" 
                className="h-12"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
              Potencia tu marca con <span className="text-primary">ECRT Ads</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              La plataforma líder en gestión de publicidad digital para comercios y agencias. 
              Controla tus anuncios, gestiona terminales y analiza resultados en tiempo real.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-slate-900">Comercios</h3>
                <p className="text-sm text-slate-500">Gestiona tus tiendas y anunciantes.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="font-semibold text-slate-900">Agencias</h3>
                <p className="text-sm text-slate-500">Administra campañas para tus clientes.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="md:hidden flex justify-center mb-8">
            <div className="p-3 bg-slate-900 rounded-xl shadow-lg">
              <img 
                src="https://serviciosncf.portaldom.com.do/ncf_remote_portal/static/src/img/ncflogo.png" 
                alt="ECRT Logo" 
                className="h-10"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {type === 'admin' ? 'Portal Administrativo' : 'Bienvenido'}
            </h2>
            <p className="text-slate-500">
              {type === 'admin' 
                ? 'Acceso exclusivo para administradores de ECRT.' 
                : 'Ingresa tus credenciales para acceder al portal.'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="nombre@empresa.com" 
                    className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-primary"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <a href="#" className="text-sm font-medium text-primary hover:underline">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-primary"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600"
              >
                Recordar sesión
              </label>
            </div>

            <Button 
              type="submit" 
              className={`w-full h-12 rounded-xl text-white font-semibold text-lg transition-all active:scale-[0.98] ${
                type === 'admin' ? 'bg-slate-900 hover:bg-slate-800' : 'bg-primary hover:bg-primary/90'
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {type === 'admin' ? 'Acceder como Admin' : 'Iniciar Sesión'} <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              {type === 'admin' ? (
                <button onClick={() => navigate('/login')} className="font-semibold text-primary hover:underline">
                  Volver al portal de organizaciones
                </button>
              ) : (
                <>
                  ¿No tienes una cuenta? {' '}
                  <a href="#" className="font-semibold text-secondary hover:underline">
                    Contacta con soporte
                  </a>
                </>
              )}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

