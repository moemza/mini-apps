'use client';

import { useState, useEffect } from 'react';
import Poll from './Poll.tsx';
import { Contract } from 'ethers';

interface PollData {
  id: number;
  name: string;
  deadline: number;
  votesA: number;
  votesB: number;
}

interface PollListProps {
  contract: Contract | null;
}

export default function PollList({ contract }: PollListProps) {
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
          deadline: poll.deadline,
          votesA: poll.votesA,
          votesB: poll.votesB
        });
      }
      setPolls(pollsData);
    }
    getPolls();
  }, [contract]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Polls</h2>
      {polls.map((poll) => (
        <Poll key={poll.id} poll={poll} contract={contract} />
      ))}
    </div>
  );
}