import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
  Building2, 
  Layers,
  MessageSquare,
  Users, 
  Monitor, 
  BarChart3, 
  Play,
  Settings, 
  LogOut, 
  Menu,
  X,
  Bell,
  Search,
  ShieldCheck
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard/admin' },
    { icon: Building2, label: 'Organizaciones', path: '/dashboard/admin/organizations' },
    { icon: Layers, label: 'Grupos', path: '/dashboard/admin/terminal-groups' },
    { icon: Monitor, label: 'Terminales', path: '/dashboard/admin/terminals' },
    { icon: BarChart3, label: 'Transacciones', path: '/dashboard/admin/transactions' },
    { icon: Play, label: 'Anuncios', path: '/dashboard/admin/ads' },
    { icon: MessageSquare, label: 'Mensajería', path: '/dashboard/admin/messages' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login/admin');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200">
        <div className="p-6">
          <div className="bg-slate-900 p-3 rounded-xl inline-block mb-2">
            <img 
              src="https://serviciosncf.portaldom.com.do/ncf_remote_portal/static/src/img/ncflogo.png" 
              alt="ECRT Logo" 
              className="h-8"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Admin Portal</p>
        </div>

        <ScrollArea className="flex-1 px-4">
          <nav className="space-y-1 py-4">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-primary text-white shadow-md shadow-primary/20' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="p-4 mt-auto">
          <Separator className="mb-4" />
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-primary font-bold">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.email}</p>
              <p className="text-xs text-slate-500">Administrador</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-slate-600 hover:text-destructive hover:bg-destructive/5 rounded-xl"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 z-20">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden" 
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
            <div className="hidden md:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl w-80">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="bg-transparent border-none focus:ring-0 text-sm w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative text-slate-500 hover:bg-slate-100 rounded-xl">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
            </Button>
            <Separator orientation="vertical" className="h-8 mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">Admin ECRT</p>
                <p className="text-xs text-slate-500">En línea</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <motion.aside 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col"
          >
            {/* Same sidebar content for mobile */}
            <div className="p-6 flex items-center justify-between">
              <div className="bg-slate-900 p-2 rounded-lg">
                <img 
                  src="https://serviciosncf.portaldom.com.do/ncf_remote_portal/static/src/img/ncflogo.png" 
                  alt="ECRT Logo" 
                  className="h-6"
                  referrerPolicy="no-referrer"
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-6 h-6" />
              </Button>
            </div>
            <ScrollArea className="flex-1 px-4">
              <nav className="space-y-1 py-4">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-primary text-white shadow-md shadow-primary/20' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </ScrollArea>
            <div className="p-4 border-t border-slate-100">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-slate-600 hover:text-destructive hover:bg-destructive/5 rounded-xl"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
                <span>Cerrar Sesión</span>
              </Button>
            </div>
          </motion.aside>
        </div>
      )}
    </div>
  );
}
