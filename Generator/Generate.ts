import {Board} from './Board';
import { StrategyEnum } from './Sudoku';

const events = require('events');
const fs = require('fs');
const readline = require('readline');
const filepath:String = process.argv[2];

/**
 * Returns the user specified start index if there was one provided, otherwise returns 1
 * @returns puzzle index to start generating (1 indexed, inclusive)
 */
function getStart():number {
    if (process.argv[3] === undefined) {
        return 1;
    }
    return Number(process.argv[3]);
}

/**
 * Returns the user specified end index if there was one provided, otherwise returns one billion
 * @returns index of last puzzle to generate (1 indexed, inclusive)
 */
function getEnd():number {
    if (process.argv[4] === undefined) {
        return 1_000_000_000;
    }
    return Number(process.argv[4]);
}

const start:number = getStart();
const end:number = getEnd();

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

        let index:number = 1;
        rl.on('line', (line) => {
            if (index >= start && index <= end) {
                let board:Board = new Board(line);
                if (index !== start) {
                    writer.write(",");
                }
                writer.write("{");
                writer.write(`\"puzzle\":\"${line}\",`);
                writer.write(`\"puzzleSolution\":\"${board.getSolutionString()}\",`);
                let strategies:boolean[] = board.getStrategies();
                strategies[StrategyEnum.SIMPLIFY_NOTES] = false;
                writer.write("\"strategies\":" + JSON.stringify(getStrategyStringArray(strategies)) + ",");
                writer.write(("\"difficulty\":" + board.getDifficulty()).toString() + ",");
                let drillStrategies:boolean[] = board.getDrills();
                drillStrategies[StrategyEnum.SIMPLIFY_NOTES] = false;
                writer.write("\"drillStrategies\":" + JSON.stringify(getStrategyStringArray(drillStrategies)));
                writer.write("}");
            }
            index++;
        });

        await events.once(rl, 'close');
        writer.write("]");
    } catch (err) {
        console.log(err);
    }
}

main();