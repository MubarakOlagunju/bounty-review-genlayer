import { createClient } from "genlayer-js";
import type { BountyData, TransactionReceipt } from "./types";

export default class BountyContract {
  private client;
  public contractAddress: string;
  public userAddress?: string;

  constructor(contractAddress: string, userAddress?: string, studioUrl?: string) {
    this.contractAddress = contractAddress;
    this.userAddress = userAddress;
    
    // Initialize the GenLayer client
    this.client = createClient({
      endpoint: studioUrl || process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api",
    });
  }

  /**
   * Fetches the current state of the single bounty from the blockchain.
   * Maps to @gl.public.view def get_bounty_data()
   */
  async getBountyData(): Promise<BountyData> {
    try {
      const data = await this.client.readContract({
        // Cast the generic string to the strict hex string type required by GenLayer
        address: this.contractAddress as `0x${string}`,
        functionName: "get_bounty_data",
        args: [],
      });
      
      // Use unknown first to safely bypass strict type overlap checking
      return data as unknown as BountyData;
    } catch (error) {
      console.error("Error fetching bounty data:", error);
      throw new Error("Failed to read bounty data from the contract.");
    }
  }

  /**
   * Submits a URL for AI evaluation and strict consensus validation.
   * Maps to @gl.public.write def evaluate_submission()
   */
  async evaluateSubmission(submissionUrl: string): Promise<TransactionReceipt> {
    // Rely on the securely stored userAddress from the class constructor
    if (!this.userAddress || !this.userAddress.startsWith("0x")) {
      throw new Error("Invalid wallet address. Please disconnect and reconnect your wallet.");
    }

    try {
      const tx = await this.client.writeContract({
        address: this.contractAddress as `0x${string}`,
        functionName: "evaluate_submission",
        args: [submissionUrl], // THE FIX: Only sending the URL to the Python contract now
        // Securely pass the wallet address to the SDK for the transaction signature
        account: { address: this.userAddress as `0x${string}` } as any,
        value: 0n, 
      });
      
      return tx as unknown as TransactionReceipt;
    } catch (error) {
      console.error("Error evaluating submission:", error);
      throw error; 
    }
  }
}