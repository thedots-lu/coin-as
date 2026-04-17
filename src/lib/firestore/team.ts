import { collection, query, where, getDocs } from 'firebase/firestore/lite'
import { db } from '../firebase/config'
import { TeamMember, normalizeTeamMemberName } from '../types/team'
import { serializeFirestoreData } from './serialize'

export const TEAM_COLLECTION = 'team_members'

export async function getPublishedTeamMembers(): Promise<TeamMember[]> {
  try {
    const q = query(
      collection(db, TEAM_COLLECTION),
      where('published', '==', true)
    )
    const snapshot = await getDocs(q)
    const items = snapshot.docs.map(d => {
      const raw = serializeFirestoreData<TeamMember>({ id: d.id, ...d.data() })
      return { ...raw, name: normalizeTeamMemberName(raw.name) }
    })
    return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  } catch (error) {
    console.error('Error fetching team members:', error)
    return []
  }
}
