'use client';

import { useState } from 'react';
import { Contract } from 'ethers';

interface CreatePollProps {
  contract: Contract | null;
}

export default function CreatePoll({ contract }: CreatePollProps) {
  const [name, setName] = useState('');
  const [deadline, setDeadline] = useState('');

  const createPoll = async () => {
    if (!name || !deadline || !contract) return;
    const deadlineInSeconds = Math.floor(new Date(deadline).getTime() / 1000);
    const tx = await contract.createPoll(name, deadlineInSeconds);
    await tx.wait();
    setName('');
    setDeadline('');
  };

  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold mb-2">Create Poll</h2>
      <input
        type="text"
        placeholder="Poll Name"
        className="border p-2 mr-2"
        value={name}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
      />
      <input
        type="datetime-local"
        className="border p-2 mr-2"
        value={deadline}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeadline(e.target.value)}
      />
      <button className="bg-blue-500 text-white p-2" onClick={createPoll}>
        Create
      </button>
    </div>
  );
}