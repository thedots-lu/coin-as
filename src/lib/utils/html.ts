import sanitizeHtml from 'sanitize-html'

export function isHtml(s: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(s)
}

export function sanitizeRichHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre', 'span',
      'h2', 'h3', 'h4',
      'ul', 'ol', 'li',
      'blockquote', 'hr',
      'a', 'img',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      // Allow inline `style` on text-bearing tags so we can keep the
      // text-align / color attributes produced by TipTap. The set of
      // allowed CSS properties is restricted via `allowedStyles` below.
      p: ['style'],
      h2: ['style'],
      h3: ['style'],
      h4: ['style'],
      span: ['style'],
      li: ['style'],
    },
    allowedStyles: {
      '*': {
        // Hex (#abc, #aabbcc, #aabbccdd), rgb()/rgba(), or CSS named colours.
        color: [
          /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,
          /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/,
          /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[0-9.]+\s*\)$/,
          /^[a-zA-Z]+$/,
        ],
        'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
      },
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }),
    },
  })
}
