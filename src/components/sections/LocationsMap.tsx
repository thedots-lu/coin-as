'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Fix leaflet default marker icons in Next.js
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const locations = [
  {
    name: 'Schiphol-Rijk',
    country: 'The Netherlands',
    lat: 52.283,
    lng: 4.748,
    address: 'Tupolevlaan 41, 1119 PA Schiphol-Rijk',
    phone: '+31 88 26 46 000',
    capacity: 'Recovery workplaces · Crisis rooms · Co-location',
  },
  {
    name: 'Münsbach',
    country: 'Luxembourg',
    lat: 49.626,
    lng: 6.177,
    address: '6B rue Gabriel Lippmann, L-5365 Münsbach',
    phone: '+352 357 05 30',
    capacity: '500 recovery workplaces · TIER-3 · ISO 27001',
  },
  {
    name: 'Contern',
    country: 'Luxembourg',
    lat: 49.588,
    lng: 6.222,
    address: 'Zone Industrielle Contern, Luxembourg',
    phone: '+352 357 05 30',
    capacity: '250 recovery workplaces · 10 min from Münsbach',
  },
]

export default function LocationsMap() {
  useEffect(() => {
    // Import Leaflet CSS dynamically (client-only)
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
    return () => {
      document.head.removeChild(link)
    }
  }, [])

  return (
    <MapContainer
      center={[51.0, 5.2]}
      zoom={7}
      className="w-full h-full"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((loc) => (
        <Marker
          key={loc.name}
          position={[loc.lat, loc.lng]}
          icon={markerIcon}
        >
          <Popup>
            <div className="text-sm min-w-[180px]">
              <p className="font-bold text-base mb-1">{loc.name}</p>
              <p className="text-gray-500 text-xs mb-2">{loc.country}</p>
              <p className="text-gray-700 text-xs mb-1">{loc.address}</p>
              <p className="text-gray-700 text-xs mb-1">{loc.phone}</p>
              <p className="text-xs text-blue-700 font-medium mt-2">{loc.capacity}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
