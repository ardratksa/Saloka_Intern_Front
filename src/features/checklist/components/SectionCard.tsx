import ItemRow from "./ItemRow"

type Item = {
  id: number
  name: string
  done: boolean
  hasIssue: boolean
}

type Props = {
  title: string
  items: Item[]
  onToggle: (id: number) => void
  onReport: (id: number) => void
}

export default function SectionCard({
  title,
  items,
  onToggle,
  onReport,
}: Props) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h2 className="font-semibold">{title}</h2>

      {items.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          onToggle={() => onToggle(item.id)}
          onReport={() => onReport(item.id)}
        />
      ))}
    </div>
  )
}