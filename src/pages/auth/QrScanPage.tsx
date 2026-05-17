import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getLocations, getLocationTypes } from '@/api/location'
import { useQuery } from '@tanstack/react-query'
import {
  QrCode, MapPin, ChevronLeft,
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { ActiveLocation, LocationType, Location } from '@/types'
import { cn } from '@/lib/utils'

export default function QrScanPage() {
  const navigate = useNavigate()
  const { setActiveLocation, activeLocation, token } = useAuthStore()

  const [selectedTypeId, setSelectedTypeId] = useState<string>('')
  const [selectedLocId,  setSelectedLocId]  = useState<string>('')

  const { data: types } = useQuery({
    queryKey: ['location-types'],
    queryFn:  getLocationTypes,
    enabled:  !!token,
  })

  const { data: locations } = useQuery({
    queryKey: ['locations', selectedTypeId],
    queryFn:  () => getLocations(Number(selectedTypeId)),
    enabled:  !!selectedTypeId,
  })

  const selectedLoc = locations?.find(
    (l) => String(l.id) === selectedLocId
  )

  const handleConfirm = () => {
    if (!selectedLocId || !selectedLoc) {
      toast.error('Pilih lokasi terlebih dahulu')
      return
    }
    const active: ActiveLocation = {
      id:        selectedLoc.id,
      name:      selectedLoc.name,
      type_id:   selectedLoc.type_id,
      type_name: selectedLoc.type_name,
    }
    setActiveLocation(active)
    toast.success(`Lokasi: ${selectedLoc.name}`)
    navigate('/checklist')
  }

  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="bg-brand-600 pt-12 pb-6 px-5">
        <div className="flex items-center gap-3 mb-4">
          {activeLocation && (
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center
                         justify-center text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-white text-xl font-bold">Pilih Lokasi</h1>
            <p className="text-white/70 text-xs mt-0.5">
              Scan QR atau pilih lokasi manual
            </p>
          </div>
        </div>

        {/* QR ilustrasi */}
        <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center
                          justify-center shrink-0">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold">Scan QR Code</p>
            <p className="text-white/70 text-xs mt-0.5">
              Arahkan kamera ke QR di pintu lokasi
            </p>
            <p className="text-white/50 text-xs mt-1">
              (Fitur scan akan hadir segera)
            </p>
          </div>
        </div>
      </div>

      {/* Form pilih manual */}
      <div className="flex-1 px-5 py-6 space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Atau pilih manual
        </p>

        {/* Pilih tipe */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Tipe Lokasi
          </label>
          <div className="grid grid-cols-2 gap-2">
            {types?.map((t: LocationType) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTypeId(String(t.id))
                  setSelectedLocId('')
                }}
                className={cn(
                  'py-3 px-4 rounded-2xl text-sm font-semibold border',
                  'transition-all active:scale-95',
                  selectedTypeId === String(t.id)
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200'
                )}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Pilih lokasi */}
        {selectedTypeId && (
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Pilih Lokasi
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {locations?.map((l: Location) => (
                <button
                  key={l.id}
                  onClick={() => setSelectedLocId(String(l.id))}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3',
                    'rounded-2xl border transition-all active:scale-[0.99]',
                    selectedLocId === String(l.id)
                      ? 'bg-brand-50 border-brand-400 text-brand-700'
                      : 'bg-white border-gray-100 text-gray-700'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
                    selectedLocId === String(l.id)
                      ? 'bg-brand-100'
                      : 'bg-gray-100'
                  )}>
                    <MapPin className={cn(
                      'w-4 h-4',
                      selectedLocId === String(l.id)
                        ? 'text-brand-600'
                        : 'text-gray-500'
                    )} />
                  </div>
                  <span className="text-sm font-medium text-left flex-1">
                    {l.name}
                  </span>
                  {selectedLocId === String(l.id) && (
                    <div className="w-5 h-5 rounded-full bg-brand-600
                                    flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24"
                           fill="none" stroke="currentColor" strokeWidth={3}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lokasi aktif sebelumnya */}
        {activeLocation && (
          <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4">
            <p className="text-xs text-brand-600 font-semibold mb-1">
              Lokasi aktif sebelumnya
            </p>
            <p className="text-sm font-bold text-brand-700">
              {activeLocation.name}
            </p>
            <p className="text-xs text-brand-500">{activeLocation.type_name}</p>
            <button
              onClick={() => navigate('/checklist')}
              className="mt-2 text-xs text-brand-600 font-semibold underline"
            >
              Lanjutkan dengan lokasi ini →
            </button>
          </div>
        )}
      </div>

      {/* Bottom confirm button */}
      <div className="px-5 pb-8 pt-3 bg-white border-t border-gray-100">
        <button
          onClick={handleConfirm}
          disabled={!selectedLocId}
          className="w-full bg-brand-600 text-white py-4 rounded-2xl
                     text-sm font-bold flex items-center justify-center gap-2
                     disabled:opacity-40 disabled:cursor-not-allowed
                     active:bg-brand-700 transition-colors"
        >
          <MapPin className="w-4 h-4" />
          Konfirmasi Lokasi
        </button>
      </div>
    </div>
  )
}