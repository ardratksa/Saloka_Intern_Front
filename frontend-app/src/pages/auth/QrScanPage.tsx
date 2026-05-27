import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getLocations, getLocationTypes } from '@/api/location'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { QrCode, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import type { ActiveLocation } from '@/types'

export default function QrScanPage() {
  const navigate = useNavigate()
  const { setActiveLocation, activeLocation } = useAuthStore()

  const [selectedTypeId, setSelectedTypeId] = useState<string>('')
  const [selectedLocId, setSelectedLocId] = useState<string>('')

  // ─── GET TYPES ─────────────────────────
  const { data: types, isLoading: typesLoading } = useQuery({
    queryKey: ['location-types'],
    queryFn: getLocationTypes,
  })

  // ─── GET LOCATIONS ─────────────────────
  const { data: locations = [], isLoading: locsLoading } = useQuery({
    queryKey: ['locations', selectedTypeId],
    queryFn: async () => {
      if (!selectedTypeId) return []
      return await getLocations(Number(selectedTypeId))
    },
  })

  // DEBUG
  console.log('selectedTypeId:', selectedTypeId)
  console.log('locations:', locations)

  // ─── CONFIRM ───────────────────────────
  const handleConfirm = () => {
    if (!selectedLocId) {
      toast.error('Pilih lokasi terlebih dahulu')
      return
    }

    const loc = locations.find((l) => String(l.id) === selectedLocId)

    if (!loc) {
      toast.error('Lokasi tidak ditemukan')
      return
    }

    const active: ActiveLocation = {
      id: loc.id,
      name: loc.name,
      type_id: loc.type_id,
      type_name: loc.type_name ?? '',
    }

    setActiveLocation(active)

    toast.success(`Lokasi aktif: ${loc.name}`)

    navigate('/checklist')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* HEADER */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <QrCode className="w-7 h-7 text-white" />
          </div>

          <h1 className="text-xl font-bold text-gray-900">
            Pilih Lokasi
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Scan QR di pintu lokasi atau pilih manual
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">

          {/* QR */}
          <div className="flex items-center justify-center mb-4">
            <div className="w-24 h-24 border-2 border-dashed border-brand-300 rounded-xl flex items-center justify-center">
              <QrCode className="w-10 h-10 text-brand-400" />
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mb-6">
            QR scan akan tersedia di versi berikutnya
          </p>

          {/* FORM */}
          <div className="space-y-4">

            {/* TYPE */}
            <div>
              <Label className="mb-1 block">
                Tipe Lokasi
              </Label>

              <Select
                value={selectedTypeId}
                onValueChange={(val) => {
                  setSelectedTypeId(val)
                  setSelectedLocId('')
                }}
              >
                <SelectTrigger className="w-full h-11 rounded-xl bg-white">
                  <SelectValue placeholder="Pilih tipe lokasi" />
                </SelectTrigger>

                <SelectContent
                  position="popper"
                  side="bottom"
                  sideOffset={6}
                  className="z-50 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                >
                  {typesLoading && (
                    <div className="px-3 py-2 text-sm text-gray-400">
                      Memuat...
                    </div>
                  )}

                  {types?.map((t) => (
                    <SelectItem
                      key={t.id}
                      value={String(t.id)}
                    >
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* LOCATION */}
            <div>
              <Label className="mb-1 block">
                Lokasi
              </Label>

              <Select
                value={selectedLocId}
                onValueChange={setSelectedLocId}
                disabled={!selectedTypeId || locsLoading}
              >
                <SelectTrigger className="w-full h-11 rounded-xl bg-white">
                  <SelectValue placeholder="Pilih lokasi" />
                </SelectTrigger>

                <SelectContent
                  position="popper"
                  side="bottom"
                  sideOffset={6}
                  className="z-50 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                >
                  {locsLoading && (
                    <div className="px-3 py-2 text-sm text-gray-400">
                      Memuat...
                    </div>
                  )}

                  {locations.map((l) => (
                    <SelectItem
                      key={l.id}
                      value={String(l.id)}
                    >
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* BUTTON */}
            <Button
              onClick={handleConfirm}
              className="w-full bg-brand-600 hover:bg-brand-700 mt-2"
              disabled={!selectedLocId}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Konfirmasi Lokasi
            </Button>
          </div>
        </div>

        {/* PREVIOUS LOCATION */}
        {activeLocation && (
          <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
            <p className="text-xs text-brand-600 font-medium mb-1">
              Lokasi aktif sebelumnya
            </p>

            <p className="text-sm font-semibold text-brand-700">
              {activeLocation.name}
            </p>

            <button
              onClick={() => navigate('/checklist')}
              className="text-xs text-brand-600 underline mt-1"
            >
              Lanjutkan dengan lokasi ini →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}