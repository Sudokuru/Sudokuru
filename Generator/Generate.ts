import {Board} from './Board';
import { StrategyEnum } from './Sudoku';

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
            let board:Board = new Board(line);
            if (!first) {
                writer.write(",");
            }
            else {
                first = false;
            }
            writer.write("{");
            writer.write(`\"puzzle\":\"${line}\",`);
            writer.write(`\"puzzleSolution\":\"${board.getSolutionString()}\",`);
            let strategies:boolean[] = board.getStrategies();
            let puzzleStrategies:string[] = new Array();
            for (let i:number = (StrategyEnum.INVALID + 1); i < StrategyEnum.COUNT; i++) {
                if (strategies[i] && i !== StrategyEnum.SIMPLIFY_NOTES) {
                    puzzleStrategies.push(StrategyEnum[i]);
                }
            }
            writer.write(JSON.stringify(puzzleStrategies) + ",");
            writer.write("}");
        });

        await events.once(rl, 'close');
        writer.write("]");
    } catch (err) {
        console.log(err);
    }
}

main();