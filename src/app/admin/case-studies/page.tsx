import ArticlesAdmin from '@/components/admin/articles/ArticlesAdmin'

export default function AdminCaseStudiesPage() {
  return (
    <ArticlesAdmin
      kind="case_study"
      pageTitle="Case Studies"
      noun="Case Study"
      revalidatePath="/resources/case-studies"
    />
  )
}
