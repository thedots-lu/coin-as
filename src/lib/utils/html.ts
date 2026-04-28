import sanitizeHtml from 'sanitize-html'

export function isHtml(s: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(s)
}

export function sanitizeRichHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'p', 'br', 'strong', 'em', 'u', 'code', 'pre',
      'h2', 'h3', 'h4',
      'ul', 'ol', 'li',
      'blockquote', 'hr',
      'a', 'img',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }),
    },
  })
}
