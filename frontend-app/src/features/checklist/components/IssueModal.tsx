import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (data: {
    type: string
    description: string
    image?: string
  }) => void
}

export default function IssueModal({ open, onClose, onSubmit }: Props) {
  const [type, setType] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState<string | undefined>()

  // 🔥 HANDLE IMAGE
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setImage(url)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Laporkan Issue</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">

          {/* TYPE */}
          <Select onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih jenis issue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kerusakan">Kerusakan</SelectItem>
              <SelectItem value="kotor">Kotor</SelectItem>
              <SelectItem value="lainnya">Lainnya</SelectItem>
            </SelectContent>
          </Select>

          {/* DESKRIPSI */}
          <Textarea
            placeholder="Deskripsi..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* UPLOAD */}
          <Input type="file" accept="image/*" onChange={handleImage} />

          {/* PREVIEW */}
          {image && (
            <img
              src={image}
              className="w-full h-40 object-cover rounded-lg border"
            />
          )}

          {/* BUTTON */}
          <Button
            onClick={() => {
              onSubmit({ type, description, image })
              setType("")
              setDescription("")
              setImage(undefined)
            }}
            className="w-full"
          >
            Simpan Issue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}