import { CheckCircle2, AlertTriangle } from 'lucide-react'

type Item = {
  id: number
  name: string
  done: boolean
  hasIssue: boolean
}

type Props = {
  item: Item
  onToggle: (id: number) => void
  onReport: (id: number) => void
}

export default function ItemRow({
  item,
  onToggle,
  onReport,
}: Props) {
  return (
    <div
      className={`
        rounded-2xl border p-4 bg-white transition-all
        ${item.hasIssue
          ? 'border-red-300 bg-red-50'
          : item.done
          ? 'border-green-300 bg-green-50'
          : 'border-gray-200'}
      `}
    >
      <div className="mb-3">
        <p
          className={`
            text-sm font-medium
            ${item.done ? 'text-green-700' : 'text-gray-800'}
          `}
        >
          {item.name}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onToggle(item.id)}
          className={`
            flex-1 h-11 rounded-xl text-sm font-semibold
            flex items-center justify-center gap-2
            transition-all
            ${
              item.done
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }
          `}
        >
          <CheckCircle2 className="w-4 h-4" />
          {item.done ? 'Sudah Dicek' : 'Checklist'}
        </button>

        <button
          onClick={() => onReport(item.id)}
          className="h-11 px-4 rounded-xl bg-amber-100 text-amber-700
                     flex items-center justify-center"
        >
          <AlertTriangle className="w-5 h-5" />
        </button>
      </div>

      {item.hasIssue && (
        <div className="mt-3 text-xs font-medium text-red-600">
          Issue telah dilaporkan
        </div>
      )}
    </div>
  )
}