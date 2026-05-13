import { Metadata } from 'next'
import { getCuratedVideos } from '@/lib/firestore/youtube-videos'
import { getPage } from '@/lib/firestore/pages'
import { generatePageMetadata } from '@/lib/utils/metadata'
import HubBanner from '@/components/knowledge-hub/HubBanner'
import YoutubeVideos from '@/components/sections/YoutubeVideos'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('resources-videos')
  return generatePageMetadata(page?.seo, page?.title, { path: '/resources/videos' })
}

export default async function VideosPage() {
  const videos = await getCuratedVideos()

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
