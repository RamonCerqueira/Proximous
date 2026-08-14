import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Compass,
  Radio
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
    { path: '/now', label: 'Agora', icon: Radio, isLive: true },
    { path: '/feed', label: 'Momentos', icon: Compass },
    { path: '/matches', label: 'Matches', icon: Heart },
    { path: '/messages', label: 'Chat', icon: MessageCircle },
  ];

  const userMenuItems = [
    { path: '/profile', label: 'Meu Perfil', icon: User },
    { path: '/feed', label: 'Feed de Momentos', icon: Compass },
    { path: '/premium', label: 'Proximous VIP', icon: Crown, isGold: true },
    { path: '/settings', label: 'Configurações', icon: Settings },
    { path: '/support', label: 'Suporte & Ajuda', icon: HelpCircle },
  ];

  if (user?.type === 'admin') {
    userMenuItems.unshift({ path: '/admin', label: 'Painel Admin', icon: Shield });
  }

  return (
    <div className="min-h-screen bg-[#070611] text-white flex flex-col font-sans selection:bg-[#FF4FA3] selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#30204D] bg-[#070611]/85 backdrop-blur-2xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex h-16 sm:h-20 items-center justify-between gap-4">
            
            {/* Logo Brand */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-tr from-[#9B20F0] via-[#D414A8] to-[#FF2B68] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(214,20,168,0.4)] group-hover:scale-105 transition-transform duration-300">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-[#A020F0] to-[#FF4FA3] bg-clip-text text-transparent">
                  Proximous
                </span>
                <span className="text-[9px] uppercase font-extrabold tracking-widest text-[#AAA5BA] -mt-1 hidden sm:block">
                  Social Discovery
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Header with Animated Sliding Pill */}
            <nav className="hidden md:flex items-center space-x-1 bg-[#0D0A1C] p-1.5 rounded-full border border-[#30204D] shadow-inner relative">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-black transition-colors duration-300 z-10 ${
                      active ? 'text-white' : 'text-[#AAA5BA] hover:text-white'
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeDesktopTabGlow"
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-[#9B20F0] via-[#D414A8] to-[#FF2B68] shadow-[0_0_20px_rgba(214,20,168,0.5)] -z-10"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#AAA5BA]'}`} />
                    <span>{item.label}</span>
                    {item.isLive && (
                      <span className="w-2 h-2 rounded-full bg-[#35E38A] animate-ping ml-0.5" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* User Profile & Actions */}
            <div className="flex items-center space-x-2.5">
              {/* Premium VIP Badge indicator */}
              <Link to="/premium" className="hidden sm:inline-flex">
                <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 font-extrabold text-xs px-3.5 py-1.5 rounded-full hover:opacity-90 shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center gap-1.5 cursor-pointer">
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
                className="w-10 h-10 rounded-full border border-[#30204D] bg-[#0D0A1C] hover:border-[#9B20F0] transition-all text-white relative shadow-md"
              >
                <Bell className="h-4 w-4 text-[#FF4FA3]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF2B68] text-white font-black text-[9px] rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {/* Profile Avatar Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden ring-2 ring-[#9B20F0] hover:ring-[#FF4FA3] transition-all shadow-lg">
                    <Avatar className="h-full w-full rounded-full">
                      <AvatarImage 
                        src={user?.profile_photo_url || generateAvatarUrl(user?.name)} 
                        alt={user?.name} 
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-purple-950 text-white font-bold">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-2 bg-[#100D21] border border-[#30204D] text-white rounded-2xl shadow-2xl" align="end">
                  <div className="flex items-center gap-3 p-2.5 bg-[#16112A] rounded-xl mb-1 border border-[#30204D]">
                    <Avatar className="h-10 w-10 rounded-xl">
                      <AvatarImage src={user?.profile_photo_url || generateAvatarUrl(user?.name)} />
                      <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <p className="font-extrabold text-sm truncate text-white">{user?.name}</p>
                      <p className="text-xs text-[#AAA5BA] truncate">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-[#30204D]" />
                  {userMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem key={item.path} asChild>
                        <Link to={item.path} className="flex items-center px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer hover:bg-[#16112A] transition-colors text-slate-200 hover:text-white">
                          <Icon className={`mr-2.5 h-4 w-4 ${item.isGold ? 'text-amber-400' : 'text-[#FF4FA3]'}`} />
                          <span>{item.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator className="bg-[#30204D]" />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-[#FF3D71] focus:text-[#FF3D71] px-3 py-2 rounded-xl text-xs font-bold hover:bg-[#FF3D71]/10">
                    <LogOut className="mr-2.5 h-4 w-4" />
                    <span>Sair da conta</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Drawer Trigger */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden w-10 h-10 rounded-full border border-[#30204D] bg-[#0D0A1C] text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#30204D] bg-[#070611]/95 backdrop-blur-2xl px-4 py-4 space-y-2 animate-in slide-in-from-top-2">
            <nav className="space-y-1.5">
              {navigationItems.concat([
                { path: '/feed', label: 'Feed de Momentos', icon: Compass },
                { path: '/profile', label: 'Meu Perfil', icon: User }
              ]).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-extrabold transition-all ${
                      active
                        ? 'bg-gradient-to-r from-[#9B20F0] to-[#D414A8] text-white shadow-lg'
                        : 'text-[#AAA5BA] hover:bg-[#16112A] hover:text-white'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-28 md:pb-8">
        {children}
      </main>

      {/* MOBILE FLOATING BOTTOM DOCK WITH ANIMATED SLIDING GLOW PILL */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 sm:left-6 sm:right-6 z-50 max-w-md mx-auto">
        <div className="bg-[#0D0A1C]/95 rounded-full p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-[#30204D] backdrop-blur-2xl">
          <nav className="flex items-center justify-around relative">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex flex-col items-center justify-center py-1.5 px-1.5 sm:px-2.5 rounded-full transition-all duration-300 z-10 flex-1 min-w-0 ${
                    active ? 'text-white font-black' : 'text-[#AAA5BA] hover:text-white font-semibold'
                  }`}
                >
                  {/* Sliding Animated Glow Background Pill using Framer Motion layoutId */}
                  {active && (
                    <motion.div
                      layoutId="activeMobileTabGlow"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[#9B20F0] via-[#D414A8] to-[#FF2B68] shadow-[0_0_25px_rgba(214,20,168,0.6)] -z-10"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )}

                  <motion.div
                    animate={active ? { scale: 1.15 } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="relative flex items-center justify-center"
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#AAA5BA]'}`} />
                    {item.isLive && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#35E38A] animate-ping" />
                    )}
                  </motion.div>

                  <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                    {item.label}
                  </span>
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
