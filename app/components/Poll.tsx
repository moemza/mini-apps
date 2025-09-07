'use client';

import { Contract } from 'ethers';

interface PollData {
  id: number;
  name: string;
  deadline: number;
  votesA: number;
  votesB: number;
}

interface PollProps {
  poll: PollData;
  contract: Contract | null;
}

export default function Poll({ poll, contract }: PollProps) {
  const vote = async (option: number) => {
    if (!contract) return;
    const tx = await contract.vote(poll.id, option);
    await tx.wait();
  };

  return (
    <div className="border p-4 mb-4">
      <h3 className="text-lg font-bold">{poll.name}</h3>
      <p>Deadline: {new Date(poll.deadline * 1000).toLocaleString()}</p>
      <p>Votes A: {poll.votesA.toString()}</p>
      <p>Votes B: {poll.votesB.toString()}</p>
      <div className="mt-2">
        <button className="bg-green-500 text-white p-2 mr-2" onClick={() => vote(0)}>
          Vote A
        </button>
        <button className="bg-red-500 text-white p-2" onClick={() => vote(1)}>
          Vote B
        </button>
      </div>
    </div>
  );
}