class Wallet {
    #owner = '';
    #address = '';
    #privateKey = '';

    setOwner(newOwner) {
        this.#owner = newOwner;
    }

    setAddress(newAddress) {
        const lowerCase =  newAddress.toLowerCase();

        if(this.#addressIsValid(lowerCase)) {
            this.#address = lowerCase;
        } else {
            console.error('Invalid address "' + lowerCase + '". Pattern doesn\'t match!');
            throw '';
        }
    }

    getAddress() {
        return this.#address;
    }

    setPrivateKey(newPrivateKey) {
        const lowerCase =  newPrivateKey.toLowerCase();

        if(this.#privateKeyIsValid(lowerCase)) {
            this.#privateKey = lowerCase;
        } else {
            console.error('Invalid address "' + lowerCase + '". Pattern doesn\'t match!');
            throw '';
        }
    }

    getPrivateKeyWithoutPrefix() {
        const split = this.#privateKey.split('0x');
        return split[1];
    };

    #addressIsValid = function(address) {
        const matches = address.match(/^(0x)[0-9a-f]{40}$/);
        return (matches != null);
    };

    #privateKeyIsValid = function(privateKey) {
        const matches = privateKey.match(/^(0x)[0-9a-f]{64}$/);
        return (matches != null);
    };

    toString() {
        const lines = [];
        lines.push('Owner: "' + this.#owner + '"');
        lines.push('Address: "' + this.#address + '"');
        lines.push('Private Key: "' + this.#privateKey + '"');

        return lines.join('\n');
    };

    toConsole() {
        console.log('\x1b[36m', 'Owner: ' ,'\x1b[0m', '      ', this.#owner);
        console.log('\x1b[36m', 'Address: ' ,'\x1b[0m', '    ', this.#address);
        console.log('\x1b[36m', 'Private Key: ' ,'\x1b[0m', '', this.#privateKey);
        console.log();
    }
}

module.exports = {
    Wallet: Wallet
};