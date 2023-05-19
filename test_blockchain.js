const { Blockchain, Transaction } = require('./blockchain.js');

function main() {
  // Initialize blockchain
  const myBlockchain = new Blockchain();

  // Create some test transactions
  const tx1 = new Transaction('address1', 'address2', 5);
  const tx2 = new Transaction('address2', 'address3', 10);
  const tx3 = new Transaction('address3', 'address1', 2);

  // Add transactions to the pending transactions list
  myBlockchain.addTransaction(tx1);
  myBlockchain.addTransaction(tx2);
  myBlockchain.addTransaction(tx3);

  console.log('Starting the miner...');
  myBlockchain.minePendingTransactions('miner_address');

  console.log('Balance of address1:', myBlockchain.getBalanceOfAddress('address1'));
  console.log('Balance of address2:', myBlockchain.getBalanceOfAddress('address2'));
  console.log('Balance of address3:', myBlockchain.getBalanceOfAddress('address3'));
  console.log('Balance of miner_address:', myBlockchain.getBalanceOfAddress('miner_address'));

  console.log('Is the chain valid?', myBlockchain.isChainValid());

  console.log('\nBlockchain data:');
  for (const block of myBlockchain.chain) {
    console.log(`Block ${block.index}:`);
    console.log(`  Timestamp: ${block.timestamp}`);
    console.log(`  Previous hash: ${block.previousHash}`);
    console.log(`  Hash: ${block.hash}`);
    console.log(`  Transactions:`);
    for (const transaction of block.transactions) {
      console.log(`    ${transaction.fromAddress} -> ${transaction.toAddress}: ${transaction.amount}`);
    }
  }
}

main();