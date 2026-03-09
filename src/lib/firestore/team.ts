import { collection, query, where, getDocs } from 'firebase/firestore/lite'
import { db } from '../firebase/config'
import { TeamMember } from '../types/team'
import { serializeFirestoreData } from './serialize'

export async function getPublishedTeamMembers(): Promise<TeamMember[]> {
  try {
    const q = query(
      collection(db, 'team_members'),
      where('published', '==', true)
    )
    const snapshot = await getDocs(q)
    const items = snapshot.docs.map(d => (serializeFirestoreData<TeamMember>({ id: d.id, ...d.data() })))
    return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  } catch (error) {
    console.error('Error fetching team members:', error)
    return []
  }
}
