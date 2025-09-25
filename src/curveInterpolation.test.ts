import { describe, expect, it } from "vitest"
import { CurveInterpolationService } from "./curveInterpolation"

describe("curveInterpolation", () => {
    describe("Validation during creation", () => {
        it("throws an error if start point is invalid", () => {
            const shouldThrowErrorBecauseInvalid = () => {
                CurveInterpolationService.new({
                    // @ts-ignore, we are testing this is invalid
                    startPoint: undefined,
                    endPoint: [0, 1],
                })
            }

            expect(shouldThrowErrorBecauseInvalid).toThrowError(
                "start point is invalid"
            )

            const shouldThrowErrorBecauseNotEnoughNumbers = () => {
                CurveInterpolationService.new({
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
                CurveInterpolationService.new({
                    startPoint: [0, 0],
                    // @ts-ignore, we are testing this is invalid
                    endPoint: undefined,
                })
            }

            expect(shouldThrowErrorBecauseInvalid).toThrowError(
                "end point is invalid"
            )

            const shouldThrowErrorBecauseNotEnoughNumbers = () => {
                CurveInterpolationService.new({
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
                CurveInterpolationService.new({
                    startPoint: [0, 0],
                    endPoint: [0, 1],
                })
            }

            expect(shouldThrowError).toThrowError(
                "start point and end point must have different time values"
            )
        })

        it("throws an error if ease in time is invalid", () => {
            const shouldThrowErrorBecauseNegative = () => {
                CurveInterpolationService.new({
                    startPoint: [0, 0],
                    endPoint: [2, 2],
                    easeIn: {
                        time: -1,
                        distance: 1,
                    },
                })
            }

            expect(shouldThrowErrorBecauseNegative).toThrowError(
                "easeIn.time cannot be negative"
            )

            const shouldThrowErrorBecauseTooBig = () => {
                CurveInterpolationService.new({
                    startPoint: [0, 0],
                    endPoint: [2, 2],
                    easeIn: {
                        time: 9001,
                        distance: 1,
                    },
                })
            }

            expect(shouldThrowErrorBecauseTooBig).toThrowError(
                "easeIn.time must be less than the elapsed time"
            )
        })
        it("throws an error if ease out time is invalid", () => {
            const shouldThrowErrorBecauseNegative = () => {
                CurveInterpolationService.new({
                    startPoint: [0, 0],
                    endPoint: [2, 2],
                    easeOut: { time: -1, distance: 1 },
                })
            }

            expect(shouldThrowErrorBecauseNegative).toThrowError(
                "easeOut.time cannot be negative"
            )

            const shouldThrowErrorBecauseTooBig = () => {
                CurveInterpolationService.new({
                    startPoint: [0, 0],
                    endPoint: [2, 2],
                    easeOut: { time: 9001, distance: 1 },
                })
            }

            expect(shouldThrowErrorBecauseTooBig).toThrowError(
                "easeOut.time must be less than the elapsed time"
            )
        })
        it("throws an error if ease in plus ease out time take longer than the elapsed time", () => {
            const shouldThrowErrorBecauseTooBig = () => {
                CurveInterpolationService.new({
                    startPoint: [0, 0],
                    endPoint: [2, 2],
                    easeIn: {
                        time: 2,
                        distance: 1,
                    },
                    easeOut: { time: 2, distance: 1 },
                })
            }

            expect(shouldThrowErrorBecauseTooBig).toThrowError(
                "easeIn.time + easeOut.time must be less than the elapsed time"
            )
        })
    })

    it("without easing, use only main interpolation", () => {
        const formula = CurveInterpolationService.new({
            startPoint: [0, 0],
            endPoint: [8, 8],
        })

        expect(CurveInterpolationService.calculate(formula, 0)).toBeCloseTo(0)
        expect(CurveInterpolationService.calculate(formula, 4)).toBeCloseTo(4)
        expect(CurveInterpolationService.calculate(formula, 8)).toBeCloseTo(8)
    })

    it("will use ease in interpolation until ease in ends", () => {
        const formula = CurveInterpolationService.new({
            startPoint: [0, 0],
            endPoint: [8, 8],
            easeIn: {
                time: 4,
                distance: 2,
            },
        })

        expect(CurveInterpolationService.calculate(formula, 0)).toBeCloseTo(0)
        expect(CurveInterpolationService.calculate(formula, 2)).toBeCloseTo(1)
        expect(CurveInterpolationService.calculate(formula, 4)).toBeCloseTo(2)
        expect(CurveInterpolationService.calculate(formula, 6)).toBeCloseTo(5)
        expect(CurveInterpolationService.calculate(formula, 8)).toBeCloseTo(8)
    })

    it("will use ease out interpolation until ease in ends", () => {
        const formula = CurveInterpolationService.new({
            startPoint: [0, 0],
            endPoint: [8, 8],
            easeOut: {
                time: 4,
                distance: 2,
            },
        })

        expect(CurveInterpolationService.calculate(formula, 0)).toBeCloseTo(0)
        expect(CurveInterpolationService.calculate(formula, 2)).toBeCloseTo(3)
        expect(CurveInterpolationService.calculate(formula, 4)).toBeCloseTo(6)
        expect(CurveInterpolationService.calculate(formula, 6)).toBeCloseTo(7)
        expect(CurveInterpolationService.calculate(formula, 8)).toBeCloseTo(8)
    })
})
