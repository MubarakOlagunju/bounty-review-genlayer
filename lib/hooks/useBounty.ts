"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import BountyContract from "../contracts/BountyContract";
import { getContractAddress, getStudioUrl } from "../genlayer/client";
import { useWallet } from "../genlayer/wallet";
import { success, error, configError } from "../utils/toast";
import type { BountyData } from "../contracts/types";

export function useBountyContract(): BountyContract | null {
  const { address } = useWallet();
  const contractAddress = getContractAddress();
  const studioUrl = getStudioUrl();

  const contract = useMemo(() => {
    if (!contractAddress) {
      configError(
        "Setup Required",
        "Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env file."
      );
      return null;
    }
    
    // Sanitize the address to prevent the "Ghost String" bug from local storage
    const safeAddress = address && address !== "undefined" && address !== "null" ? address : undefined;

    return new BountyContract(contractAddress, safeAddress, studioUrl || undefined);
  }, [contractAddress, address, studioUrl]);

  return contract;
}

export function useBountyData() {
  const contract = useBountyContract();

  return useQuery<BountyData | null, Error>({
    queryKey: ["bountyData"],
    queryFn: async () => {
      if (!contract) return Promise.resolve(null);
      try {
        return await contract.getBountyData();
      } catch (err) {
        // Silently catch the gen_call drop so it doesn't crash the Next.js UI
        console.warn("Simulator busy processing AI, skipping read...");
        return null; 
      }
    },
    refetchOnWindowFocus: true,
    // Slow down background polling to give the Simulator breathing room
    refetchInterval: 6000, 
    enabled: !!contract,
  });
}

export function useSubmitWork() {
  const contract = useBountyContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  
  const [submissions, setSubmissions] = useState<Array<{url: string, status: 'pending' | 'success' | 'failed'}>>([]);

  // Load from local storage
  useEffect(() => {
    if (!address) {
      setSubmissions([]);
      return;
    }
    const savedHistory = localStorage.getItem(`genlayer_history_${address}`);
    if (savedHistory) {
      try {
        setSubmissions(JSON.parse(savedHistory));
      } catch (err) {
        console.error("Failed to load submission history");
      }
    }
  }, [address]);

  // Save to local storage
  useEffect(() => {
    if (address && submissions.length > 0) {
      localStorage.setItem(`genlayer_history_${address}`, JSON.stringify(submissions));
    }
  }, [submissions, address]);

  const mutation = useMutation({
    mutationFn: async ({ submissionUrl }: { submissionUrl: string }) => {
      if (!contract) throw new Error("Contract not configured.");
      if (!address || !address.startsWith("0x")) throw new Error("Invalid wallet state.");
      
      // Safely add 'pending' state
      setSubmissions(prev => {
        const filtered = prev.filter(s => s.url !== submissionUrl); // Remove duplicates if submitted twice
        return [{ url: submissionUrl, status: 'pending' }, ...filtered];
      });
      
      return contract.evaluateSubmission(submissionUrl, address);
    },
    onSuccess: async (data, variables) => {
      // Safely force the 'success' state, even if execution was instant
      setSubmissions(prev => {
        const exists = prev.find(sub => sub.url === variables.submissionUrl);
        if (exists) {
          return prev.map(sub => sub.url === variables.submissionUrl ? { ...sub, status: 'success' } : sub);
        } else {
          return [{ url: variables.submissionUrl, status: 'success' }, ...prev];
        }
      });
      
      await queryClient.invalidateQueries({ queryKey: ["bountyData"] });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any, variables) => {
      console.error("Error submitting work:", err);
      
      // Safely force the 'failed' state
      setSubmissions(prev => {
        const exists = prev.find(sub => sub.url === variables.submissionUrl);
        if (exists) {
          return prev.map(sub => sub.url === variables.submissionUrl ? { ...sub, status: 'failed' } : sub);
        } else {
          return [{ url: variables.submissionUrl, status: 'failed' }, ...prev];
        }
      });
    },
  });

  return {
    ...mutation,
    isSubmitting: mutation.isPending, // React Query now natively controls the UI lock!
    submissions,
    submitWork: (submissionUrl: string) => mutation.mutate({ submissionUrl }),
  };
}