import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (data: {
    description: string
    file: File
  }) => void
}

export default function IssueModal({
  open,
  onClose,
  onSubmit,
}: Props) {
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')

  const handleImage = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const img = e.target.files?.[0]

    if (!img) return

    setFile(img)
    setPreview(URL.createObjectURL(img))
  }

  const handleSubmit = () => {
    if (!description.trim()) {
      toast.error('Deskripsi wajib diisi')
      return
    }

    if (!file) {
      toast.error('Foto wajib diupload')
      return
    }

    onSubmit({
      description,
      file,
    })

    setDescription('')
    setFile(null)
    setPreview('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>
            Laporkan Issue
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          <Textarea
            placeholder="Jelaskan masalah yang ditemukan..."
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />

          <Input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImage}
          />

          {preview && (
            <img
              src={preview}
              className="w-full h-48 object-cover rounded-xl border"
            />
          )}

          <Button
            onClick={handleSubmit}
            className="w-full"
          >
            Kirim Issue
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  )
}