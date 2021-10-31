const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const compiledFactory = require('./build/CampaignFactory.json');
const config = require('./config');

console.log(config);

// Configure a provider into the Rinkedby network with my MetaMask mnemonics and
// my Infura API key.
const provider = new HDWalletProvider(
    config.mnemonics,
    config.infuraKey
)

const web3 = new Web3(provider);

// Define an asynchronous function to deploy the contract.
const deploy = async () => {
    // Get a list of all unlocked accounts in the network.
    const accounts = await web3.eth.getAccounts();
    console.log('Trying to deploy from account', accounts[0]);
    // Use the first account to deploy the contract.
    const contract = await new web3.eth.Contract(compiledFactory.abi)
        // Call deploy() to prepare the deployment.
        .deploy({ data: compiledFactory.evm.bytecode.object })
        // Now call send() to actually deploy the contract, which costs gas.
        // Since EIP 1599 hard fork in Rinkedby network, gas price has to be set
        // high enough to make sure my deployment get done quickly.
        .send({ gas: '1500000', gasPrice: web3.utils.toWei('1.001', 'gwei'), from: accounts[0] });
    console.log('Contract address:', contract.options.address);
    console.log('Contract interface:', compiledFactory.abi);
    provider.engine.stop();
}

// Now, execute the deployment.
deploy();