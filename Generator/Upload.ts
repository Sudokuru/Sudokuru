const fs = require('fs');
const readline = require('readline');
const endpoint = process.argv[2];
const token = process.argv[3];
const throttle = Number(process.argv[4]);

async function main(): Promise<void> {
    try {
        const rl = readline.createInterface({
            input: fs.createReadStream("puzzles.txt"),
            crlfDelay: Infinity
        });

        let batches:string[] = new Array();
        let inComment:boolean = false;

        // Read batches of puzzles to be uploaded
        rl.on('line', async (line) => {
            if (line[0] === '/' && line[1] === '*') {
                inComment = true;
            }
            else if (!inComment) {
                batches.push(line);
            }
            else if (line[0] === '*' && line[1] === '/') {
                inComment = false;
            }
        });

        // Upload puzzle batches with given delay in between each upload
        rl.on('close', async () => {
            for (let i:number = 0; i < batches.length; i++) {
                let res:Response = await fetch(endpoint, {
                    method: 'POST',
                    body: batches[i],
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    }
                });
                let data = await res.json();
                console.log(data);
                if (i < (batches.length - 1)) {                
                    await new Promise(f => setTimeout(f, throttle));
                }
            }
        });
    } catch(err) {
        console.log(err);
    }
}

main();