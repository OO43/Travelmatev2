import { useState } from 'react';

import { analyseBarcode, analyseTicketImage } from '@/services/ticketIntelligenceService';
import { useTravelmateStore } from '@/state/TravelmateStore';

export function useTicketScannerViewModel() {
  const { setLatestTicket } = useTravelmateStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [scanLocked, setScanLocked] = useState(false);

  async function processBarcode(data: string, type: string) {
    if (scanLocked) return null;
    try {
      setScanLocked(true);
      setIsProcessing(true);
      setError('');
      const result = await analyseBarcode(data, type);
      setLatestTicket(result);
      return result;
    } catch {
      setError('This barcode could not be read. Try again or scan the printed ticket.');
      setScanLocked(false);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }

  async function processDocument(imageUri: string) {
    try {
      setIsProcessing(true);
      setError('');
      const result = await analyseTicketImage(imageUri);
      setLatestTicket(result);
      return result;
    } catch {
      setError('The document intelligence service could not read this ticket.');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }

  return { isProcessing, error, scanLocked, processBarcode, processDocument, retry: () => setScanLocked(false) };
}
