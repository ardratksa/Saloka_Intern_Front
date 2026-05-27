type Issue = {
  id: number
  name: string
  type: string
  description: string
  image?: string
}

export default function IssuePanel({ issues }: { issues: Issue[] }) {
  return (
    <div className="w-1/3 border rounded-lg p-4 space-y-4">
      <h2 className="font-semibold text-lg">Issues</h2>

      {issues.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Belum ada issue
        </p>
      )}

      {issues.map((issue) => (
        <div
          key={issue.id}
          className="border rounded-lg p-3 space-y-1"
        >
          <p className="font-medium">{issue.name}</p>
          <p className="text-sm text-muted-foreground">
            {issue.description}
          </p>

          {issue.image && (
            <img
              src={issue.image}
              className="w-full h-24 object-cover rounded mt-2"
            />
          )}
        </div>
      ))}
    </div>
  )
}