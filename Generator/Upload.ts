const fs = require('fs');
const readline = require('readline');
const endpoint = process.argv[2];

async function main(): Promise<void> {
    try {
        const rl = readline.createInterface({
            input: fs.createReadStream("puzzles.txt"),
            crlfDelay: Infinity
        });

        rl.on('line', async (line) => {
            let jsonPuzzleArray = JSON.parse(line);
            let res:Response = await fetch(endpoint, {
                method: 'POST',
                body: jsonPuzzleArray,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            let data = await res.json();
            console.log(data);
        });
    } catch(err) {
        console.log(err);
    }
}

main();