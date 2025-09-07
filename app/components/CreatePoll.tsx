import { useState } from 'react';
import { Contract } from 'ethers';

interface CreatePollProps {
  contract: Contract | null;
  onPollCreated: () => void;
}

const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const hours = String(tomorrow.getHours()).padStart(2, '0');
    const minutes = String(tomorrow.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function CreatePoll({ contract, onPollCreated }: CreatePollProps) {
  const [name, setName] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [deadline, setDeadline] = useState(getTomorrow());
  const [isCreating, setIsCreating] = useState(false);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const createPoll = async () => {
    console.log("Creating poll with values:");
    console.log("Name:", name);
    console.log("Options:", options);
    console.log("Deadline:", deadline);
    console.log("Contract:", contract);
    if (!name || options.some(o => !o) || !deadline || !contract) {
      alert('Please fill out all fields.');
      return;
    }
    setIsCreating(true);
    try {
      const deadlineInSeconds = Math.floor(new Date(deadline).getTime() / 1000);
      const tx = await contract.createPoll(name, options, deadlineInSeconds);
      await tx.wait();
      onPollCreated();
      setName('');
      setOptions(['', '']);
      setDeadline(getTomorrow());
    } catch (error) {
      console.error('Error creating poll:', error);
      alert('Error creating poll. Check the console for details.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Create a New Poll</h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Poll Name"
          className="w-full p-2 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {options.map((option, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Option ${index + 1}`}
            className="w-full p-2 border rounded"
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
          />
        ))}
        <div className="flex flex-wrap gap-2">
          <button 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded transition-colors"
            onClick={addOption}
          >
            Add Option
          </button>
          <input
            type="datetime-local"
            className="p-2 border rounded"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
          <button 
            className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors ${
              isCreating ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={createPoll}
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : 'Create Poll'}
          </button>
        </div>
      </div>
    </div>
  );
}