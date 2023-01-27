import { Group } from "../../Group";
import { CustomError, CustomErrorEnum } from "../../CustomError";
import { getError } from "../testResources";
import { SudokuEnum } from "../../Sudoku";

describe("create Group object", () => {
    it('should insert some candidates', () => {
        let obj:Group = new Group(false);
        expect(obj.getSize()).toBe(0);

        expect(obj.contains("1")).toBeFalsy();
        expect(obj.contains(0)).toBeFalsy();

        expect(obj.insert("1")).toBeTruthy();
        expect(obj.getSize()).toBe(1);
        expect(obj.insert(0)).toBeFalsy();
        expect(obj.getSize()).toBe(1);

        expect(obj.contains("1")).toBeTruthy();
        expect(obj.contains(0)).toBeTruthy();

        expect(obj.contains("3")).toBeFalsy();
        expect(obj.insert(2)).toBeTruthy();
        expect(obj.contains("3")).toBeTruthy();

        let i:Group = new Group(true);
        expect(obj.insert(i)).toBeTruthy();
        expect(obj.getSize()).toBe(9);
    });
    it('should remove some candidates', () => {
        let obj:Group = new Group(true);
        expect(obj.getSize()).toBe(9);

        expect(obj.contains("1")).toBeTruthy();
        expect(obj.remove("1")).toBeTruthy();
        expect(obj.getSize()).toBe(8);
        expect(obj.contains("1")).toBeFalsy();
        expect(obj.remove("1")).toBeFalsy();
        expect(obj.getSize()).toBe(8);

        expect(obj.remove(3)).toBeTruthy();
        expect(obj.contains(3)).toBeFalsy();

        let r:Group = new Group(false);
        expect(obj.remove(r)).toBeFalsy();
        r.insert("1");
        r.insert(6);
        r.insert(7);
        expect(obj.remove(r)).toBeTruthy();
        expect(obj.getSize()).toBe(5);
    });
    it('should be equal then unequal', () => {
        let a:Group = new Group(false);
        a.insert(3);
        a.insert(6);

        let b:Group = new Group(false);
        b.insert(3);
        b.insert(6);

        let c:Group = new Group(false);
        c.insert(4);

        let d:Group = new Group(false);
        d.insert(a);
        d.insert(4);
        
        expect(a.equals(b)).toBeTruthy();
        expect(a.equals(a.clone())).toBeTruthy();
        expect(d.equals(Group.union([a, c]))).toBeTruthy();

        a.insert(7);

        expect(b.equals(a)).toBeFalsy();
    });
    it('should return subsets', () => {
        expect((Group.getSubset(1)).length).toBe(SudokuEnum.ROW_LENGTH);
        expect((Group.getSubset(2)).length).toBe(36);
        expect((Group.getSubset(3)).length).toBe(84);
        expect((Group.getSubset(4)).length).toBe(126);
        expect((Group.getSubset(9)).length).toBe(1);
    });
});