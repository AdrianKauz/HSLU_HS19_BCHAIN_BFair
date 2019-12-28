const Wallet = require('./includes/Wallet.js').Wallet;
const TokenContract = require('./includes/TokenContract.js').TokenContract;
const Handler = require('./includes/Handler.js').TokenHandler;
const Provider = require('./includes/Provider.js').Provider;
const Web3 = require('web3');

const myWeb3Provider = new Provider();
myWeb3Provider.setURL('https://ropsten.infura.io/v3/');
myWeb3Provider.setAccessToken('8f999aa9084c46c981eeaa08c84a8286'); // If on GitHub, this token is invalid and is just an example.

const myWallet = new Wallet();
myWallet.setOwner('BFair');
myWallet.setAddress('0x03ce686C4491CA66d4afC9c234EcA66136bE710e');
myWallet.setPrivateKey('0x5e722422e7527d16db77e7ac79344888d982b7b21d3b73c234e8608dd8292cbe'); // We don't care. It's on a testnet.

const receiverWallet = new Wallet();
receiverWallet.setOwner('Sinke');
receiverWallet.setAddress('0x56212F540b4a1057cEBD6d10EE66D56a527CfCA2');

const pestalozziToken = new TokenContract();
pestalozziToken.setName('Pestalozzi');
pestalozziToken.setSymbol('PEST');
pestalozziToken.setTotal('100000000000000000000000000');
pestalozziToken.setDecimals('18');
pestalozziToken.setAddress('0xB55872027223cD6179328e9367c28638da7B8885');
pestalozziToken.setABI(require('./ABIs/ABI_PestalozziToken.json'));

const bfairToken = new TokenContract();
bfairToken.setName('BFair Token');
bfairToken.setSymbol('BFAIR');
bfairToken.setTotal('100000000000000000000000000');
bfairToken.setDecimals('18');
bfairToken.setAddress('0x2049c29fa3d89cd5c91ecabb4819a321efb8e429');
bfairToken.setABI(require('./ABIs/ABI_BFairToken.json'));

const web3 = new Web3(myWeb3Provider.getFullURL());
const handler = new Handler();

handler.printTokenBalanceForAddress(web3, bfairToken, receiverWallet.getAddress());
//handler.transferTokens(web3, bfairToken, myWallet, receiverWallet, 10.00);
//handler.transferFunds(web3, myWallet, receiverWallet, 0.1);
//handler.printTransaction(web3, '0xc6a2e1d0a050851d1e2713bd4d8f478ebd748984bfc1ec172cf996667c6457ba');
//handler.printBalance(web3, myWallet);











//console.log(myTokenContract.addressIsValid('0x03ce686c4491ca66d4afc9c234eca66136be710e'));

/*
const myTokenContract = {
    name:       'Pestalozzi',
    symbol:     'PEST',
    total:      100000000000000000000000000,
    decimals:   18,
    address:    '0xB55872027223cD6179328e9367c28638da7B8885',
    abi:        require('./ABIs/ABI_PestalozziToken.json')
};
*/


//----------------------------------------------------------------------------------------------------------------------


//printBalance(myWallet.address);
//getTokenBalance(myTokenContract, myAddress.address);
//getTokenBalance(myTokenContract, '0x56212F540b4a1057cEBD6d10EE66D56a527CfCA2');
//getTransaction('0x543d8c58088ba15d7bb3675d3351220e7833c179d9ffee9b13a47e65f42133f5'); // Contract creation
//getTransaction('0xc9ca862a5e5cfe2e1477fa3c565c49c620109c99898afa6bd4d05fdb0743e7e9'); // 1.5 Ether from faucet
//getCurrentGasPrices();

//sendEther(myWallet, '0x56212F540b4a1057cEBD6d10EE66D56a527CfCA2', 0.1)
//transferFund({address: myWallet.address, privateKey: myWallet.privateKey},{address: '0x56212F540b4a1057cEBD6d10EE66D56a527CfCA2'},0.10);

//transferTokens(myTokenContract, myAddress, '0x56212F540b4a1057cEBD6d10EE66D56a527CfCA2', 3.33);

