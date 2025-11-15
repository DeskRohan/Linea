
"use client";

import { useEffect, useRef } from 'react';
import { Html5Qrcode, type QrCodeSuccessCallback, type QrCodeErrorCallback } from 'html5-qrcode';

interface ScannerProps {
  onScanSuccess: QrCodeSuccessCallback;
  onScanError?: QrCodeErrorCallback;
}

const qrcodeRegionId = "html5qr-code-full-region";

const Scanner = ({ onScanSuccess, onScanError = () => {} }: ScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const startScanner = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (!cameras || cameras.length === 0) {
          console.error("No cameras found.");
          if (onScanError) onScanError("No cameras found on the device.");
          return;
        }

        // Find the back camera
        let cameraId = cameras[0].id; // Default to the first camera
        const backCamera = cameras.find(camera => camera.label.toLowerCase().includes('back'));
        if (backCamera) {
          cameraId = backCamera.id;
        }

        // Ensure the element is present in the DOM
        const element = document.getElementById(qrcodeRegionId);
        if (!element) {
            console.error("Scanner element not found in DOM");
            return;
        }

        const config = {
          fps: 10,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdge * 0.8);
            return { width: qrboxSize, height: qrboxSize };
          },
        };
        
        scannerRef.current = new Html5Qrcode(qrcodeRegionId);

        await scannerRef.current.start(
          cameraId,
          config,
          onScanSuccess,
          onScanError
        );

      } catch (err) {
        console.error("Failed to start scanner:", err);
        if (onScanError) onScanError(`Failed to start scanner: ${err}`);
      }
    };

    // Delay start to ensure DOM element is ready
    const startTimeout = setTimeout(() => {
        startScanner();
    }, 100);


    return () => {
      clearTimeout(startTimeout);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(error => {
          console.error("Failed to stop scanner on cleanup.", error);
        });
      }
    };
  }, [onScanSuccess, onScanError]);

  return <div id={qrcodeRegionId} className="w-full h-full" />;
};

export default Scanner;
