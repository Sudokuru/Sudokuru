/**
 * Functions to handle requesting lessons
 */
export class Lessons{
    public static strategies:string[] = ["AMEND_NOTES", "NAKED_SINGLE", "NAKED_SET", "HIDDEN_SINGLE", "HIDDEN_SET"];

    public static getSteps(strategy: string):string[][] {
        if (strategy === "AMEND_NOTES") {
            return [
                ["Here is an example of the amend notes strategy", "https://sudokuru.s3.amazonaws.com/hintExample1-V2.png"],
                ["Here is more insight into that example", "https://sudokuru.s3.amazonaws.com/hintExample1-V2.png"]
            ];
        }
        else if (strategy == "NAKED_SINGLE"){
            return [
                ["Here is an example of the amend notes strategy", "https://sudokuru.s3.amazonaws.com/Lessons/NAKED_SINGLE_STEP_1.png"],
                ["Here is more insight into that example", "https://sudokuru.s3.amazonaws.com/Lessons/NAKED_SINGLE_STEP_2.png"],
                ["Here is more insight into that example", "https://sudokuru.s3.amazonaws.com/Lessons/NAKED_SINGLE_STEP_3.png"]
            ];
        }
        else if (strategy === "SIMPLIFY_NOTES") {
            return [
                ["Here is an example of the simplify notes strategy", "https://sudokuru.s3.amazonaws.com/hintExample2-V2.png"]
            ];
        }
        else if (strategy == "NAKED_SET"){
            return [
                ["Here is an example of the amend notes strategy", "https://sudokuru.s3.amazonaws.com/hintExample1-V2.png"],
                ["Here is more insight into that example", "https://sudokuru.s3.amazonaws.com/hintExample1-V2.png"]
            ];
        }
        else if (strategy == "HIDDEN_SINGLE"){
            return [
                ["Here is an example of the amend notes strategy", "https://sudokuru.s3.amazonaws.com/hintExample1-V2.png"],
                ["Here is more insight into that example", "https://sudokuru.s3.amazonaws.com/hintExample1-V2.png"]
            ];
        }
        else if (strategy == "HIDDEN_SET"){
            return [
                ["Here is an example of the amend notes strategy", "https://sudokuru.s3.amazonaws.com/hintExample1-V2.png"],
                ["Here is more insight into that example", "https://sudokuru.s3.amazonaws.com/hintExample1-V2.png"]
            ];
        }
        else {
            return null;
        }
    }
}