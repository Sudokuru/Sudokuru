const fs = require('fs');
const readline = require('readline');
const endpoint = process.argv[2];

async function main(): Promise<void> {
    try {
        const rl = readline.createInterface({
            input: fs.createReadStream("puzzles.txt"),
            crlfDelay: Infinity
        });

        let inComment:boolean = false;
        rl.on('line', async (line) => {
            if (line[0] === '/' && line[1] === '*') {
                inComment = true;
            }
            else if (!inComment) {
                let res:Response = await fetch(endpoint, {
                    method: 'POST',
                    body: line,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                let data = await res.json();
                console.log(data);
            }
            else if (line[0] === '*' && line[1] === '/') {
                inComment = false;
            }
        });
    } catch(err) {
        console.log(err);
    }
}

main();