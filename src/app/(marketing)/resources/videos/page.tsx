import { Metadata } from 'next'
import { getCoinYoutubeVideos } from '@/lib/youtube'
import { getPage } from '@/lib/firestore/pages'
import { generatePageMetadata } from '@/lib/utils/metadata'
import HubBanner from '@/components/knowledge-hub/HubBanner'
import YoutubeVideos from '@/components/sections/YoutubeVideos'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('resources-videos')
  return generatePageMetadata(page?.seo, page?.title, { path: '/resources/videos' })
}

export default async function VideosPage() {
  const videos = await getCoinYoutubeVideos()

  return (
    <>
      <HubBanner title="Videos" backToHub />
      <section className="py-12 md:py-16 bg-white">
        <div className="container-padding max-w-6xl mx-auto">
          <YoutubeVideos videos={videos} />
        </div>
      </section>
    </>
  )
}
