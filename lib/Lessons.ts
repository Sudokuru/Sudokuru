/**
 * Functions to handle requesting lessons
 */
export class Lessons{
    public static strategies:string[] = ["AMEND_NOTES", "SIMPLIFY_NOTES"];

    public static getSteps(strategy: string):string[][] {
        if (strategy === "AMEND_NOTES") {
            return [
                ["Here is an example of the amend notes strategy", "https://sudokuru.s3.amazonaws.com/hintExample1-V2.png"],
                ["Here is more insight into that example", "https://sudokuru.s3.amazonaws.com/hintExample1-V2.png"]
            ];
        }
        else if (strategy === "SIMPLIFY_NOTES") {
            return [
                ["Here is an example of the simplify notes strategy", "https://sudokuru.s3.amazonaws.com/hintExample2-V2.png"]
            ];
        }
        else {
            return null;
        }
    }
}