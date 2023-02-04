import {Board} from './Board';
import { StrategyEnum } from './Sudoku';

const events = require('events');
const fs = require('fs');
const readline = require('readline');
const filepath:String = process.argv[2];

/**
 * Given a boolean array corresponding to strategies adds those strategy strings to array and returns it
 * @param strategies - boolean array indicating which strategies to include
 * @returns array of strategy strings
 */
function getStrategyStringArray(strategies: boolean[]):string[] {
    let strategyStrings:string[] = new Array();
    for (let i:number = (StrategyEnum.INVALID + 1); i < StrategyEnum.COUNT; i++) {
        if (strategies[i]) {
            strategyStrings.push(StrategyEnum[i]);
        }
    }
    return strategyStrings;
}

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
            strategies[StrategyEnum.SIMPLIFY_NOTES] = false;
            writer.write("\"strategies\":" + JSON.stringify(getStrategyStringArray(strategies)) + ",");
            writer.write(("\"difficulty\":" + board.getDifficulty()).toString() + ",");
            writer.write("}");
        });

        await events.once(rl, 'close');
        writer.write("]");
    } catch (err) {
        console.log(err);
    }
}

main();