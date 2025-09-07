pragma solidity ^0.8.0;

contract Voting {
    struct Poll {
        string name;
        string[] optionNames;
        uint256[] votes;
        uint256 deadline;
        address creator;
    }

    mapping(uint256 => Poll) public polls;
    uint256 public pollCount;

    mapping(address => mapping(uint256 => bool)) public hasVoted;

    event Voted(uint256 indexed pollId, address indexed voter, uint256 option);

    function createPoll(string memory _name, string[] memory _optionNames, uint256 _deadline) public {
        require(_deadline > block.timestamp, "Deadline must be in the future");
        pollCount++;
        uint256[] memory votes = new uint256[](_optionNames.length);
        polls[pollCount] = Poll(_name, _optionNames, votes, _deadline, msg.sender);
    }

    function vote(uint256 _pollId, uint256 _option) public {
        require(polls[_pollId].deadline > block.timestamp, "Poll has ended");
        require(!hasVoted[msg.sender][_pollId], "You have already voted");
        require(_option < polls[_pollId].optionNames.length, "Invalid option");

        polls[_pollId].votes[_option]++;

        hasVoted[msg.sender][_pollId] = true;
        emit Voted(_pollId, msg.sender, _option);
    }
}