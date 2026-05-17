import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { Button } from '@/components/ui/button'
import { Loader2, X } from 'lucide-react'

interface FormModalProps {
  open: boolean
  onClose: () => void
  title: string
  onSubmit: () => void
  isLoading?: boolean
  submitLabel?: string
  children: React.ReactNode
}

export function FormModal({
  open,
  onClose,
  title,
  onSubmit,
  isLoading,
  submitLabel = 'Simpan',
  children,
}: FormModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
       showCloseButton={false}
        className="max-w-3xl p-0 overflow-hidden
                   rounded-[28px] border border-[#ececec]
                   bg-white shadow-[0_10px_40px_rgba(0,0,0,0.08)]"
      >
        {/* HEADER */}
        <DialogHeader className="px-8 py-6 border-b border-[#f3f4f6]">
          <div className="flex items-center justify-between">

            <DialogTitle className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl
                           bg-[#f8f3df] text-[#d8a326]
                           flex items-center justify-center
                           text-lg font-semibold"
              >
                +
              </div>

              <div className="flex flex-col items-start">
                <span className="text-xl font-semibold text-gray-800">
                  {title}
                </span>

                <span className="text-sm text-gray-400 font-normal">
                  Saloka Cleaning Service
                </span>
              </div>
            </DialogTitle>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center
                         justify-center hover:bg-[#f5f7fb]
                         transition"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

          </div>
        </DialogHeader>

        {/* BODY */}
        <div className="bg-[#fafbfc] px-8 py-7">
          <div
            className="bg-white rounded-3xl border border-[#f1f1f1]
                       p-7 space-y-5"
          >
            {children}
          </div>
        </div>

        {/* FOOTER */}
        <div
          className="px-8 py-5 border-t border-[#f3f4f6]
                     flex justify-end gap-3 bg-white"
        >
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="h-11 px-6 rounded-xl border-[#ececec]
                       hover:bg-red-50 hover:text-red-500"
          >
            Batal
          </Button>

          <Button
            onClick={onSubmit}
            disabled={isLoading}
            className="h-11 px-6 rounded-xl
                       bg-[#15803d] hover:bg-[#166534]
                       shadow-sm"
          >
            {isLoading && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}

            {submitLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}