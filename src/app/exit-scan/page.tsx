
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Scanner from '@/components/scanner';
import { Loader2, CheckCircle, XCircle, ScanLine, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ExitScanPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [isScanning, setIsScanning] = useState(false);

  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const scannerTimeoutRef = useRef<NodeJS.Timeout | null>(null);


   useEffect(() => {
    if (isScanning) {
      scannerTimeoutRef.current = setTimeout(() => {
        setIsScanning(false);
        toast({
          variant: "destructive",
          title: "Scanner Timed Out",
          description: "No QR code was detected.",
        });
      }, 20000); // 20 seconds timeout
    } else {
      if (scannerTimeoutRef.current) {
        clearTimeout(scannerTimeoutRef.current);
      }
    }
    return () => {
      if (scannerTimeoutRef.current) clearTimeout(scannerTimeoutRef.current);
    };
  }, [isScanning, toast]);


  const handleScanSuccess = async (decodedText: string) => {
    if (isLoading) return;
    
    setIsScanning(false);
    setIsLoading(true);
    setScanResult(decodedText);
    setVerificationStatus('idle');

    if (!firestore) {
      toast({ variant: 'destructive', title: 'Database not available' });
      setIsLoading(false);
      return;
    }
    
    try {
      const orderRef = doc(firestore, "orders", decodedText);
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        const orderData = orderSnap.data();
        if (orderData.status === 'completed') {
            setVerificationStatus('success');
            toast({
                title: 'Order Verified!',
                description: `Thank you, ${orderData.customerName}!`,
            });
            // In a real scenario, this would trigger a physical gate.
        } else {
             setVerificationStatus('error');
             toast({ variant: 'destructive', title: 'Order Not Completed', description: 'This order has not been paid for.' });
        }
      } else {
        setVerificationStatus('error');
        toast({ variant: 'destructive', title: 'Invalid QR Code', description: 'Order not found in the database.' });
      }
    } catch (error) {
      console.error('Error verifying order:', error);
      setVerificationStatus('error');
      toast({ variant: 'destructive', title: 'Verification Failed', description: 'An error occurred during verification.' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetScanner = () => {
      setScanResult(null);
      setVerificationStatus('idle');
      setIsLoading(false);
      setIsScanning(true);
  }

  return (
    <main className="flex h-screen w-screen flex-col items-center justify-center bg-gray-900 text-white p-4">
       <Button asChild variant="ghost" className="absolute top-4 left-4 text-white hover:bg-white/10 hover:text-white">
        <Link href="/"><ArrowLeft/> Back to Home</Link>
      </Button>

      <Card className="w-full max-w-lg bg-white/5 border-white/20 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Exit Verification</CardTitle>
          <CardDescription className="text-white/70">
            Please scan the QR code from your bill to open the gate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full aspect-square rounded-lg bg-black overflow-hidden flex items-center justify-center">
            {!isScanning && verificationStatus === 'idle' && (
                 <Button onClick={() => setIsScanning(true)} variant="ghost" className="flex flex-col h-48 w-48 rounded-full items-center justify-center gap-4 text-white/50 hover:bg-white/10 hover:text-white">
                    <ScanLine className="h-20 w-20" />
                    <span className="text-lg font-semibold">Tap to Scan</span>
                </Button>
            )}

            {isScanning && (
                <>
                    <Scanner onScanSuccess={handleScanSuccess} />
                    <div className="absolute inset-0 pointer-events-none border-[1.5rem] border-black/80 shadow-inner z-10" />
                    <div className="absolute top-1/2 left-6 right-6 h-1 bg-green-500/70 shadow-[0_0_15px_2px_#22c55e] animate-pulse z-10" />
                </>
            )}
            
            {isLoading && (
                 <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
                    <Loader2 className="h-16 w-16 animate-spin text-green-400 mb-4" />
                    <p className="text-lg font-semibold">Verifying Order...</p>
                 </div>
            )}

             {verificationStatus === 'success' && (
                <div className="absolute inset-0 bg-green-500 flex flex-col items-center justify-center z-20 text-white">
                    <CheckCircle className="h-24 w-24 mb-4" />
                    <h2 className="text-3xl font-bold">Gate Open!</h2>
                    <p>Have a great day!</p>
                    <Button onClick={resetScanner} variant="outline" className="mt-8 bg-green-500 text-white border-white hover:bg-white hover:text-green-500">Scan Next</Button>
                </div>
            )}

             {verificationStatus === 'error' && (
                <div className="absolute inset-0 bg-destructive flex flex-col items-center justify-center z-20 text-white text-center p-4">
                    <XCircle className="h-24 w-24 mb-4" />
                    <h2 className="text-3xl font-bold">Verification Failed</h2>
                    <p>Please see a store associate for assistance.</p>
                     <Button onClick={resetScanner} variant="outline" className="mt-8 bg-destructive text-white border-white hover:bg-white hover:text-destructive">Try Again</Button>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
