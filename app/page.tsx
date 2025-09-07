"use client";
'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import CreatePoll from './components/CreatePoll';
import PollList from './components/PollList';
import { VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI } from '@/contracts/config';

export default function Home() {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [refreshPolls, setRefreshPolls] = useState(0);

  useEffect(() => {
    const initContract = async () => {
      try {
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const signer = provider.getSigner();
        const votingContract = new ethers.Contract(
          VOTING_CONTRACT_ADDRESS,
          VOTING_CONTRACT_ABI,
          signer
        );
        setContract(votingContract);
      } catch (error) {
        console.error('Failed to initialize contract', error);
      }
    };

    if ((window as any).ethereum) {
      initContract();
    }
  }, []);

  const handlePollAction = () => {
    setRefreshPolls(prev => prev + 1);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Decentralized Voting Application
        </h1>
        <div className="space-y-8">
          <CreatePoll contract={contract} onPollCreated={handlePollAction} />
          <PollList contract={contract} refreshCounter={refreshPolls} onVote={handlePollAction} />
        </div>
      </div>
    </main>
  );
}