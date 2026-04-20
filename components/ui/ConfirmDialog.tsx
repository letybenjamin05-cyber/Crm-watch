"use client";

import Modal from "./Modal";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmer",
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-zinc-300 text-sm">{message}</p>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-secondary text-sm">
            Annuler
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="btn-danger text-sm"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
