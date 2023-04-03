/**
 * Functions to handle requesting lessons
 */
export class Lessons{
    /**
     * Returns a list of all the strategies that have lessons
     * @returns string array of strategy names that getSteps can be called with
     */
    public static async getStrategies():Promise<string[]> {
        const response:Response = await fetch("https://sudokuru.s3.amazonaws.com/Lessons/strategies.json", { cache: "no-cache" });
        const json = await response.json();
        return json;
    }

    /**
     * Given a strategy string (from getStrategies()) returns a 2d string array of steps for the strategy
     * @param strategy - name of the strategy
     * @returns 2d string array of steps with first value in each array being text and second being link to s3 image
     */
    public static async getSteps(strategy: string):Promise<string[][]> {
        const response:Response = await fetch("https://sudokuru.s3.amazonaws.com/Lessons/" + strategy + ".json", { cache: "no-cache" });
        const json = await response.json();
        return json;
    }

    /**
     * Returns a tutorial to teach new users the basics of Sudoku via the first few lessons
     * @returns 2d string array of steps from the first few lessons with first value in each array being text and second being link to s3 image
     */
    public static async getTutorial():Promise<string[][]> {
        const sudoku_101:Response = await fetch("https://sudokuru.s3.amazonaws.com/Lessons/SUDOKU_101.json", { cache: "no-cache" });
        const lesson1  = await sudoku_101.json();
        const amend_notes:Response = await fetch("https://sudokuru.s3.amazonaws.com/Lessons/AMEND_NOTES.json", { cache: "no-cache" });
        const lesson2  = await amend_notes.json();
        const naked_single = await fetch("https://sudokuru.s3.amazonaws.com/Lessons/NAKED_SINGLE.json", { cache: "no-cache" });
        const lesson3  = await naked_single.json();
        const simplify_notes = await fetch("https://sudokuru.s3.amazonaws.com/Lessons/SIMPLIFY_NOTES.json", { cache: "no-cache" });
        const lesson4  = await simplify_notes.json();
        const tutorial = lesson1.concat(lesson2, lesson3, lesson4);
        return tutorial;
    }
}