//console.log(getTransaction('0x99a82832f8c042cd4a72b15610a7a28544b35c25c4c17dff7c7e6b805fb7ce03'));

//----------------------------------------------------------------------------------------------------------------------

// Funktioniert
async function transferTokens(contract, contractOwner, receiver, amountToSend) {
    return new Promise(async (resolve, reject) => {
        const amountAsHex = web3.utils.toHex(amountToSend * Math.pow(10, contract.decimals));
        const nextNonce = await web3.eth.getTransactionCount(contractOwner.address, 'pending');
        const contractObject = new web3.eth.Contract(contract.abi, contract.address, {from: contractOwner.address});

        const rawTransaction = {
            "from":     contractOwner.address,
            "gasPrice": web3.utils.toHex(2 * 1e9),
            "gasLimit": web3.utils.toHex(210000),
            "to":       contract.address,
            "value":    web3.utils.toHex(0),
            "data":     contractObject.methods.transfer(receiver, amountAsHex).encodeABI(),
            "nonce":    web3.utils.toHex(nextNonce),
            "chainId":  3
        };

        const transaction = new EthereumTx(rawTransaction, {chain: 'ropsten'});
        let privateKey = contractOwner.privateKey.split('0x');
        transaction.sign(Buffer.from(privateKey[1],'hex'));
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


async function transferFund(sendersData, recieverData, amountToSend) {
    return new Promise(async (resolve, reject) => {
        const nonce = await web3.eth.getTransactionCount(sendersData.address);
        web3.eth.getBalance(sendersData.address, async (err, result) => {
            if (err) {
                return reject();
            }
            let balance = web3.utils.fromWei(result, "ether");
            console.log(balance + " ETH");
            if(balance < amountToSend) {
                console.log('insufficient funds');
                return reject();
            }

            let gasPrices = await getCurrentGasPrices();
            let details = {
                "to": recieverData.address,
                "value": web3.utils.toHex(web3.utils.toWei(amountToSend.toString(), 'ether')),
                "gas": 21000,
                "gasPrice": gasPrices.low * 1000000000,
                "nonce": nonce,
                "chainId": 3 // EIP 155 chainId - mainnet: 1, ropsten: 3, rinkeby: 4
            };

            const transaction = new EthereumTx(details, {chain: 'ropsten'});
            let privateKey = sendersData.privateKey.split('0x');
            let privKey = Buffer.from(privateKey[1],'hex');
            transaction.sign(privKey);

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
        });
    });
}

async function getCurrentGasPrices() {
    let response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json');

    let prices = {
        low: response.data.safeLow / 10,
        medium: response.data.average / 10,
        high: response.data.fast / 10
    };
    return prices;
}

async function getBalance(address) {
    return new Promise((resolve, reject) => {
        web3.eth.getBalance(address, async (err, result) => {
            if(err) {
                return reject(err);
            }
            resolve(web3.utils.fromWei(result, "ether"));
        });
    });
}


//is working


function sendToken(contract, fromWalletAddress, toWalletAddress, totalAmount) {
    //let amount = web3.utils.toBN(totalAmount).mul(web3.utils.toBN(10).pow(web3.utils.toBN(18)));
    let value = totalAmount.mul(web3.utils.toBN(10).pow(web3.utils.toBN(18)));
    const contractObject = new web3.eth.Contract(contract.ABI, contract.Address);

    contractObject.methods.transfer(toWalletAddress, value.toString()).send({from: fromWalletAddress}).then(result => {
        console.log(result);
    })
}


// is working
function printBalance(walletAddress) {
    web3.eth.getBalance(walletAddress).then(wei => {
        console.log("Wei: " + wei);
        console.log("Ether: " + web3.utils.fromWei(wei, 'ether'));
    });
}

function getTransaction(hash) {
    web3.eth.getTransaction(hash)
        .then(object => {
            console.log(object);
        });
}

function getCurrentGasPricesXXX() {
    web3.eth.getGasPrice().then(price => {
        console.log(price);
    })
}