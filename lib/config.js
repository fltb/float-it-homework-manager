const fs = require('fs');
const path = require("path");

const config = {
    getConfig() {
        if (!this.config) {
            const text = fs.readFileSync(path.join(__dirname, "..", "config.json"));
            this.config = JSON.parse(text);
        }
        return this.config;
    }
}

module.exports = config;