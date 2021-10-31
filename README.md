# Intro
This project source code is based on this Udemy's course: [Ethereum and Solidity: The Complete Developer's Guide](https://www.udemy.com/course/ethereum-and-solidity-the-complete-developers-guide) (with Stephen Grider as the instructor), and was updated to use the latest `solc` version 0.8.9 (as of this writing) and `@truffle/hdwallet-provider` package instead of old `solc` 0.4.17 and `truffle-hdwallet-provider` package.

# Compile
To compile the contract, enter `./ethereum/` folder, run `node compile.js`. The compiled contracts (`Campaign.json` and `CampaignFactory.json`) will be put into `./ethereum/build/` folder. You need those files for testing and deployment.

# Test
To test the code, at the project root, run `npm run test`. You MUST compile the contracts first (see [Compile](#compile) section above), before running tests.

# Deploy
You have to deploy the contract to a real Ethereum network before running the web frontend server. You should use a testnet like Rinkeby, do not use the mainnet, because it costs real ETH, which is real money.

To deploy the contract, you must prepare these info:

1. The compiled contracts (see [Compile](#compile) section above).
2. A MetaMask's ethereum wallet. Search the web for how to do this, and *write down the wallet's mnemonics phrases*.
3. Register with [Infura](https://infura.io) and create a new Ethereum project to obtain an API to access the Ethereum network (remember to select the correct nework for this project, which is currently Rinkeby). *Write down the Infura API key*.
4. You will need some ether in your wallet to deploy and test the frontend out. Go to a Rinkeby faucet and ask for some ether. I list some of them in the [Faucets](#faucets) section below.

When you have the mnemonics and Infura API key, open `./ethereum/config.js` and put those values into the coressponding field. The result should look like this:
```js
module.exports = {
  mnemonics: 'this is your metamask wallet mnemonics phrases to be used in project',  
  infuraKey: 'https://rinkeby.infura.io/v3/24ba923446a2217ceafb5390ee9f0721',
  factoryAddress: ''
}
```
*Do not try the above values, they are faked. And DO NOT let anyone else know your mnemonics. That's the key to your wallet.*

After that, enter `./ethereum/` folder, run `node deploy.js`. If the deployment was successfull, the console should have output like this:
```sh
Trying to deploy from account 0xF9E8DC189Cba0Bb26130E811D0037fcE39F19A48
Contract address: 0xc8B5c72Ae077922b8CFa157826111bD9a4fD1C01
Contract interface: [
  {
    inputs: [ [Object] ],
    name: 'createCampaign',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
    constant: undefined,
    payable: undefined,
    signature: '0xa3303a75'
  },
  {
    inputs: [ [Object] ],
    name: 'deployedCampaigns',
    outputs: [ [Object] ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
    payable: undefined,
    signature: '0x339d50a5'
  },
  {
    inputs: [],
    name: 'getDeployedCampaigns',
    outputs: [ [Object] ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
    payable: undefined,
    signature: '0x4acb9d4f'
  }
]
```
Copy the deployed contract's address (from "Contract address" line) to the `./ethereum/config.js`, so it looks like this:
```js
module.exports = {
  mnemonics: 'this is your metamask wallet mnemonics phrases to be used in project',  
  infuraKey: 'https://rinkeby.infura.io/v3/24ba923446a2217ceafb5390ee9f0721',
  factoryAddress: '0xc8B5c72Ae077922b8CFa157826111bD9a4fD1C01'
}
```
*Do not try the above values, they are all faked*

After that, you're ready to run the web frontend server and test the project out.

# Run the frontend web server
To run the frontend web server, go to the project's root and run `npm run dev`. If everything is OK, a browser will automatically open the `http://localhost:3000` page to view the project's web frontend. If it doesn't, you then do that yourself.

# Faucets
This project code currently use Rinkeby testnet. Ether in this testnet has no real value, and cannot be mined. You can only ask somebody to send you some Rinkeby's ether or put a request on its faucets. You will need around **0.01** ether to start playing around with this project (contract deployment costs around 0.001 ether, and other activities costs a little less).

Here's the list of faucets that are still working today:
- The official, [authenticated faucet](https://faucet.rinkeby.io/). You can ask from 3 up to 18.75 ether within 3 days.
- The [testnet.help](https://testnet.help/en/ethfaucet/rinkeby) faucet. It gives you 0.01 ether and you have to wait 24h to make another request.
- The [rinkeby-faucet.com](https://rinkeby-faucet.com/send) faucet. It gives 0.001 ether every 24 hours.
