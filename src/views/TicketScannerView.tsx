import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, type BarcodeScanningResult } from 'expo-camera';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/AppHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { COLORS, RADIUS, SPACING } from '@/theme';

export function TicketScannerView({ permissionGranted, canAskAgain, isProcessing, error, scanLocked, onRequestPermission, onBarcode, onDocumentCaptured, onRetry, onBack }: {
  permissionGranted: boolean; canAskAgain: boolean; isProcessing: boolean; error: string; scanLocked: boolean;
  onRequestPermission: () => void; onBarcode: (result: BarcodeScanningResult) => void; onDocumentCaptured: (uri: string) => void; onRetry: () => void; onBack: () => void;
}) {
  const cameraRef = useRef<CameraView>(null);
  const [mode, setMode] = useState<'barcode' | 'document'>('barcode');

  async function captureDocument() {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
    if (photo?.uri) onDocumentCaptured(photo.uri);
  }

  if (!permissionGranted) {
    return <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.screen}><AppHeader title="Scan ticket" onBack={onBack} /><View style={styles.permission}><Ionicons name="camera" size={42} color={COLORS.forest} /><Text style={styles.permissionTitle}>Camera access is required</Text><Text style={styles.permissionBody}>TravelMate uses the camera only to scan your ticket or travel barcode.</Text><PrimaryButton label={canAskAgain ? 'Allow camera access' : 'Open device settings'} onPress={onRequestPermission} /></View></SafeAreaView>;
  }

  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.screen}>
      <AppHeader title="Ticket intelligence" subtitle="Barcode + document capture" onBack={onBack} />
      <View style={styles.switcher}>{(['barcode', 'document'] as const).map((item) => <Pressable key={item} onPress={() => { setMode(item); onRetry(); }} style={[styles.switch, mode === item && styles.switchActive]}><Ionicons name={item === 'barcode' ? 'barcode' : 'document-text'} size={18} color={mode === item ? COLORS.white : COLORS.forest} /><Text style={[styles.switchText, mode === item && styles.switchTextActive]}>{item === 'barcode' ? 'Barcode / QR' : 'Printed ticket'}</Text></Pressable>)}</View>
      <View style={styles.cameraWrap}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'pdf417', 'aztec', 'code128', 'ean13'] }}
          onBarcodeScanned={mode === 'barcode' && !scanLocked ? onBarcode : undefined}
        />
        <View pointerEvents="none" style={styles.overlay}><View style={mode === 'barcode' ? styles.scanFrame : styles.documentFrame} /><Text style={styles.instructions}>{mode === 'barcode' ? 'Place the code inside the frame' : 'Fit the complete printed ticket inside the frame'}</Text></View>
      </View>
      <View style={styles.footer}>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {isProcessing ? <View style={styles.processing}><ActivityIndicator color={COLORS.forest} /><Text style={styles.processingText}>Reading journey information…</Text></View> : null}
        {mode === 'document' ? <PrimaryButton label="Capture and analyse ticket" icon="scan" onPress={captureDocument} loading={isProcessing} /> : null}
        {mode === 'barcode' && scanLocked && !isProcessing ? <PrimaryButton label="Scan another code" icon="refresh" variant="secondary" onPress={onRetry} /> : null}
        <Text style={styles.privacy}>Ticket images should be sent only to the configured TravelMate document-intelligence API. Without one, this build returns clearly marked demo extraction data.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream }, switcher: { marginHorizontal: SPACING.lg, marginBottom: SPACING.md, backgroundColor: COLORS.forestSoft, borderRadius: RADIUS.sm, padding: 4, flexDirection: 'row' }, switch: { flex: 1, minHeight: 44, borderRadius: 9, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center' }, switchActive: { backgroundColor: COLORS.forest }, switchText: { color: COLORS.forest, fontWeight: '800', fontSize: 12 }, switchTextActive: { color: COLORS.white }, cameraWrap: { flex: 1, overflow: 'hidden', marginHorizontal: SPACING.lg, borderRadius: RADIUS.lg, backgroundColor: COLORS.forest }, overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.18)', gap: 20 }, scanFrame: { width: '78%', height: 180, borderWidth: 3, borderColor: COLORS.white, borderRadius: 24 }, documentFrame: { width: '80%', height: '72%', borderWidth: 3, borderColor: COLORS.white, borderRadius: 18 }, instructions: { color: COLORS.white, fontWeight: '800', fontSize: 13, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 14, paddingVertical: 9, borderRadius: RADIUS.pill }, footer: { padding: SPACING.lg, gap: 12 }, processing: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 }, processingText: { color: COLORS.forest, fontWeight: '800' }, error: { color: COLORS.error, textAlign: 'center', fontWeight: '700' }, privacy: { color: COLORS.inkSoft, fontSize: 10, lineHeight: 15, textAlign: 'center' }, permission: { flex: 1, justifyContent: 'center', padding: SPACING.xl, gap: SPACING.md }, permissionTitle: { color: COLORS.ink, fontSize: 23, fontWeight: '900', textAlign: 'center' }, permissionBody: { color: COLORS.inkSoft, fontSize: 14, lineHeight: 21, textAlign: 'center' },
});
