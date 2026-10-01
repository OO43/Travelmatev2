import type { BarcodeScanningResult } from 'expo-camera';
import { useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Linking } from 'react-native';

import { useTicketScannerViewModel } from '@/viewModels/useTicketScannerViewModel';
import { TicketScannerView } from '@/views/TicketScannerView';

export default function TicketScannerCoordinator() {
  const [permission, requestPermission] = useCameraPermissions();
  const viewModel = useTicketScannerViewModel();

  async function finish(result: Awaited<ReturnType<typeof viewModel.processBarcode>>) {
    if (!result) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace({ pathname: '/journey-planner', params: { mode: result.mode } });
  }

  async function handleBarcode(result: BarcodeScanningResult) {
    await finish(await viewModel.processBarcode(result.data, result.type));
  }

  async function handleDocument(uri: string) {
    await finish(await viewModel.processDocument(uri));
  }

  return <TicketScannerView permissionGranted={permission?.granted ?? false} canAskAgain={permission?.canAskAgain ?? true} isProcessing={viewModel.isProcessing} error={viewModel.error} scanLocked={viewModel.scanLocked} onRequestPermission={() => { if (permission?.canAskAgain === false) void Linking.openSettings(); else void requestPermission(); }} onBarcode={(result) => void handleBarcode(result)} onDocumentCaptured={(uri) => void handleDocument(uri)} onRetry={viewModel.retry} onBack={() => router.back()} />;
}
