import { describe, expect, test } from "vitest";
import { extractAggrFnComponents } from "../src/queryBuilder/base";

describe("Tests on the extractAggrFnComponents utility function", () => {
    test("Should return null value for a string that is not a valid aggregate funtion", () => {
            expect(extractAggrFnComponents("abcd")).toBe(null);
    })
})