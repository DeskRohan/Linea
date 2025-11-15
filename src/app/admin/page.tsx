
"use client";

import { useState, useEffect } from "react";
import { useFirestore, useUser } from "@/firebase";
import { collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, KeyRound, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ActivationKey {
  id: string;
  isUsed: boolean;
  usedBy?: string;
  createdAt: {
    toDate: () => Date;
  };
  usedAt?: {
    toDate: () => Date;
  };
}

export default function AdminPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [keys, setKeys] = useState<ActivationKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // NOTE: This is a placeholder for real admin auth.
  // In a production app, you would check for a custom claim.
  const isAdmin = user; // For now, any logged-in user can be an admin.

  useEffect(() => {
    if (!firestore || !isAdmin) return;

    const keysQuery = query(collection(firestore, "activation_keys"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(keysQuery, (snapshot) => {
      const fetchedKeys = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ActivationKey));
      setKeys(fetchedKeys);
      setIsLoading(false);
    });

    return () => unsubscribe();

  }, [firestore, isAdmin]);

  const generateKey = async () => {
    setIsGenerating(true);
    try {
      const newKey = `LINEA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      await addDoc(collection(firestore, "activation_keys"), {
        createdAt: serverTimestamp(),
        isUsed: false,
      });
       toast({
        title: "Key Generated!",
        description: "A new activation key has been created.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Generating Key",
        description: error.message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (keyId: string) => {
    navigator.clipboard.writeText(keyId);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000); // Reset after 2 seconds
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Activation Key Management</CardTitle>
                <CardDescription>Generate and track keys for new store signups.</CardDescription>
            </div>
             <Button onClick={generateKey} disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <KeyRound className="mr-2 h-4 w-4" />
              )}
              Generate New Key
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activation Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Used By (UID)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : keys.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={4} className="h-40 text-center text-muted-foreground">
                            No keys generated yet. Click the button to create one.
                        </TableCell>
                    </TableRow>
                ) : (
                  keys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-mono">
                         <div className="flex items-center gap-2">
                            <span>{key.id}</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(key.id)}>
                                {copiedKey === key.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                         </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={key.isUsed ? "secondary" : "default"}>
                          {key.isUsed ? "Used" : "Available"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {key.createdAt?.toDate().toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{key.usedBy || "N/A"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
