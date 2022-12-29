import { Group } from "../../Group";
import { CustomError, CustomErrorEnum } from "../../CustomError";
import { getError } from "../testResources";

describe("create Group object", () => {
    it('should insert some candidates', () => {
        let obj:Group = new Group(false);

        expect(obj.contains("1")).toBeFalsy;
        expect(obj.contains(0)).toBeFalsy;

        expect(obj.insert("1")).toBeTruthy;
        expect(obj.insert(0)).toBeFalsy;

        expect(obj.contains("1")).toBeTruthy;
        expect(obj.contains(0)).toBeTruthy;

        expect(obj.contains("3")).toBeFalsy;
        expect(obj.insert(2)).toBeTruthy;
        expect(obj.contains("3")).toBeTruthy;
    });
    it('should remove a candidates', () => {
        let obj:Group = new Group(true);

        expect(obj.contains("1")).toBeTruthy;
        expect(obj.remove("1")).toBeTruthy;
        expect(obj.contains("1")).toBeFalsy;
        expect(obj.remove("1")).toBeFalsy;

        expect(obj.remove(3)).toBeTruthy;
        expect(obj.contains(3)).toBeFalsy;
    });
    it('should be equal then unequal', () => {
        let a:Group = new Group(false);
        a.insert(3);
        a.insert(6);

        let b:Group = new Group(false);
        b.insert(3);
        b.insert(6);
        
        expect(a.equals(b)).toBeTruthy;

        a.insert(7);

        expect(b.equals(a)).toBeFalsy;
    });
});