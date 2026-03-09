import { collection, query, where, getDocs } from 'firebase/firestore/lite'
import { db } from '../firebase/config'
import { Testimonial } from '../types/testimonial'
import { serializeFirestoreData } from './serialize'

export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  try {
    const q = query(
      collection(db, 'testimonials'),
      where('published', '==', true)
    )
    const snapshot = await getDocs(q)
    const items = snapshot.docs.map(d => (serializeFirestoreData<Testimonial>({ id: d.id, ...d.data() })))
    return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return []
  }
}
