import { beforeEach, describe, expect, it } from "vitest"
import {
    type QuadraticInterpolationFormula,
    QuadraticInterpolationService,
} from "./quadraticInterpolation"

describe("Quadratic Interpolation", () => {
    describe("validation and sanitization", () => {
        it("throws an error if any points are invalid", () => {
            expect(() => {
                QuadraticInterpolationService.new({
                    //@ts-ignore Purposely adding invalid arguments to throw an error
                    points: [undefined, [1, 1], [2, 4]],
                })
            }).toThrow("is invalid")
        })

        it("throws an error if any 2 points have the same time", () => {
            expect(() => {
                QuadraticInterpolationService.new({
                    points: [
                        [0, 0],
                        [0, 1],
                        [2, 2],
                    ],
                })
            }).toThrow("different time values")
        })
    })

    describe("Calculate distance over time", () => {
        let formula: QuadraticInterpolationFormula
        let points: [[number, number], [number, number], [number, number]] = [
            [0, 0],
            [1, 1],
            [2, 4],
        ]
        beforeEach(() => {
            formula = QuadraticInterpolationService.new({ points })
        })

        it("will return the start point position at any time before or at the start time", () => {
            expect(
                QuadraticInterpolationService.calculate(formula, points[0][0])
            ).toBeCloseTo(points[0][1])
            expect(
                QuadraticInterpolationService.calculate(
                    formula,
                    points[0][0] - 9001
                )
            ).toBeCloseTo(points[0][1])
        })

        it("will return the end point position at any time at or after the end time", () => {
            expect(
                QuadraticInterpolationService.calculate(formula, points[2][0])
            ).toBeCloseTo(points[2][1])
            expect(
                QuadraticInterpolationService.calculate(
                    formula,
                    points[1][0] + 9001
                )
            ).toBeCloseTo(points[2][1])
        })

        it("will interpolate between start and end point times", () => {
            const timeDifference = points[2][0] - points[0][0]

            const timeElapsed = (ratio: number) =>
                timeDifference * ratio + points[0][0]
            const expectedDistanceTraveled = (ratio: number) =>
                timeElapsed(ratio) * timeElapsed(ratio)

            expect(
                QuadraticInterpolationService.calculate(
                    formula,
                    timeElapsed(0.1)
                )
            ).toBeCloseTo(expectedDistanceTraveled(0.1))
            expect(
                QuadraticInterpolationService.calculate(
                    formula,
                    timeElapsed(0.3)
                )
            ).toBeCloseTo(expectedDistanceTraveled(0.3))
            expect(
                QuadraticInterpolationService.calculate(
                    formula,
                    timeElapsed(0.5)
                )
            ).toBeCloseTo(expectedDistanceTraveled(0.5))
            expect(
                QuadraticInterpolationService.calculate(
                    formula,
                    timeElapsed(0.7)
                )
            ).toBeCloseTo(expectedDistanceTraveled(0.7))
            expect(
                QuadraticInterpolationService.calculate(
                    formula,
                    timeElapsed(0.9)
                )
            ).toBeCloseTo(expectedDistanceTraveled(0.9))
        })
    })
})
