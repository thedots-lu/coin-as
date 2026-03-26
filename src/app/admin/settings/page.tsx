'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { dbAdmin as db } from '@/lib/firebase/config'
import { SiteConfig } from '@/lib/types/site-config'
import { createEmptyLocaleString, LocaleString } from '@/lib/types/locale'
import LocaleEditor from '@/components/admin/LocaleEditor'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [siteName, setSiteName] = useState('')
  const [tagline, setTagline] = useState<LocaleString>(createEmptyLocaleString())
  const [contactEmail, setContactEmail] = useState('')
  const [phoneNL, setPhoneNL] = useState('')
  const [phoneLU, setPhoneLU] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyKvk, setCompanyKvk] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [footerDescription, setFooterDescription] = useState<LocaleString>(createEmptyLocaleString())
  const [copyright, setCopyright] = useState<LocaleString>(createEmptyLocaleString())

  useEffect(() => {
    async function fetchConfig() {
      try {
        const docRef = doc(db, 'site_config', 'global')
        const snapshot = await getDoc(docRef)
        if (snapshot.exists()) {
          const data = snapshot.data() as SiteConfig
          setSiteName(data.siteName || '')
          setTagline(data.tagline || createEmptyLocaleString())
          setContactEmail(data.contactEmail || '')
          setPhoneNL(data.phoneNL || '')
          setPhoneLU(data.phoneLU || '')
          setLinkedinUrl(data.linkedinUrl || '')
          setCompanyName(data.companyLegal?.name || '')
          setCompanyKvk(data.companyLegal?.kvk || '')
          setCompanyAddress(data.companyLegal?.address || '')
          setFooterDescription(data.footerDescription || createEmptyLocaleString())
          setCopyright(data.copyright || createEmptyLocaleString())
        }
      } catch (err) {
        console.error('Error fetching config:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await setDoc(doc(db, 'site_config', 'global'), {
        siteName,
        tagline,
        contactEmail,
        phoneNL,
        phoneLU,
        linkedinUrl,
        companyLegal: {
          name: companyName,
          kvk: companyKvk,
          address: companyAddress,
        },
        footerDescription,
        copyright,
        updatedAt: Timestamp.now(),
      })
      await revalidate('/')
      alert('Settings saved successfully.')
    } catch (err) {
      console.error('Error saving settings:', err)
      alert('Error saving settings. Check console.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* General */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">General</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <LocaleEditor label="Tagline" value={tagline} onChange={setTagline} />
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
              <input
                type="text"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone NL</label>
              <input
                type="text"
                value={phoneNL}
                onChange={(e) => setPhoneNL(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone LU</label>
              <input
                type="text"
                value={phoneLU}
                onChange={(e) => setPhoneLU(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>

        {/* Company Legal */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Legal</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">KVK Number</label>
                <input
                  type="text"
                  value={companyKvk}
                  onChange={(e) => setCompanyKvk(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Footer</h2>
          <div className="space-y-4">
            <LocaleEditor label="Footer Description" value={footerDescription} onChange={setFooterDescription} multiline />
            <LocaleEditor label="Copyright Text" value={copyright} onChange={setCopyright} />
          </div>
        </div>
      </form>
    </div>
  )
}

async function revalidate(path: string) {
  try {
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, secret: process.env.NEXT_PUBLIC_REVALIDATION_SECRET }),
    })
  } catch { /* best-effort */ }
}
