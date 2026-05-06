import ArticlesAdmin from '@/components/admin/articles/ArticlesAdmin'

export default function AdminArticlesPage() {
  return (
    <ArticlesAdmin
      kind="resource"
      pageTitle="Articles"
      noun="Article"
      revalidatePath="/resources/articles"
    />
  )
}
