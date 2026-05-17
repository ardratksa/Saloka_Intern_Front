import { Checkbox } from "@/components/ui/checkbox"

type Item = {
  id: number
  name: string
  done: boolean
  hasIssue: boolean
}

export default function ItemRow({
  item,
  onToggle,
  onReport,
}: {
  item: Item
  onToggle: (id: number) => void
  onReport: (id: number) => void
}) {
  return (
    <div
      className={`flex items-center justify-between border rounded-lg px-3 py-2 ${
        item.hasIssue ? "border-red-400" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <Checkbox
          checked={item.done}
          onCheckedChange={() => onToggle(item.id)}
        />

        <span
          className={`text-sm ${
            item.done ? "line-through text-muted-foreground" : ""
          }`}
        >
          {item.name}
        </span>
      </div>

      <button
        onClick={() => onReport(item.id)}
        className="text-yellow-500 text-sm"
      >
        ⚠️
      </button>
    </div>
  )
}