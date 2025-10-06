import { beforeEach, describe, expect, it } from "vitest"
import {
    type ConstantInterpolationFormula,
    ConstantInterpolationService,
} from "./constantInterpolation.ts"

describe("Constant Interpolation", () => {
    describe("Creating constant formulas", () => {
        it("throws an error if value is invalid", () => {
            const shouldThrowErrorBecauseInvalid = () => {
                ConstantInterpolationService.new({
                    // @ts-ignore, we are testing this is invalid
                    value: undefined,
                })
            }

            expect(shouldThrowErrorBecauseInvalid).toThrowError(
                "value must be defined"
            )
        })
    })

    describe("Calculate distance over time", () => {
        let formula: ConstantInterpolationFormula
        let formulaValue: number

        beforeEach(() => {
            formulaValue = 10

            formula = ConstantInterpolationService.new({
                value: formulaValue,
            })
        })

        it("will always return the value", () => {
            expect(ConstantInterpolationService.calculate(formula)).toBeCloseTo(
                formulaValue
            )
        })
    })
})
