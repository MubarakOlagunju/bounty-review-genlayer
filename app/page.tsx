"use client";

import { BountiesTable } from "@/components/BountiesTable";
import { SubmissionHistory } from "@/components/SubmissionHistory";
import { useWallet, formatAddress } from "@/lib/genlayer/wallet";
import { Button } from "@/components/ui/button";
import { useSubmitWork } from "@/lib/hooks/useBounty"; // <-- Added this import

export default function Home() {
  const { address, isConnected, isLoading, connectWallet, disconnectWallet } = useWallet();
  
  // <-- Added this to pull the history state from the hook
  const { submissions } = useSubmitWork(); 

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header Navigation */}
        <header className="flex justify-between items-center pb-6 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              GenLayer Bounty Review
            </h1>
            <p className="text-sm text-gray-400 mt-1">Trustless AI work evaluation</p>
          </div>
          
          {/* Inline Wallet Connection UI */}
          <div>
            {isLoading ? (
              <Button disabled variant="outline">Loading...</Button>
            ) : !isConnected || !address ? (
              <Button onClick={connectWallet}>Connect MetaMask</Button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="bg-white/10 px-3 py-1.5 rounded-md text-sm border border-white/10 font-mono text-gray-300">
                  {formatAddress(address)}
                </div>
                <Button variant="destructive" size="sm" onClick={disconnectWallet}>
                  Disconnect
                </Button>
              </div>
            )}
          </div>
        </header>
        
        {/* Main Content Area */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Active Developer Task</h2>
            <p className="text-gray-400 text-sm">
              Submit your completed work below. GenLayer's GenVM AI will automatically evaluate the URL against the strict criteria to determine if you earn the reward.
            </p>
          </div>
          
          <BountiesTable />
          
          {/* <-- Added the Submission History component here */}
          <SubmissionHistory submissions={submissions || []} />

        </section>

      </div>
    </main>
  );
}