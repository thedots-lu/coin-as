import { Metadata } from 'next'
import { getCoinYoutubeVideos } from '@/lib/youtube'
import HubBanner from '@/components/knowledge-hub/HubBanner'
import YoutubeVideos from '@/components/sections/YoutubeVideos'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Videos',
  description: 'All videos from the COIN Business Continuity YouTube channel, playable directly on the site.',
  alternates: { canonical: 'https://coin-bc.com/knowledge-hub/videos' },
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
