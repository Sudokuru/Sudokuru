const events = require('events');
const fs = require('fs');
const readline = require('readline');

let filepath:String = process.argv[2];

try {
    const rl = readline.createInterface({
        input: fs.createReadStream(filepath),
        crlfDelay: Infinity
    });

    rl.on('line', (line) => {
        let board:String = line;
    });
} catch (err) {
    console.log(err);
}