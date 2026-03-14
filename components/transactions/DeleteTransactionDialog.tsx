"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteTransactionDialogProps {
  open: boolean
  onClose: () => void
  transactionId: string
  onSuccess?: () => void
}

export function DeleteTransactionDialog({
  open,
  onClose,
  transactionId,
  onSuccess,
}: DeleteTransactionDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    const res = await fetch(`/api/transactions/${transactionId}`, { method: "DELETE" })
    setLoading(false)
    if (res.ok) {
      onClose()
      onSuccess?.()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Eliminar transacción?</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente este movimiento.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 mt-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="destructive" className="flex-1" onClick={handleDelete} loading={loading}>
            <Trash2 className="h-4 w-4 mr-1" />
            Eliminar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
