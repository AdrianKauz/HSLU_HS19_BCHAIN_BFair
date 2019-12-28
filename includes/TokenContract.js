class TokenContract {
    #name = '';
    #symbol = '';
    #total = 0.0;
    #decimals = 0;
    #address = '';
    #abi = '';

    setName(newName) {
        this.#name = newName;
    }

    setSymbol(newSymbol) {
        this.#symbol = newSymbol;
    }

    getSymbol() {
        return this.#symbol;
    }

    setTotal(newTotal) {
        this.#total = newTotal;
    }

    setDecimals(newDecimals) {
        this.#decimals = newDecimals;
    }

    getDecimals() {
        return this.#decimals;
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

    setABI(newABI) {
        this.#abi = newABI;
    }

    getABI() {
        return this.#abi;
    }

    #addressIsValid = function(address) {
        const matches = address.match(/^(0x)[0-9a-f]{40}$/);
        return (matches != null);
    }
}

module.exports = {
    TokenContract: TokenContract
};