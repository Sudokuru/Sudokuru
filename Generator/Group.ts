import { SudokuEnum, getCandidateIndex } from "./Sudoku";
/**
 * Constructed using initial value to fill Group with
 * Can check if Group contains a value
 * Can insert values
 */
export class Group{
    // Values are true if candidate is in Group, false otherwise
    private candidates: boolean[];
    // Number of candidates that are currently in Group
    private size: number;

    /**
     * Creates Group object given value to initial candidates to
     * @param initialValue - candidate initial value
     */
    constructor(initialValue: boolean) {
        this.candidates = new Array(SudokuEnum.ROW_LENGTH).fill(initialValue);
        if (initialValue === true) {
            this.size = SudokuEnum.ROW_LENGTH;
        }
        else {
            this.size = 0;
        }
    }

    /**
     * Checks if Group contains candidate
     * @param candidateIndex - zero based index of candidate
     * @returns true if candidate at given index is in this Group
     */
    public contains(candidateIndex: number):boolean;

    /**
     * Checks if Group contains candidate
     * @param candidate - candidate
     * @returns true if candidate is in this Group
     */
    public contains(candidate: string):boolean;

    
    public contains(candidate: unknown):boolean {
        let candidateIndex:number = getCandidateIndex(candidate);

        if (this.candidates[candidateIndex] === true) {
            return true;
        }
        return false;
    }

    /**
     * Adds candidate to Group
     * @param candidate - candidate
     * @returns true if candidate was inserted, false if candidate was already in Group
     */
    public insert(candidate: string):boolean;

    /**
     * Adds candidate to Group
     * @param candidateIndex - zero based index of candidate
     * @returns true if candidate was inserted, false if candidate was already in Group
     */
    public insert(candidateIndex: number):boolean;
    
    public insert(candidate: unknown):boolean {
        let candidateIndex:number = getCandidateIndex(candidate);

        if (this.candidates[candidateIndex] === true) {
            return false;
        }
        this.candidates[candidateIndex] = true;
        this.size++;
        return true;
    }

    /**
     * Remove candidate from Group
     * @param candidate - candidate
     * @returns true if candidate was removed, false if candidate wasn't in Group to begin with
     */
    public remove(candidate: string):boolean;

    /**
     * Remove candidate from Group
     * @param candidateIndex - zero based index of candidate
     * @returns true if candidate was removed, false if candidate wasn't in Group to begin with
     */
    public remove(candidateIndex: number):boolean;
    
    public remove(candidate: unknown):boolean {
        let candidateIndex:number = getCandidateIndex(candidate);

        if (this.candidates[candidateIndex] === false) {
            return false;
        }
        this.candidates[candidateIndex] = false;
        this.size--;
        return true;
    }

    /**
     * Returns true if this Groups candidates are the same as those in the given Group
     * @param obj - Group being compared against
     * @returns true if this Group has same note values as obj
     */
    public equals(obj: Group):boolean {
        if (this.candidates.length !== obj.candidates.length) {
            return false;
        }
        for (let i:number = 0; i < this.candidates.length; i++) {
            if (this.contains(i) !== obj.contains(i)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Returns the number of candidates in this Group
     * @returns size
     */
    public getSize():number {
        return this.size;
    }
}