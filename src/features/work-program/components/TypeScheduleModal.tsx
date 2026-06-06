import {
  Calendar,
  CalendarDays,
  X,
} from 'lucide-react'

type Props = {

  open: boolean

  onClose: () => void

  onSelect: (
    type: string
  ) => void
}

export default function TypeScheduleModal({

  open,

  onClose,

  onSelect,

}: Props) {

  if (!open) {
    return null
  }

  const items = [

    {
      title: 'Weekly',
      value: 'weekly',
      icon: CalendarDays,
    },

    {
      title: 'Monthly',
      value: 'monthly',
      icon: Calendar,
    },
  ]

  return (

    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/40
      "
    >

      <div
        className="
          w-full max-w-lg
          rounded-3xl
          bg-white
          p-6
          shadow-2xl
        "
      >

        <div
          className="
            mb-6
            flex
            items-center
            justify-between
          "
        >

          <div>

            <h2
              className="
                text-2xl
                font-bold
              "
            >
              Pilih Jenis Jadwal
            </h2>

            <p
              className="
                text-gray-500
              "
            >
              Pilih kategori program kerja
            </p>

          </div>

          <button
            onClick={onClose}
          >
            <X />
          </button>

        </div>

        <div
          className="
            grid
            grid-cols-2
            gap-4
          "
        >

          {items.map(
            (item) => {

              const Icon =
                item.icon

              return (

                <button

                  key={
                    item.value
                  }

                  onClick={() =>
                    onSelect(
                      item.value
                    )
                  }

                  className="
                    rounded-2xl
                    border
                    p-5
                    transition
                    hover:border-brand-500
                    hover:bg-brand-50
                  "
                >

                  <Icon
                    className="
                      mx-auto
                      mb-3
                      h-8
                      w-8
                      text-brand-600
                    "
                  />

                  <p
                    className="
                      font-semibold
                    "
                  >
                    {item.title}
                  </p>

                </button>
              )
            }
          )}

        </div>

      </div>

    </div>
  )
}