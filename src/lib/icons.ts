import {
  Award,
  AlertTriangle,
  BarChart3,
  Briefcase,
  Building2,
  Check,
  Coffee,
  GraduationCap,
  HeartHandshake,
  Layers,
  Monitor,
  Network,
  ScrollText,
  Server,
  Settings2,
  Shield,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Target,
  Users,
  Wallet,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react'

// Allowlist of icons available in the visual editor / Firestore-stored
// section data. Adding to this list is a one-line change; we keep it
// curated so we don't pay for the full lucide bundle.
export const FEATURE_ICONS: Record<string, LucideIcon> = {
  Award,
  AlertTriangle,
  BarChart3,
  Briefcase,
  Building2,
  Check,
  Coffee,
  GraduationCap,
  HeartHandshake,
  Layers,
  Monitor,
  Network,
  ScrollText,
  Server,
  Settings2,
  Shield,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Target,
  Users,
  Wallet,
  Wrench,
  Zap,
}

export function resolveFeatureIcon(name: string): LucideIcon | null {
  return FEATURE_ICONS[name] ?? null
}

export const FEATURE_ICON_NAMES = Object.keys(FEATURE_ICONS).sort()
