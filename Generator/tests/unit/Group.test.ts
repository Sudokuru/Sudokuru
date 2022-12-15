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
});