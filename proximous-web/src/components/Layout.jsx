import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useTheme } from '../hooks/useTheme.jsx';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Bell,
  Heart, 
  MessageCircle, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Home,
  Search,
  Crown,
  HelpCircle,
  Shield,
  Sun,
  Moon,
  Sparkles,
  Compass
} from 'lucide-react';
import { getUserInitials, generateAvatarUrl } from '../lib/auth';
import NotificationsDrawer from './NotificationsDrawer';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);


  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigationItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/discover', label: 'Descobrir', icon: Search },
    { path: '/feed', label: 'Momentos', icon: Compass },
    { path: '/matches', label: 'Matches', icon: Heart },
    { path: '/messages', label: 'Mensagens', icon: MessageCircle },
  ];

  const userMenuItems = [
    { path: '/profile', label: 'Meu Perfil', icon: User },
    { path: '/premium', label: 'Proximous VIP', icon: Crown, isGold: true },
    { path: '/settings', label: 'Configurações', icon: Settings },
    { path: '/support', label: 'Suporte & Ajuda', icon: HelpCircle },
  ];

  if (user?.type === 'admin') {
    userMenuItems.unshift({ path: '/admin', label: 'Painel Admin', icon: Shield });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex h-16 sm:h-20 items-center justify-between gap-4">
            
            {/* Logo Brand */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 proximous-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform duration-300">
                <Heart className="w-5 h-5 text-white fill-white/20" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight luxury-gradient-text">
                  Proximous
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground -mt-1 hidden sm:block">
                  Social Discovery
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Header */}
            <nav className="hidden md:flex items-center space-x-1.5 lg:space-x-2 bg-card/50 p-1.5 rounded-2xl border border-border/50 backdrop-blur-md">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'animate-pulse' : ''}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Profile & Actions */}
            <div className="flex items-center space-x-2.5">
              {/* Premium VIP Badge indicator */}
              <Link to="/premium" className="hidden sm:inline-flex">
                <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 font-extrabold text-xs px-3 py-1.5 rounded-xl hover:opacity-90 shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer">
                  <Crown className="w-3.5 h-3.5 fill-amber-200 text-amber-100" />
                  <span>VIP</span>
                </Badge>
              </Link>

              {/* Notifications Bell Icon Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNotifDrawerOpen(true)}
                title="Central de Notificações"
                className="w-10 h-10 rounded-2xl border border-border/60 bg-card/60 hover:bg-accent/60 transition-all text-foreground relative"
              >
                <Bell className="h-4 w-4 text-purple-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-[9px] rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {/* Theme Toggle Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                title={isDark ? "Modo Luxo Claro" : "Modo Luxo Escuro"}
                className="w-10 h-10 rounded-2xl border border-border/60 bg-card/60 hover:bg-accent/60 transition-all text-foreground"
              >
                {isDark ? (
                  <Sun className="h-4 w-4 text-amber-400 hover:rotate-45 transition-transform" />
                ) : (
                  <Moon className="h-4 w-4 text-purple-600 hover:-rotate-12 transition-transform" />
                )}
              </Button>


              {/* Profile Avatar Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-11 w-11 rounded-2xl p-0 overflow-hidden ring-2 ring-purple-500/30 hover:ring-purple-500 transition-all">
                    <Avatar className="h-full w-full rounded-2xl">
                      <AvatarImage 
                        src={user?.profile_photo_url || generateAvatarUrl(user?.name)} 
                        alt={user?.name} 
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-purple-900 text-purple-100 font-bold">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-2 luxury-glass-card rounded-2xl" align="end">
                  <div className="flex items-center gap-3 p-2.5 bg-accent/40 rounded-xl mb-1 border border-border/40">
                    <Avatar className="h-10 w-10 rounded-xl">
                      <AvatarImage src={user?.profile_photo_url || generateAvatarUrl(user?.name)} />
                      <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <p className="font-extrabold text-sm truncate text-foreground">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-border/60" />
                  {userMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem key={item.path} asChild>
                        <Link to={item.path} className="flex items-center px-3 py-2 rounded-xl text-sm font-semibold cursor-pointer hover:bg-accent transition-colors">
                          <Icon className={`mr-2.5 h-4 w-4 ${item.isGold ? 'text-amber-500' : 'text-purple-500'}`} />
                          <span>{item.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator className="bg-border/60" />
                  <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer px-3 py-2 rounded-xl text-sm font-semibold">
                    <Sparkles className="mr-2.5 h-4 w-4 text-amber-400" />
                    <span>{isDark ? 'Tema Claro Luxo' : 'Tema Escuro Luxo'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/60" />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive px-3 py-2 rounded-xl text-sm font-semibold">
                    <LogOut className="mr-2.5 h-4 w-4" />
                    <span>Sair da conta</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Drawer Trigger */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden w-10 h-10 rounded-2xl border border-border/60 bg-card/60"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-2xl px-4 py-4 space-y-2 animate-in slide-in-from-top-2">
            <nav className="space-y-1.5">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                      active
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Floating Bottom Dock */}
      <div className="md:hidden fixed bottom-3 left-4 right-4 z-50">
        <div className="luxury-glass-card rounded-3xl p-1.5 shadow-2xl border border-purple-500/20 backdrop-blur-2xl">
          <nav className="flex items-center justify-around">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 scale-105'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-extrabold mt-1">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <NotificationsDrawer
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
        onUnreadChange={setUnreadCount}
      />
    </div>
  );
};


export default Layout;


