"use client";

import { useEffect } from 'react';
import { Html5QrcodeScanner, QrCodeSuccessCallback, QrCodeErrorCallback } from 'html5-qrcode';

interface ScannerProps {
  onScanSuccess: QrCodeSuccessCallback;
  onScanError?: QrCodeErrorCallback;
}

const qrcodeRegionId = "html5qr-code-full-region";

const Scanner = ({ onScanSuccess, onScanError = () => {} }: ScannerProps) => {

  useEffect(() => {
    let html5QrcodeScanner: Html5QrcodeScanner | null = null;
    
    const startScanner = () => {
      const config = {
        fps: 10,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const qrboxSize = Math.floor(minEdge * 0.8);
          return { width: qrboxSize, height: qrboxSize };
        },
        rememberLastUsedCamera: true,
        supportedScanTypes: [], // Use all supported scan types
      };

      html5QrcodeScanner = new Html5QrcodeScanner(qrcodeRegionId, config, false);
      html5QrcodeScanner.render(onScanSuccess, onScanError);
    };

    // Delay start to ensure DOM element is ready, especially with fast navigation
    const startTimeout = setTimeout(() => {
      const element = document.getElementById(qrcodeRegionId);
      if (element) {
        startScanner();
      }
    }, 100);

    return () => {
      clearTimeout(startTimeout);
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(error => {
          console.error("Failed to clear html5-qrcode-scanner.", error);
        });
        html5QrcodeScanner = null;
      }
    };
  }, [onScanSuccess, onScanError]);

  return <div id={qrcodeRegionId} className="w-full h-full" />;
};

export default Scanner;
