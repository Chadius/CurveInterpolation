import { describe, expect, it } from "vitest"
import { CramerRuleService } from "./cramerRule.ts"

describe("Cramer's Rule for solving 3 linear formulas", () => {
    it("will throw an error if any coefficients are undefined", () => {
        expect(() => {
            CramerRuleService.solve(
                //@ts-ignore passing in undefined to test we throw an error
                [3, -2, undefined],
                [4, 7, -1],
                [5, -6, 4],
                [2, 19, 13]
            )
        }).toThrow("must be defined")
    })
    it("can solve if formulas have a unique solution", () => {
        expect(
            CramerRuleService.solve(
                [3, -2, 5],
                [4, -7, -1],
                [5, -6, 4],
                [2, 19, 13]
            )
        ).toEqual([1, -2, -1])
    })
    it("cannot solve if formulas have infinite solutions", () => {
        expect(
            CramerRuleService.solve(
                [1, -1, 1],
                [2, -2, 2],
                [3, -3, 3],
                [2, 19, 13]
            )
        ).toBeUndefined()
    })
    it("cannot solve if formulas have no solution", () => {
        expect(
            CramerRuleService.solve(
                [1, -1, 1],
                [1, -1, 0],
                [1, -1, 2],
                [2, 19, 13]
            )
        ).toBeUndefined()
    })
})
