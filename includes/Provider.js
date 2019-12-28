class Provider {
    #url = '';
    #accessToken = '';

    setURL(newURL) {
        this.#url = newURL;
    }

    setAccessToken(newAccessToken) {
        this.#accessToken = newAccessToken;
    }

    getFullURL() {
        return this.#url + this.#accessToken;
    }

    toConsole() {
        console.log('\x1b[36m', 'Web3 Provider URL: ' ,'\x1b[0m', '', this.getFullURL());
        console.log();
    }
}

module.exports = {
    Provider: Provider
};