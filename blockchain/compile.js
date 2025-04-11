const fs = require("fs");
const path = require("path");
const solc = require("solc");

const buildPath = path.join(__dirname, "build");

// Ensure build directory exists
if (!fs.existsSync(buildPath)) {
  fs.mkdirSync(buildPath);
}

// Read all .sol files in the current (blockchain root) directory
const solFiles = fs.readdirSync(__dirname).filter(file => file.endsWith(".sol"));
console.log(solFiles)

if (solFiles.length === 0) {
  console.error("No Solidity files found in the blockchain root folder.");
  process.exit(1);
}

// Build the sources object only for your own Solidity files
const sources = {};
solFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  sources[file] = { content: fs.readFileSync(filePath, "utf8") };
});

// Import callback specifically for OpenZeppelin 4.9
function findImports(importPath) {
  if (importPath.startsWith("@openzeppelin/contracts")) {
    const fullPath = path.join(
      __dirname,
      "node_modules",
      "@openzeppelin",
      "contracts",
      importPath.substring("@openzeppelin/contracts/".length)
    );
    return { contents: fs.readFileSync(fullPath, "utf8") };
  }
  return { error: `File not found: ${importPath}` };
}

const input = {
  language: "Solidity",
  sources,
  settings: {
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode.object"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
console.log(output)
// Error handling
if (output.errors) {
  output.errors.forEach(err => {
    console[err.severity === 'error' ? 'error' : 'warn'](err.formattedMessage);
  });
  if (output.errors.some(err => err.severity === 'error')) {
    process.exit(1);
  }
}

// Write separate ABI and BIN files for contracts from only the local sources
Object.keys(sources).forEach(sourceFile => {
  if (!output.contracts[sourceFile]) {
    console.warn(`No contracts compiled from ${sourceFile}`);
    return;
  }
  for (const contractName in output.contracts[sourceFile]) {
    const contract = output.contracts[sourceFile][contractName];

    // Write ABI to file
    fs.writeFileSync(
      path.join(buildPath, `${contractName}.abi`),
      JSON.stringify(contract.abi, null, 2)
    );

    // Write bytecode to file
    fs.writeFileSync(
      path.join(buildPath, `${contractName}.bin`),
      contract.evm.bytecode.object
    );

    console.log(`✅ Compiled ${contractName} from ${sourceFile} successfully!`);
    console.log(`- ABI saved to: ${path.join(buildPath, `${contractName}.abi`)}`);
    console.log(`- Bytecode saved to: ${path.join(buildPath, `${contractName}.bin`)}`);
  }
});