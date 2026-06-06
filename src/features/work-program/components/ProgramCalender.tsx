import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

interface Props {
  selectedDates: Date[]
  setSelectedDates: (
    dates: Date[]
  ) => void
}

export default function ProgramCalendar({

  selectedDates,

  setSelectedDates,

}: Props) {

  return (

    <div
      className="
        bg-white
        rounded-3xl
        border border-gray-200
        p-6
      "
    >

      <div className="mb-5">

        <h3
          className="
            text-lg
            font-semibold
            text-gray-900
          "
        >
          Kalender Jadwal
        </h3>

        <p
          className="
            text-sm
            text-gray-500
            mt-1
          "
        >
          Pilih tanggal pekerjaan
        </p>

      </div>

      <DayPicker

        mode="multiple"

        selected={
          selectedDates
        }

        onSelect={(dates) =>
          setSelectedDates(
            dates || []
          )
        }

      />

    </div>
  )
}