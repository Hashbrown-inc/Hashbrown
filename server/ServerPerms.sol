// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract ServerPerms {
    address public admin;
    AggregatorV3Interface private oracle;
    mapping(address => bool) private servers;

    event ServerAdded(address server);
    event ServerRemoved(address server);

    constructor(address oracleAddress) {
        admin = msg.sender;
        oracle = AggregatorV3Interface(oracleAddress);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only the admin can perform this action");
        _;
    }

    function addServer(address server) external onlyAdmin {
        require(!servers[server], "Server is already registered");
        servers[server] = true;
        emit ServerAdded(server);
    }

    function removeServer(address server) external onlyAdmin {
        require(servers[server], "Server is not registered");
        servers[server] = false;
        emit ServerRemoved(server);
    }

    function isServerAllowed(address server) public view returns (bool) {
        // Request server access status from the oracle.
        // The oracle should return 1 for allowed servers and 0 for disallowed servers.
        (, int256 accessStatus, , , ) = oracle.latestRoundData();
        return accessStatus == 1 && servers[server];
    }
}
