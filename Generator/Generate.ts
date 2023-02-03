const events = require('events');
const fs = require('fs');
const readline = require('readline');
const filepath:String = process.argv[2];

async function main(): Promise<void> {
    try {
        const rl = readline.createInterface({
            input: fs.createReadStream(filepath),
            crlfDelay: Infinity
        });

        let writer = fs.createWriteStream('puzzles.txt', {'flags': 'a'});
        writer.write("[");

        let first:boolean = true;
        rl.on('line', (line) => {
            let board:String = line;
            if (!first) {
                writer.write(",");
            }
            else {
                first = false;
            }
            writer.write("{");
            writer.write(`\"puzzle\":\"${board}\",`);
            writer.write("}");
        });

        await events.once(rl, 'close');
        writer.write("]");
    } catch (err) {
        console.log(err);
    }
}

main();