/**
 * Functions to handle requesting lessons
 */
export class Lessons{
    /**
     * Returns a list of all the strategies that have lessons
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
}