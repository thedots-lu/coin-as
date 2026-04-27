import { collection, getDocs } from 'firebase/firestore/lite'
import { db } from '../firebase/config'
import { CustomerLogo } from '../types/customer-logo'
import { serializeFirestoreData } from './serialize'

export async function getVisibleCustomerLogos(): Promise<CustomerLogo[]> {
  try {
    const snapshot = await getDocs(collection(db, 'customer_logos'))
    const items = snapshot.docs.map((d) =>
      serializeFirestoreData<CustomerLogo>({ id: d.id, ...d.data() }),
    )
    return items
      .filter((l) => l.visible !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  } catch (error) {
    console.error('Error fetching customer logos:', error)
    return []
  }
}
