// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// The CampaignFactory contract. We use it to create campaigns. People will not
// create (deploy) Campaign contract directly.
contract CampaignFactory {
    address[] public deployedCampaigns;

    function createCampaign(uint256 minimum) external {
        Campaign newCampaign = new Campaign(minimum, msg.sender);
        deployedCampaigns.push(address(newCampaign));
    }

    // NOTE: external call costs less gas than public, because the EVM doesn't
    // have to create copies of its parameters, and also this method can be
    // called from outside this contract only.
    function getDeployedCampaigns() external view returns (address[] memory) {
        return deployedCampaigns;
    }
}

// The Campaign contract. Requires a minimum contribution amount to initialized.
contract Campaign {
    struct Request {
        string description;
        uint256 value;
        address payable recipient;
        bool complete; // Set to true if the request was finalized.
        uint256 approvalCount;
        // Mapping is used to avoid iteration with arrays (cost lots of gas).
        mapping(address => bool) approvals;
    }

    uint256 public requestsCount;
    mapping(uint256 => Request) public requests;

    address public manager;
    // TODO: add a description to this campaign.
    uint256 public minimumContribution;
    // NOTE: Mapping is used to avoid iteration with arrays (cost lots of gas).
    mapping(address => bool) public approvers;
    uint256 public approversCount;

    constructor(uint256 minimum, address creator) {
        manager = creator;
        minimumContribution = minimum;
    }

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    // NOTE: "payable" modifier is used because people will send money while
    // calling this method. That money will be put into this contract's balance.
    function contribute() external payable {
        require(msg.value > minimumContribution);
        // TODO: only increase the counter if the sender is a new approver.
        approvers[msg.sender] = true;
        approversCount++;
    }

    // NOTE: "restricted" modifier is used since only manager can call this.
    function createRequest(
        string calldata description,
        uint256 value,
        address payable recipient
    ) external restricted {
        Request storage r = requests[requestsCount++];
        r.description = description;
        r.value = value;
        r.recipient = recipient;
        r.complete = false;
        r.approvalCount = 0;
    }

    function approveRequest(uint256 index) external {
        // NOTE: "storage" modifier make "request" act as a reference to the
        // requests array's element, instead of a copy, so I can modify the
        // source element through this variable.
        Request storage request = requests[index];

        // NOTE: Only approvers can approve, and can approve only once per
        // request. Using mapping utilize constant lookup time, which save lots
        // of gas in comparison with array search (interation).
        require(approvers[msg.sender]);
        require(!request.approvals[msg.sender]);

        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }

    // NOTE: "restricted" modifier is used since only manager can call this.
    function finalizeRequest(uint256 index) external restricted {
        Request storage request = requests[index];
        // This request must not be completed yet.
        require(!request.complete);
        // More than half of approvers must approve to settle this request.
        // TODO: replace this mechanism with stake ratio.
        require(request.approvalCount > (approversCount / 2));
        // OK, send request's fund to the recipient.
        request.recipient.transfer(request.value);
        // and mark this request completed.
        request.complete = true;
    }

    function getSummary()
        external
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            address
        )
    {
        return (
            minimumContribution,
            address(this).balance,
            requestsCount,
            approversCount,
            manager
        );
    }
}
