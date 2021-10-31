const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

let accounts;
let factory;
let campaignAddress;
let campaign;

// Run this before each test ("it" hook).
beforeEach(async () => {
	// Get a list of all accounts in the network.
	accounts = await web3.eth.getAccounts();
	// Use the first account to deploy the factory.
	factory = await new web3.eth.Contract(compiledFactory.abi)
		// Call deploy() to prepare the deployment.
		.deploy({ data: compiledFactory.evm.bytecode.object })
		// Now call send() to actually deploy the contract, which costs gas.
		.send({ from: accounts[0], gas: '1500000' });
	// Now create a new campaign with minimum contribution of 100 wei.
	await factory.methods.createCampaign('100').send({
		from: accounts[0],
		gas: '1000000'
	});
	// Get back the address of the new campaign.
	[campaignAddress] = await factory.methods.getDeployedCampaigns().call();
	// And the new campaign contract itself.
	campaign = await new web3.eth.Contract(
		compiledCampaign.abi,
		campaignAddress
	);
});

// The test suite.
describe('Campaigns', () => {
	// Check if the factory was deployed and a new campaign was created.
	it('deploys a factory and a campaign', () => {
		assert.ok(factory.options.address);
		assert.ok(campaign.options.address);
	});
	// Check if campaign creator was assigned as its manager.
	it('marks the caller as the campaign manager', async () => {
		const manager = await campaign.methods.manager().call();
		assert.equal(manager, accounts[0]);
	});
	// Check if a person can contribute, and will then be made an approver.
	it('allows a person to contribute and be an approvers', async () => {
		await campaign.methods.contribute().send({
			value: '200',
			from: accounts[1]
		});
		assert(await campaign.methods.approvers(accounts[1]).call());
	});
	// Check if a minimum contribution (100 wei) must be met.
	it('requires a minimum contribution', async () => {
		result = false;
		try {
			// Purposedly send less than minimum. The contract should throw an error.
			await campaign.methods.contribute().send({
				value: '90',
				from: accounts[1]
			})
		} catch (err) {
			// If an error was thrown, that means this test passed.
			result = true;
		}
		assert(result);
	});
	// Check if the manager can make payment request.
	it('allow manager to make payment request', async () => {
		// Create a request to buy batteries with 100 wei from second account.
		await campaign.methods
			.createRequest('Buy batteries', '100', accounts[1])
			.send({ from: accounts[0], gas: '1000000' });
		// Get the number of request created. It should be 1.
		const requestsCount = await campaign.methods.requestsCount().call();
		assert.equal(1, requestsCount);
		// Now get back the newly created request.
		const request = await campaign.methods.requests(0).call();
		// Check if its description is correct. We only check the description and
		// assume that everything else is OK if the description is OK.
		assert.equal('Buy batteries', request.description);
	});
	// Check if a request can be processed and finalized.
	it('processes a request (create, approve, finalize)', async () => {
		// Create a request.
		await campaign.methods
			.createRequest('Buy batteries', '100', accounts[1])
			.send({ from: accounts[0], gas: '1000000' });
		// Make contribution from an account.
		await campaign.methods.contribute().send({ value: '200', from: accounts[1] });
		// Now approve the request.
		await campaign.methods.approveRequest(0).send({ from: accounts[1], gas: '1000000' });
		// Record the current balance of the recipient. We need BigInt here since
		// balance is in wei, which larger than int.
		const lastBalance = BigInt(await web3.eth.getBalance(accounts[1]));
		// Finally, finalize the request using manager account.
		await campaign.methods.finalizeRequest(0).send({ from: accounts[0], gas: '1000000' });
		// Record the new balance of the recipient.
		const newBalance = BigInt(await web3.eth.getBalance(accounts[1]));
		// Now verify the received amount.
		assert((newBalance - lastBalance) == 100);
	});

});