"use client";

import { LucideIcon } from "lucide-react";
import { 
  LayoutDashboard, Target, BookOpen, Radio, MessageCircle, Settings, 
  Crown, Users, TrendingUp, Star, Award, Trophy, Flame,
  CheckCircle, Circle, Lock, Pin, Bell, Heart, Reply, ChevronUp,
  Folder, Home, CreditCard, Zap, Calendar, Clock, Play, Search,
  Filter, Download, Upload, MoreVertical, Plus, Minus, X, Menu,
  ChevronRight, ChevronDown, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  RefreshCw, AlertTriangle, Info, HelpCircle, Eye, EyeOff, Copy,
  ExternalLink, Mail, Phone, MapPin, Building, Briefcase, DollarSign,
  BarChart2, PieChart, Activity, Zap as Lightning, Gift, Share2,
  Bookmark, BookmarkPlus, Flag, ThumbsUp, MessageSquare, Send,
  UserPlus, UserMinus, LogIn, LogOut, ShoppingCart, Wallet,
  GraduationCap, Video, Image, File, FileText, FilePlus, FolderPlus,
  Trash2, Edit2, Save, Loader, Check, AlertCircle, XCircle, MinusCircle, PlusCircle,
  Search as SearchIcon, Bell as BellIcon, Sun, Moon, Monitor, Tablet, Smartphone,
  Wifi, WifiOff, Cloud, CloudOff, Database, Server, Cpu, HardDrive, Shield, Link
} from "lucide-react";

type IconName = 
  | "dashboard" | "target" | "book" | "live" | "chat" | "settings" | "crown"
  | "users" | "file" | "trending" | "star" | "award" | "trophy" | "flame" | "shield" | "link"
  | "check" | "circle" | "lock" | "pin" | "bell" | "heart" | "reply" | "upvote"
  | "folder" | "home" | "card" | "zap" | "calendar" | "clock" | "play" | "search"
  | "filter" | "download" | "upload" | "more" | "plus" | "minus" | "close" | "menu"
  | "chevron-right" | "chevron-down" | "arrow-up" | "arrow-down" | "arrow-left" | "arrow-right"
  | "refresh" | "alert" | "info" | "help" | "eye" | "eye-off" | "copy"
  | "external" | "mail" | "phone" | "location" | "building" | "briefcase" | "rupee"
  | "bar-chart" | "pie-chart" | "activity" | "lightning" | "gift" | "share"
  | "bookmark" | "bookmark-plus" | "flag" | "thumbs-up" | "message" | "send"
  | "user-plus" | "user-minus" | "login" | "logout" | "cart" | "wallet"
  | "graduation" | "video" | "image" | "file-text" | "file-plus" | "folder-plus"
  | "trash" | "edit" | "save" | "loader" | "check-circle" | "alert-circle" | "x-circle"
  | "sun" | "moon" | "monitor" | "tablet" | "smartphone"
  | "wifi" | "wifi-off" | "cloud" | "cloud-off" | "database" | "server" | "cpu" | "drive";

const iconMap: Record<IconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  target: Target,
  book: BookOpen,
  live: Radio,
  chat: MessageCircle,
  settings: Settings,
  crown: Crown,
  users: Users,
  file: FileText,
  trending: TrendingUp,
  star: Star,
  award: Award,
  trophy: Trophy,
  flame: Flame,
  shield: Shield,
  check: CheckCircle,
  circle: Circle,
  lock: Lock,
  pin: Pin,
  bell: Bell,
  heart: Heart,
  reply: Reply,
  upvote: ChevronUp,
  folder: Folder,
  home: Home,
  card: CreditCard,
  zap: Zap,
  calendar: Calendar,
  clock: Clock,
  play: Play,
  search: Search,
  filter: Filter,
  download: Download,
  upload: Upload,
  more: MoreVertical,
  plus: Plus,
  minus: Minus,
  close: X,
  menu: Menu,
  "chevron-right": ChevronRight,
  "chevron-down": ChevronDown,
  "arrow-up": ArrowUp,
  "arrow-down": ArrowDown,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  refresh: RefreshCw,
  alert: AlertTriangle,
  info: HelpCircle,
  help: HelpCircle,
  eye: Eye,
  "eye-off": EyeOff,
  copy: Copy,
  external: ExternalLink,
  mail: Mail,
  phone: Phone,
  location: MapPin,
  building: Building,
  briefcase: Briefcase,
  rupee: DollarSign,
  "bar-chart": BarChart2,
  "pie-chart": PieChart,
  activity: Activity,
  lightning: Lightning,
  gift: Gift,
  share: Share2,
  bookmark: Bookmark,
  "bookmark-plus": BookmarkPlus,
  flag: Flag,
  "thumbs-up": ThumbsUp,
  message: MessageSquare,
  send: Send,
  "user-plus": UserPlus,
  "user-minus": UserMinus,
  login: LogIn,
  logout: LogOut,
  cart: ShoppingCart,
  wallet: Wallet,
  graduation: GraduationCap,
  video: Video,
  image: Image,
  "file-text": FileText,
  "file-plus": FilePlus,
  "folder-plus": FolderPlus,
  trash: Trash2,
  edit: Edit2,
  save: Save,
  loader: Loader,
  "check-circle": CheckCircle,
  "alert-circle": AlertCircle,
  "x-circle": XCircle,
  sun: Sun,
  moon: Moon,
  monitor: Monitor,
  tablet: Tablet,
  smartphone: Smartphone,
  wifi: Wifi,
  "wifi-off": WifiOff,
  cloud: Cloud,
  "cloud-off": CloudOff,
  database: Database,
  server: Server,
  cpu: Cpu,
  drive: HardDrive,
  link: Link,
};

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export default function Icon({ name, size = 20, className = "", strokeWidth = 1.5 }: IconProps) {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    return null;
  }
  
  return <IconComponent size={size} className={className} strokeWidth={strokeWidth} />;
}

export { iconMap };
export type { IconName };
