const SHA256 = require('crypto-js/sha256');
const Wallet = require('ethereumjs-wallet');

function generateEthereumKeyPair() {
  const wallet = Wallet.generate();
  const publicKey = wallet.getPublicKeyString();
  const privateKey = wallet.getPrivateKeyString();
  const address = wallet.getAddressString();
  return { publicKey, privateKey, address };
}

class Block {
  constructor(timestamp, transactions, previousHash = '') {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
    return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
  }

  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 50;
  }

  createGenesisBlock() {
    return new Block(Date.now(), [new Transaction(null, 'genesis-address', 0)], '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
    this.pendingTransactions.push(rewardTx);

    let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);

    console.log('Block successfully mined!');
    this.chain.push(block);

    this.pendingTransactions = [];
  }

  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must include from and to addresses');
    }

    this.pendingTransactions.push(transaction);
  }

  getBalanceOfAddress(address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.fromAddress === address) {
          balance -= transaction.amount;
        }

        if (transaction.toAddress === address) {
          balance += transaction.amount;
        }
      }
    }

    return balance;
  }
  // Adding transaction validation
  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must include from and to addresses');
    }

    // Check if the transaction is valid
    if (!transaction.isValid()) {
      throw new Error('Cannot add invalid transaction to chain');
    }

    this.pendingTransactions.push(transaction);
  }
}

class Transaction {
  constructor(fromAddress, toAddress, amount, privateKey) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.privateKey = privateKey;
    this.signature = this.signTransaction();
  }

  calculateHash() {
    return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
  }

  signTransaction() {
    const hashTx = this.calculateHash();
    const sign = Wallet.fromPrivateKey(Buffer.from(this.privateKey, 'hex')).sign(hashTx);
    return sign.toString('hex');
  }

  isValid() {
    if (this.fromAddress === null) return true;

    const publicKey = Wallet.fromPrivateKey(Buffer.from(this.privateKey, 'hex')).getPublicKeyString();
    return Wallet.verify(this.calculateHash(), this.signature, publicKey);
  }
}



let gigacoin = new Blockchain();

const user1 = generateEthereumKeyPair();
const user2 = generateEthereumKeyPair();
const miner = generateEthereumKeyPair();

console.log('User 1:', user1);
console.log('User 2:', user2);
console.log('Miner:', miner);

gigacoin.addTransaction(new Transaction(user1.address, user2.address, 100));
gigacoin.addTransaction(new Transaction(user2.address, user1.address, 50));

console.log('\nStarting the miner...');
gigacoin.minePendingTransactions(miner.address);

console.log('\nBalance of miner is', gigacoin.getBalanceOfAddress(miner.address));
console.log('\nBalance of User 1 is', gigacoin.getBalanceOfAddress(user1.address));
console.log('\nBalance of User 2 is', gigacoin.getBalanceOfAddress(user2.address));

console.log('\nStarting the miner again...');
gigacoin.minePendingTransactions(miner.address);

console.log('\nBalance of miner is', gigacoin.getBalanceOfAddress(miner.address));
console.log('\nBalance of User 1 is', gigacoin.getBalanceOfAddress(user1.address));
console.log('\nBalance of User 2 is', gigacoin.getBalanceOfAddress(user2.address));
