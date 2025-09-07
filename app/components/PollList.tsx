'use client';

import { useState, useEffect } from 'react';
import Poll from './Poll';
import { Contract } from 'ethers';

interface PollData {
  id: number;
  name: string;
  optionNames: string[];
  votes: number[];
  deadline: number;
}

interface PollListProps {
  contract: Contract | null;
  onVote: () => void;
  refreshCounter: number;
}

export default function PollList({ contract, onVote, refreshCounter }: PollListProps) {
  const [polls, setPolls] = useState<PollData[]>([]);

  useEffect(() => {
    async function getPolls() {
      if (!contract) return;
      const pollCount = await contract.pollCount();
      const pollsData: PollData[] = [];
      for (let i = 1; i <= pollCount; i++) {
        const poll = await contract.polls(i);
        pollsData.push({
          id: i,
          name: poll.name,
          optionNames: poll.optionNames,
          votes: poll.votes.map((v: any) => Number(v.toString())),
          deadline: Number(poll.deadline.toString()),
        });
      }
      setPolls(pollsData.reverse());
    }
    if (contract) {
        getPolls();
    }
  }, [contract, refreshCounter]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Polls</h2>
      {polls.map((poll) => (
        <Poll key={poll.id} poll={poll} contract={contract} onVote={onVote} />
      ))}
    </div>
  );
}