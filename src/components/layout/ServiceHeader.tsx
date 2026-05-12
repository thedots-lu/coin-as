import ServiceBreadcrumb from '@/components/layout/ServiceBreadcrumb'
import ServiceBanner from '@/components/sections/ServiceBanner'

interface Props {
  imageUrl: string | null | undefined
  serviceTitle: string
}

/**
 * Orchestrates the page header for an individual service.
 *
 * - With an image, the banner takes over and renders the breadcrumb + title
 *   over the photo; the classic breadcrumb bar isn't shown.
 * - Without an image, the classic breadcrumb bar is shown. In the visual
 *   editor the banner placeholder also renders so the admin can upload —
 *   ServiceBanner returns null on the public site when there's no image.
 */
export default function ServiceHeader({ imageUrl, serviceTitle }: Props) {
  return (
    <>
      {!imageUrl && <ServiceBreadcrumb serviceTitle={serviceTitle} />}
      <ServiceBanner imageUrl={imageUrl} serviceTitle={serviceTitle} />
    </>
  )
}
