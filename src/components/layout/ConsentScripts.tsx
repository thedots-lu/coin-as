'use client'

import { useEffect } from 'react'

interface Props {
  gtmId: string
  clarityId: string
}

function injectGTM(id: string) {
  if (document.getElementById('gtm-script')) return
  const script = document.createElement('script')
  script.id = 'gtm-script'
  script.async = true
  script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${id}');`
  document.head.appendChild(script)
}

function injectClarity(id: string) {
  if (document.getElementById('clarity-script')) return
  const script = document.createElement('script')
  script.id = 'clarity-script'
  script.async = true
  script.innerHTML = `(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "${id}");`
  document.head.appendChild(script)
}

export default function ConsentScripts({ gtmId, clarityId }: Props) {
  useEffect(() => {
    const consent = localStorage.getItem('coin-cookie-consent')

    if (consent === 'accepted') {
      if (gtmId) injectGTM(gtmId)
      if (clarityId) injectClarity(clarityId)
    }

    // Also listen for real-time accept from the banner
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail === 'accepted') {
        if (gtmId) injectGTM(gtmId)
        if (clarityId) injectClarity(clarityId)
      }
    }
    window.addEventListener('coin:consent', handler)
    return () => window.removeEventListener('coin:consent', handler)
  }, [gtmId, clarityId])

  return null
}
