// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Poll {
        string name;
        uint256 deadline;
        uint256 votesA;
        uint256 votesB;
        address creator;
    }

    mapping(uint256 => Poll) public polls;
    uint256 public pollCount;

    mapping(address => mapping(uint256 => bool)) public hasVoted;

    event Voted(uint256 indexed pollId, address indexed voter, uint256 option);

    function createPoll(string memory _name, uint256 _deadline) public {
        require(_deadline > block.timestamp, "Deadline must be in the future");
        pollCount++;
        polls[pollCount] = Poll(_name, _deadline, 0, 0, msg.sender);
    }

    function vote(uint256 _pollId, uint256 _option) public {
        require(polls[_pollId].deadline > block.timestamp, "Poll has ended");
        require(!hasVoted[msg.sender][_pollId], "You have already voted");
        require(_option == 0 || _option == 1, "Invalid option");

        if (_option == 0) {
            polls[_pollId].votesA++;
        } else {
            polls[_pollId].votesB++;
        }

        hasVoted[msg.sender][_pollId] = true;
        emit Voted(_pollId, msg.sender, _option);
    }
}