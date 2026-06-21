import {
  X,
  MapPin,
  CalendarDays,
  RefreshCcw,
  BriefcaseBusiness,
} from 'lucide-react'

import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

type Props = {
  open: boolean
  onClose: () => void
  item: any
}

export default function PreviewScheduleModal({
  open,
  onClose,
  item,
}: Props) {

  if (!open || !item) {
    return null
  }

  const selectedDates =
    item.scheduled_dates?.map(
      (day: number) =>
        new Date(
          item.year,
          item.month - 1,
          day
        )
    ) || []

  return (

    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/40
        p-4
      "
    >

      <div
        className="
          w-full max-w-xl
          rounded-3xl
          bg-white
          shadow-2xl
          overflow-hidden
        "
      >

        {/* HEADER */}

        <div
          className="
            flex items-center justify-between
            border-b
            px-5 py-4
          "
        >

          <div>

            <h2
              className="
                text-xl
                font-bold
                text-slate-900
              "
            >
              Preview Jadwal
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Detail program kerja
            </p>

          </div>

          <button
            onClick={onClose}
            className="
              rounded-lg
              p-2
              hover:bg-slate-100
            "
          >
            <X className="h-5 w-5" />
          </button>

        </div>

        {/* CONTENT */}

        <div className="space-y-4 p-5">

          {/* JOB CARD */}

          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              p-4
            "
          >

            <div className="flex gap-4">

              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-brand-600
                  text-white
                "
              >

                <BriefcaseBusiness
                  className="
                    h-5
                    w-5
                  "
                />

              </div>

              <div className="flex-1">

                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wider
                    text-brand-600
                  "
                >
                  Pekerjaan
                </p>

                <h3
                  className="
                    mt-1
                    text-xl
                    font-bold
                    text-slate-900
                  "
                >
                  {item.job?.job}
                </h3>

                <div
                  className="
                    mt-4
                    grid
                    grid-cols-2
                    gap-4
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <MapPin
                      className="
                        h-4
                        w-4
                        text-brand-500
                      "
                    />

                    <div>

                      <p
                        className="
                          text-[10px]
                          uppercase
                          text-slate-500
                        "
                      >
                        Area
                      </p>

                      <p
                        className="
                          text-sm
                          font-medium
                        "
                      >
                        {item.location_name}
                      </p>

                    </div>

                  </div>

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <MapPin
                      className="
                        h-4
                        w-4
                        text-brand-500
                      "
                    />

                    <div>

                      <p
                        className="
                          text-[10px]
                          uppercase
                          text-slate-500
                        "
                      >
                        Sub Lokasi
                      </p>

                      <div
                        className="
                          flex
                          items-center
                          gap-2
                        "
                      >

                        <CalendarDays
                          className="
                            h-4
                            w-4
                            text-brand-500
                          "
                        />

                        <div>

                          <p
                            className="
                              text-[10px]
                              uppercase
                              text-slate-500
                            "
                          >
                            Waktu
                          </p>

                          <p
                            className="
                              text-sm
                              font-medium
                            "
                          >
                            {item.time_range || '-'}
                          </p>

                        </div>

                      </div>

                      <p
                        className="
                          text-sm
                          font-medium
                        "
                      >
                        {item.sub_location}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* BADGES */}

          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >

            <div
              className="
                flex
                items-center
                gap-2
                rounded-full
                border
                border-brand-500
                px-3
                py-2
                text-brand-600
              "
            >

              <CalendarDays
                className="
                  h-4
                  w-4
                "
              />

              <span
                className="
                  text-sm
                  font-medium
                "
              >
                {item.plan}
              </span>

            </div>

            <div
              className="
                flex
                items-center
                gap-2
                rounded-full
                bg-brand-50
                px-3
                py-2
                text-brand-600
              "
            >

              <RefreshCcw
                className="
                  h-4
                  w-4
                "
              />

              <span
                className="
                  text-sm
                  font-medium
                "
              >
                {item.scheduled_dates?.length || 0}
                {' '}
                Hari
              </span>

            </div>

          </div>

          {/* CALENDAR */}

          <div
            className="
              rounded-2xl
              border
              border-slate-200
              p-2
            "
          >

            <div className="flex justify-center scale-90">

              <DayPicker

                mode="multiple"

                month={
                  new Date(
                    item.year,
                    item.month - 1
                  )
                }

                selected={
                  selectedDates
                }

                disabled={() => true}

              />

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}