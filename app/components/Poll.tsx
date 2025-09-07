'use client';

import { useState } from 'react';
import { Contract } from 'ethers';

interface PollData {
  id: number;
  name: string;
  optionNames: string[];
  votes: number[];
  deadline: number;
}

interface PollProps {
  poll: PollData;
  contract: Contract | null;
  onVote: () => void;
}

export default function Poll({ poll, contract, onVote }: PollProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const vote = async (option: number) => {
    if (!contract || isVoting) return;
    try {
      setIsVoting(true);
      const tx = await contract.vote(poll.id, option);
      await tx.wait();
      onVote();
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const totalVotes = poll.votes.reduce((sum, votes) => sum + votes, 0);

  return (
    <div className="border p-4 mb-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div 
        className="cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <h3 className="text-lg font-bold">{poll.name}</h3>
          <p className="text-sm text-gray-500">
            Deadline: {new Date(poll.deadline * 1000).toLocaleString()}
          </p>
        </div>
        <span className="text-gray-400">
          {isOpen ? '▼' : '▶'}
        </span>
      </div>

      {isOpen && (
        <div className="mt-4">
          {poll.optionNames.map((option, index) => {
            const voteCount = poll.votes[index];
            const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
            
            return (
              <div key={index} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span>{option}</span>
                  <span>{voteCount} votes ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-end">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        style={{ width: `${percentage}%` }}
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      ></div>
                    </div>
                  </div>
                </div>
                <button
                  className={`w-full py-2 px-4 rounded ${
                    isVoting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white transition-colors`}
                  onClick={(e) => {
                    e.stopPropagation();
                    vote(index);
                  }}
                  disabled={isVoting}
                >
                  {isVoting ? 'Voting...' : `Vote for ${option}`}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}