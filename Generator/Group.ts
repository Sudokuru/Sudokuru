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
    // Optional row and column values corresponding to a Cell in a board
    private row: number;
    private column: number;

    /**
     * Creates Group object given value to initial candidates to
     * @param initialValue - candidate initial value
     */
    constructor(initialValue: boolean);

    /**
     * Creates Group object given value to initial candidates to
     * @param initialValue - candidate initial value
     * @param row - row to corresponding cell
     * @param column - column to corresponding cell
     */
    constructor(initialValue: boolean, row: number, column: number);

    constructor(initialValue: boolean, row?: number, column?: number) {
        this.candidates = new Array(SudokuEnum.ROW_LENGTH).fill(initialValue);
        if (initialValue === true) {
            this.size = SudokuEnum.ROW_LENGTH;
        }
        else {
            this.size = 0;
        }
        if (row !== undefined && column !== undefined) {
            this.row = row;
            this.column = column;
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

    /**
     * Given a Group of candidates inserts them into this Group
     * @param candidates - Group containing candidates to insert into this Group
     * @returns true if at least one of the candidates was inserted, false if all of them were already in Group
     */
    public insert(candidates: Group):boolean;
    
    public insert(candidate: unknown):boolean {
        if (candidate instanceof Group) {
            let inserted:boolean = false;
            for (let note:number = 0; note < SudokuEnum.ROW_LENGTH; note++) {
                if (candidate.contains(note)) {
                    this.insert(note);
                    inserted = true;
                }
            }
            return inserted;
        }

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

    /**
     * Given a Group of candidates removes them from this Group
     * @param candidates - Group containing candidates to remove from this Group
     * @returns true if at least one of the candidates was removed, false if none of them were in Group to begin with
     */
    public remove(candidates: Group):boolean;
    
    public remove(candidate: unknown):boolean {
        if (candidate instanceof Group) {
            let removed:boolean = false;
            for (let note:number = 0; note < SudokuEnum.ROW_LENGTH; note++) {
                if (candidate.contains(note)) {
                    this.remove(note);
                    removed = true;
                }
            }
            return removed;
        }

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
     * Given a Group obj returns a Group containing every candidate in both this Group and obj
     * @param obj - Group being intersected with
     * @returns Group containing the intersection of this Group and obj
     */
    public intersection(obj: Group):Group {
        let intersection:Group = new Group(false);
        for (let i:number = 0; i < SudokuEnum.ROW_LENGTH; i++) {
            if (this.contains(i) && obj.contains(i)) {
                intersection.insert(i);
            }
        }
        return intersection;
    }

    /**
     * Returns the number of candidates in this Group
     * @returns size
     */
    public getSize():number {
        return this.size;
    }

    /**
     * Get row
     * @returns row
     */
    public getRow():number {
        return this.row;
    }

    /**
     * Get column
     * @returns column
     */
    public getColumn():number {
        return this.column;
    }
}