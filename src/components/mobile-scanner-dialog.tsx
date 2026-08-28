"use client"

import { useState } from "react"
import { Scanner } from "@yudiel/react-qr-scanner"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Camera, X } from "lucide-react"

interface MobileScannerDialogProps {
  onScan: (result: string) => void
}

export function MobileScannerDialog({ onScan }: MobileScannerDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleScan = (result: any) => {
    if (result && result.length > 0) {
      // The result is an array of objects for react-qr-scanner v2
      // e.g. [{ rawValue: "INV-1234", format: "qr_code" }]
      const value = result[0]?.rawValue
      if (value) {
        onScan(value)
        setIsOpen(false)
      }
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-blue-50/50 p-4 rounded-lg border border-blue-100 mb-4 shadow-sm">
        <div className="flex-1 text-sm text-blue-900">
          <span className="font-bold flex items-center gap-2 mb-1">
            📱 Menggunakan HP atau Tablet?
          </span>
          <span className="text-blue-700 block">
            Hindari mengetik manual! Anda bisa menggunakan fitur scan kamera belakang untuk membaca barcode resi lebih cepat dan praktis.
          </span>
        </div>
        <Button 
          type="button" 
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-md font-semibold"
          onClick={() => setIsOpen(true)}
        >
          <Camera className="w-5 h-5 mr-2" />
          Buka Kamera Scanner
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md w-[95%] p-0 overflow-hidden bg-black border-none rounded-xl">
          <div className="relative h-[65vh] max-h-150 w-full flex flex-col">
            <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 bg-linear-to-b from-black/80 to-transparent">
              <h3 className="text-white font-medium">Arahkan ke Barcode</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20 rounded-full"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
            
            <div className="flex-1 bg-black relative flex items-center justify-center">
              {isOpen && (
                <Scanner 
                  onScan={handleScan}
                  formats={[
                    "qr_code",
                    "code_128",
                    "code_39",
                    "ean_13",
                    "ean_8",
                    "upc_a",
                    "upc_e"
                  ]}
                  styles={{
                    container: { width: "100%", height: "100%" },
                    video: { objectFit: "cover" }
                  }}
                />
              )}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 z-10 p-5 bg-linear-to-t from-black/80 to-transparent text-center">
              <p className="text-white/90 text-sm">Pastikan barcode berada jelas di layar dan mendapat pencahayaan yang cukup.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
