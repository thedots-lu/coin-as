import { LocaleString } from './locale'

export interface NavChild {
  label: LocaleString
  path: string
  order: number
}

export interface NavItem {
  label: LocaleString
  path: string
  order: number
  children: NavChild[] | null
}

export interface MainNavigation {
  items: NavItem[]
}

export interface FooterColumn {
  heading: LocaleString
  links: Array<{
    label: LocaleString
    path: string
  }>
}

export interface FooterNavigation {
  columns: FooterColumn[]
}
