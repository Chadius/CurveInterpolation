import { beforeEach, describe, expect, it } from "vitest"
import {
    type LinearInterpolationFormula,
    LinearInterpolationService,
} from "./linearInterpolation"

describe("Linear Interpolation", () => {
    describe("Creating linear formulas", () => {
        it("throws an error if start point is invalid", () => {
            const shouldThrowErrorBecauseInvalid = () => {
                LinearInterpolationService.new({
                    // @ts-ignore, we are testing this is invalid
                    startPoint: undefined,
                    endPoint: [0, 1],
                })
            }

            expect(shouldThrowErrorBecauseInvalid).toThrowError(
                "start point is invalid"
            )

            const shouldThrowErrorBecauseNotEnoughNumbers = () => {
                LinearInterpolationService.new({
                    // @ts-ignore, we are testing this is invalid
                    startPoint: [],
                    endPoint: [0, 1],
                })
            }

            expect(shouldThrowErrorBecauseNotEnoughNumbers).toThrowError(
                "start point is invalid"
            )
        })
        it("throws an error if end point is undefined", () => {
            const shouldThrowErrorBecauseInvalid = () => {
                LinearInterpolationService.new({
                    startPoint: [0, 0],
                    // @ts-ignore, we are testing this is invalid
                    endPoint: undefined,
                })
            }

            expect(shouldThrowErrorBecauseInvalid).toThrowError(
                "end point is invalid"
            )

            const shouldThrowErrorBecauseNotEnoughNumbers = () => {
                LinearInterpolationService.new({
                    startPoint: [0, 0],
                    // @ts-ignore, we are testing this is invalid
                    endPoint: [0],
                })
            }

            expect(shouldThrowErrorBecauseNotEnoughNumbers).toThrowError(
                "end point is invalid"
            )
        })
        it("throws an error if start and end point have the same time", () => {
            const shouldThrowError = () => {
                LinearInterpolationService.new({
                    startPoint: [0, 0],
                    endPoint: [0, 1],
                })
            }

            expect(shouldThrowError).toThrowError(
                "start point and end point must have different time values"
            )
        })
    })

    describe("Calculate distance over time", () => {
        let formula: LinearInterpolationFormula
        let startPoint: [number, number]
        let endPoint: [number, number]
        beforeEach(() => {
            startPoint = [4, 2]
            endPoint = [8, 8]

            formula = LinearInterpolationService.new({
                startPoint,
                endPoint,
            })
        })

        it("will return the start point position at any time before or at the start time", () => {
            expect(
                LinearInterpolationService.calculate(formula, startPoint[0])
            ).toBeCloseTo(startPoint[1])
            expect(
                LinearInterpolationService.calculate(
                    formula,
                    startPoint[0] - 9001
                )
            ).toBeCloseTo(startPoint[1])
        })

        it("will return the end point position at any time at or after the end time", () => {
            expect(
                LinearInterpolationService.calculate(formula, endPoint[0])
            ).toBeCloseTo(endPoint[1])
            expect(
                LinearInterpolationService.calculate(
                    formula,
                    endPoint[0] + 9001
                )
            ).toBeCloseTo(endPoint[1])
        })

        it("will linearly interpolate between start and end point times", () => {
            const timeDifference = endPoint[0] - startPoint[0]
            const distanceTraveled = endPoint[1] - startPoint[1]

            const timeElapsed = (ratio: number) =>
                timeDifference * ratio + startPoint[0]
            const expectedDistanceTraveled = (ratio: number) =>
                distanceTraveled * ratio + startPoint[1]

            expect(
                LinearInterpolationService.calculate(formula, timeElapsed(0.1))
            ).toBeCloseTo(expectedDistanceTraveled(0.1))
            expect(
                LinearInterpolationService.calculate(formula, timeElapsed(0.3))
            ).toBeCloseTo(expectedDistanceTraveled(0.3))
            expect(
                LinearInterpolationService.calculate(formula, timeElapsed(0.5))
            ).toBeCloseTo(expectedDistanceTraveled(0.5))
            expect(
                LinearInterpolationService.calculate(formula, timeElapsed(0.7))
            ).toBeCloseTo(expectedDistanceTraveled(0.7))
            expect(
                LinearInterpolationService.calculate(formula, timeElapsed(0.9))
            ).toBeCloseTo(expectedDistanceTraveled(0.9))
        })
    })

    it("can handle negative distance", () => {
        const formula = LinearInterpolationService.new({
            startPoint: [0, 0],
            endPoint: [10, -10],
        })

        expect(LinearInterpolationService.calculate(formula, 0)).toBeCloseTo(0)

        expect(LinearInterpolationService.calculate(formula, 10)).toBeCloseTo(
            -10
        )
    })
})
