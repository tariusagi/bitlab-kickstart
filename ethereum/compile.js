const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

// Name of the contracts source file.
const SOL_FILE = 'Campaign.sol';

// Construct the path to the build folder. Compiled JSON files will be put here.
const buildPath = path.resolve(__dirname, 'build');

// Delete the build folder first.
fs.removeSync(buildPath);

// Read the contracts's source code.
const campaignPath = path.resolve(__dirname, 'contracts', SOL_FILE);
const source = fs.readFileSync(campaignPath, 'utf8');

// Define input for Solidity compiler.
const input = {
	language: 'Solidity',
	sources: {
		[SOL_FILE]: {
			content: source,
		},
	},
	settings: {
		outputSelection: {
			'*': {
				'*': ['*'],
			},
		},
	},
};

// Now compile.
console.log('Compiling ' + campaignPath);
const compilerOutput = JSON.parse(solc.compile(JSON.stringify(input)));

// Handle compiler error.
if (compilerOutput.errors) {
	console.error('Solidity compilation error:');
	throw compilerOutput.errors;
}

// No error? Now write the compiled output to JSON files at the build folder.
fs.ensureDirSync(buildPath);
const output = compilerOutput.contracts[SOL_FILE];

for (let contract in output) {
	const filePath = path.resolve(buildPath, contract + '.json');
	console.log('Writing ' + filePath);
	fs.outputJSONSync(filePath, output[contract]);
}

console.log('All done!');