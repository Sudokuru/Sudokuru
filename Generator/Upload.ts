const fs = require('fs');
const readline = require('readline');
const endpoint = process.argv[2];

async function main(): Promise<void> {
    try {
        const rl = readline.createInterface({
            input: fs.createReadStream("puzzles.txt"),
            crlfDelay: Infinity
        });

        rl.on('line', (line) => {
            let jsonPuzzleArray = JSON.parse(line);
        });
    } catch(err) {
        console.log(err);
    }
}

main();