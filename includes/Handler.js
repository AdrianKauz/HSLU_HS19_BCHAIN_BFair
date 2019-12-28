const EthereumTx = require('ethereumjs-tx').Transaction;
const axios = require('axios');

class Handler {
    printTokenBalanceForAddress(web3, contract, walletAddress) {
        const contractObject = new web3.eth.Contract(contract.getABI(), contract.getAddress());
        contractObject.methods.balanceOf(walletAddress).call().then(tokens => {
            console.log('Current token balance for \x1b[36m' + walletAddress + '\x1b[37m: \n' + (tokens / Math.pow(10, contract.getDecimals())) + ' ' + contract.getSymbol());
        });
    }


    async transferFunds(web3, owner, receiver, amountToSend) {
        return new Promise(async (resolve, reject) => {
            const rawTransaction = await this.prepareFundTransaktion(web3, owner, receiver, amountToSend);
            const transactionResult = await this.sendSignedTransfer(web3, owner, rawTransaction);
        });
    }


    async transferTokens(web3, contract, contractOwner, receiver, amountToSend) {
        return new Promise(async (resolve, reject) => {
            const rawTransaction = await this.prepareTokenTransaktion(web3, contract, contractOwner, receiver, amountToSend);
            const transactionResult = await this.sendSignedTransfer(web3, contractOwner, rawTransaction);
        });
    }


    async prepareFundTransaktion(web3, owner, receiver, amountToSend) {
        return new Promise(async (resolve, reject) => {
            const nonce = await web3.eth.getTransactionCount(owner.getAddress(), 'pending');
            web3.eth.getBalance(owner.getAddress(), async (err, result) => {
                if (err) {
                    return reject();
                }
                let balance = web3.utils.fromWei(result, "ether");
                console.log(balance + " ETH");
                if(balance < amountToSend) {
                    console.log('insufficient funds');
                    return reject();
                }

                let gasPrices = await this.getCurrentGasPrices();
                resolve( {
                    "to": receiver.getAddress(),
                    "value": web3.utils.toHex(web3.utils.toWei(amountToSend.toString(), 'ether')),
                    "gas": 21000,
                    "gasPrice": gasPrices.low * 1000000000,
                    "nonce": nonce,
                    "chainId": 3 // EIP 155 chainId - mainnet: 1, ropsten: 3, rinkeby: 4
                });
            });
        });
    };


    async prepareTokenTransaktion(web3, contract, contractOwner, receiver, amountToSend) {
        return new Promise(async (resolve, reject) => {
            const amountAsHex = web3.utils.toHex(amountToSend * Math.pow(10, contract.getDecimals()));
            const nextNonce = await web3.eth.getTransactionCount(contractOwner.getAddress(), 'pending');
            const contractObject = new web3.eth.Contract(contract.getABI(), contract.getAddress(), {from: contractOwner.getAddress()});

            resolve (
                {
                "from":     contractOwner.getAddress(),
                "gasPrice": web3.utils.toHex(2 * 1e9),
                "gasLimit": web3.utils.toHex(210000),
                "to":       contract.getAddress(),
                "value":    web3.utils.toHex(0),
                "data":     contractObject.methods.transfer(receiver.getAddress(), amountAsHex).encodeABI(),
                "nonce":    web3.utils.toHex(nextNonce),
                "chainId":  3
            });
        })
    }


    async sendSignedTransfer(web3, owner, rawTransaction) {
        return new Promise(async (resolve, reject) => {
            const transaction = new EthereumTx(rawTransaction, {chain: 'ropsten'});
            transaction.sign(Buffer.from(owner.getPrivateKeyWithoutPrefix(),'hex'));
            const serializedTransaction = transaction.serialize();

            web3.eth.sendSignedTransaction('0x' + serializedTransaction.toString('hex'), (err, id) => {
                if(err) {
                    console.log(err);
                    return reject();
                }
                const url = `https://ropsten.etherscan.io/tx/${id}`;
                console.log(url);
                resolve({id: id, link: url});
            });
        })
    }

    async getCurrentGasPrices() {
        let response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json');

        let prices = {
            low: response.data.safeLow / 10,
            medium: response.data.average / 10,
            high: response.data.fast / 10
        };
        return prices;
    }

    printTransaction(web3, hash) {
        web3.eth.getTransaction(hash)
            .then(object => {
                console.log(object);
            });
    }

    printBalance(web3, wallet) {
        web3.eth.getBalance(wallet.getAddress()).then(wei => {
            console.log("Wei: " + wei);
            console.log("Ether: " + web3.utils.fromWei(wei, 'ether'));
        });
    }
}

module.exports = {
    TokenHandler: Handler
};