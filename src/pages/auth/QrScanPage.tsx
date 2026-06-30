import { useEffect, useRef, useState } from 'react'
import { getLocations, getLocationTypes } from '@/api/location'
import { useQuery } from '@tanstack/react-query'
import type { Location, LocationType, ActiveLocation } from '@/types'
import { cn } from '@/lib/utils'
import { MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { scanQr } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

import {
  Camera,
  House,
} from 'lucide-react'

export default function QrScanPage() {
  const navigate = useNavigate()
  const { setActiveLocation } = useAuthStore()
  const [selectedTypeId, setSelectedTypeId] = useState('')
  const [selectedLocId, setSelectedLocId] = useState('')
  const [showManual, setShowManual] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)

  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scanningRef = useRef(false)

  const { data: types = [] } = useQuery({
    queryKey: ['location-types'],
    queryFn: getLocationTypes,
  })

  const filteredTypes = types.filter(
    (type: LocationType) =>
      type.name === "Toilet" ||
      type.name === "Laktasi"
  )

  const { data: locations = [] } = useQuery({
    queryKey: ['locations', selectedTypeId],
    queryFn: () => getLocations(Number(selectedTypeId)),
    enabled: !!selectedTypeId,
  })

  useEffect(() => {

  scannerRef.current = new Html5Qrcode("reader")
  const scanner = scannerRef.current

    scanner
    .start(
      {
        facingMode: "environment",
      },
      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 250,
        },
      },
      async (decodedText) => {

        if (scanningRef.current) return

        scanningRef.current = true

        try {

          const res = await scanQr(decodedText)

          await scanner.stop()
          await scanner.clear()

          setActiveLocation(res.location)

          toast.success("Lokasi berhasil ditemukan")

          navigate("/checklist")

        } catch (err) {

          console.error(err)

          toast.error("QR tidak valid")

          scanningRef.current = false

        }

      },
      () => {}
    )
    .catch((err) => {

        console.error(err)

        toast.error("Kamera tidak tersedia")

        setShowManual(true)

    })

    return () => {

        if (scannerRef.current?.isScanning) {

            scannerRef.current
                .stop()
                .then(() => scannerRef.current?.clear())
                .catch(() => {})

        }

    }
  }, [navigate, setActiveLocation])

  const handleManual = () => {

    const loc = locations.find(
      (l: Location) => String(l.id) === selectedLocId
    )

    if (!loc) {
      toast.error('Pilih lokasi terlebih dahulu')
      return
    }

    const active: ActiveLocation = {
      id: loc.id,
      name: loc.name,
      type_id: loc.type_id,
      type_name: loc.type_name,
    }

    setActiveLocation(active)

    toast.success('Lokasi dipilih')

    navigate('/checklist')
  }

  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="bg-brand-600 pt-12 pb-6 px-5">
        <div className="flex items-center justify-between">

          <div>

              <h1 className="text-white text-xl font-bold">
                  Scan QR Lokasi
              </h1>

              <p className="text-white/70 text-xs mt-1">
                  Arahkan kamera ke QR lokasi
              </p>

          </div>

          <button
              onClick={() => setShowExitModal(true)}
              className="
                  w-11
                  h-11
                  rounded-xl
                  bg-white/15
                  border
                  border-white/20
                  flex
                  items-center
                  justify-center
                  active:scale-95
              "
          >
              <House className="w-5 h-5 text-white"/>
          </button>

      </div>

        
      </div>
      <div className="flex-1 px-5 py-6">

          <div
              className="
              bg-white
              rounded-3xl
              border
              border-gray-200
              shadow-sm
              overflow-hidden
              "
          >

              <div
                  id="reader"
                  className="w-full min-h-[320px]"
              ></div>

          </div>

          <div className="mt-6 text-center">

              <Camera className="w-8 h-8 mx-auto text-brand-600 mb-2"/>

              <h2 className="font-bold text-lg">
                  Scan QR Lokasi
              </h2>

              <p className="text-sm text-gray-500 mt-2">

                  Arahkan kamera ke QR Code
                  yang berada di lokasi checklist.

              </p>

              <div className="mt-8">

                <button
                    onClick={() => setShowManual(true)}
                    className="
                        w-full
                        border
                        border-brand-300
                        text-brand-700
                        rounded-2xl
                        py-3
                        font-semibold
                        hover:bg-brand-50
                    "
                >
                    Pilih Lokasi Manual
                </button>

                {showManual && (

                  <div className="mt-6 space-y-4">

                      <div>

                          <p className="text-sm font-semibold mb-2">
                              Tipe Lokasi
                          </p>

                          <div className="grid grid-cols-2 gap-2">

                              {filteredTypes.map((t: LocationType) => (

                                  <button
                                      key={t.id}
                                      onClick={()=>{
                                          setSelectedTypeId(String(t.id))
                                          setSelectedLocId('')
                                      }}
                                      className={cn(
                                          "rounded-xl border py-3",
                                          selectedTypeId===String(t.id)
                                              ? "bg-brand-600 text-white"
                                              : "bg-white"
                                      )}
                                  >
                                      {t.name}
                                  </button>

                              ))}

                          </div>

                      </div>

                      {!!selectedTypeId && (

                          <div>

                              <p className="text-sm font-semibold mb-2">
                                  Lokasi
                              </p>

                              <div className="space-y-2 max-h-52 overflow-auto">

                                  {locations.map((loc: Location)=>(

                                      <button
                                          key={loc.id}
                                          onClick={()=>setSelectedLocId(String(loc.id))}
                                          className={cn(
                                              "w-full rounded-xl border px-4 py-3 text-left flex items-center gap-3",
                                              selectedLocId===String(loc.id)
                                                  ? "border-brand-600 bg-brand-50"
                                                  : "bg-white"
                                          )}
                                      >
                                          <MapPin className="w-4 h-4"/>

                                          {loc.name}

                                      </button>

                                  ))}

                              </div>

                          </div>

                      )}

                      <button
                          onClick={handleManual}
                          disabled={!selectedLocId}
                          className="
                              w-full
                              bg-brand-600
                              text-white
                              rounded-2xl
                              py-4
                              font-bold
                              disabled:opacity-40
                          "
                      >
                          Masuk Checklist
                      </button>

                  </div>

                  )}

            </div>

          </div>

      </div>
      {showExitModal && (
        <div
          className="
            fixed inset-0
            bg-black/60
            backdrop-blur-sm
            z-50
            flex
            items-center
            justify-center
            p-4
          "
        >
          <div
            className="
              bg-white
              rounded-3xl
              p-6
              w-full
              max-w-sm
            "
          >
            <div className="text-center">

              <div
                className="
                  w-16
                  h-16
                  rounded-full
                  bg-brand-100
                  flex
                  items-center
                  justify-center
                  mx-auto
                  mb-4
                "
              >
                <House className="w-8 h-8 text-brand-600" />
              </div>

              <h3 className="text-xl font-bold">
                Kembali ke Menu?
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                Anda akan keluar dari halaman Scan QR dan kembali ke menu utama.
              </p>

            </div>

            <div className="flex gap-3 mt-6">

              <button
                onClick={() => setShowExitModal(false)}
                className="
                  flex-1
                  h-12
                  rounded-xl
                  border
                  border-gray-300
                  font-semibold
                "
              >
                Tidak
              </button>

              <button
                onClick={() => {

                  setActiveLocation(null)

                  navigate("/dashboard")

                }}
                className="
                  flex-1
                  h-12
                  rounded-xl
                  bg-brand-600
                  text-white
                  font-semibold
                "
              >
                Ya
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  )
}