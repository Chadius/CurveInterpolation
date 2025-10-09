import { beforeEach, describe, expect, it } from "vitest"
import {
    type CurveInterpolation,
    CurveInterpolationService,
} from "./curveInterpolation"
import { InterpolationTypeEnum } from "./interpolationType.ts"

describe("curveInterpolation", () => {
    describe("Validation during creation", () => {
        it("throws an error if ease in time is invalid", () => {
            const shouldThrowErrorBecauseNegative = () => {
                CurveInterpolationService.new({
                    formulaSettings: {
                        type: InterpolationTypeEnum.LINEAR,
                        startPoint: [0, 0],
                        endPoint: [2, 2],
                    },
                    easeIn: {
                        realTime: -1,
                        formulaTime: 1,
                    },
                })
            }

            expect(shouldThrowErrorBecauseNegative).toThrowError(
                "times must be non-negative"
            )

            const shouldThrowErrorBecauseTooBig = () => {
                CurveInterpolationService.new({
                    formulaSettings: {
                        type: InterpolationTypeEnum.LINEAR,
                        startPoint: [0, 0],
                        endPoint: [2, 2],
                    },
                    easeIn: {
                        realTime: 9001,
                        formulaTime: 9002,
                    },
                })
            }

            expect(shouldThrowErrorBecauseTooBig).toThrowError(
                "times must be less than the total time"
            )
        })
        it("throws an error if ease out time is invalid", () => {
            const shouldThrowErrorBecauseNegative = () => {
                CurveInterpolationService.new({
                    formulaSettings: {
                        type: InterpolationTypeEnum.LINEAR,
                        startPoint: [0, 0],
                        endPoint: [2, 2],
                    },
                    easeOut: {
                        realTime: -1,
                        formulaTime: 1,
                    },
                })
            }

            expect(shouldThrowErrorBecauseNegative).toThrowError(
                "times must be non-negative"
            )

            const shouldThrowErrorBecauseTooBig = () => {
                CurveInterpolationService.new({
                    formulaSettings: {
                        type: InterpolationTypeEnum.LINEAR,
                        startPoint: [0, 0],
                        endPoint: [2, 2],
                    },
                    easeOut: {
                        realTime: 9001,
                        formulaTime: 9002,
                    },
                })
            }

            expect(shouldThrowErrorBecauseTooBig).toThrowError(
                "times must be less than the total time"
            )
        })
        it("throws an error if ease in plus ease out time take longer than the elapsed time", () => {
            const shouldThrowErrorBecauseTooBig = () => {
                CurveInterpolationService.new({
                    formulaSettings: {
                        type: InterpolationTypeEnum.LINEAR,
                        startPoint: [0, 0],
                        endPoint: [2, 2],
                    },
                    easeIn: {
                        realTime: 2,
                        formulaTime: 1,
                    },
                    easeOut: {
                        realTime: 1,
                        formulaTime: 1,
                    },
                })
            }

            expect(shouldThrowErrorBecauseTooBig).toThrowError(
                "easeIn + easeOut times must be less than the total time"
            )
        })
    })

    it("can get the first and last points of the curve", () => {
        const formula = CurveInterpolationService.new({
            formulaSettings: {
                type: InterpolationTypeEnum.LINEAR,
                startPoint: [0, 0],
                endPoint: [8, 8],
            },
            easeIn: {
                realTime: 1,
                formulaTime: 1,
            },
            easeOut: {
                realTime: 1,
                formulaTime: 1,
            },
        })

        expect(CurveInterpolationService.getStartPoint(formula)).toEqual([0, 0])
        expect(CurveInterpolationService.getEndPoint(formula)).toEqual([8, 8])
    })

    describe("easing", () => {
        it("without easing, use only main interpolation", () => {
            const formula = CurveInterpolationService.new({
                formulaSettings: {
                    type: InterpolationTypeEnum.LINEAR,
                    startPoint: [0, 0],
                    endPoint: [8, 8],
                },
            })

            expect(CurveInterpolationService.calculate(formula, 0)).toBeCloseTo(
                0
            )
            expect(CurveInterpolationService.calculate(formula, 4)).toBeCloseTo(
                4
            )
            expect(CurveInterpolationService.calculate(formula, 8)).toBeCloseTo(
                8
            )
        })
        it("will use ease in interpolation until ease in ends", () => {
            const formula = CurveInterpolationService.new({
                formulaSettings: {
                    type: InterpolationTypeEnum.LINEAR,
                    startPoint: [0, 0],
                    endPoint: [8, 8],
                },
                easeIn: {
                    realTime: 4,
                    formulaTime: 2,
                },
            })

            expect(CurveInterpolationService.calculate(formula, 0)).toBeCloseTo(
                0
            )
            expect(CurveInterpolationService.calculate(formula, 2)).toBeCloseTo(
                1
            )
            expect(CurveInterpolationService.calculate(formula, 4)).toBeCloseTo(
                2
            )
            expect(CurveInterpolationService.calculate(formula, 6)).toBeCloseTo(
                5
            )
            expect(CurveInterpolationService.calculate(formula, 8)).toBeCloseTo(
                8
            )
        })

        it("will use ease out interpolation until ease in ends", () => {
            const formula = CurveInterpolationService.new({
                formulaSettings: {
                    type: InterpolationTypeEnum.LINEAR,
                    startPoint: [0, 0],
                    endPoint: [8, 8],
                },
                easeOut: {
                    realTime: 4,
                    formulaTime: 2,
                },
            })

            expect(CurveInterpolationService.calculate(formula, 0)).toBeCloseTo(
                0
            )
            expect(CurveInterpolationService.calculate(formula, 2)).toBeCloseTo(
                3
            )
            expect(CurveInterpolationService.calculate(formula, 4)).toBeCloseTo(
                6
            )
            expect(CurveInterpolationService.calculate(formula, 6)).toBeCloseTo(
                7
            )
            expect(CurveInterpolationService.calculate(formula, 8)).toBeCloseTo(
                8
            )
        })
    })

    describe("Can use a constant value formula", () => {
        let formula: CurveInterpolation

        beforeEach(() => {
            formula = CurveInterpolationService.new({
                formulaSettings: {
                    type: InterpolationTypeEnum.CONSTANT,
                    value: 10,
                },
            })
        })

        it("has start and end points", () => {
            expect(CurveInterpolationService.getStartPoint(formula)[1]).toEqual(
                10
            )
            expect(CurveInterpolationService.getEndPoint(formula)[1]).toEqual(
                10
            )
        })

        it("will always show the constant value", () => {
            expect(CurveInterpolationService.calculate(formula, 0)).toEqual(10)
            expect(CurveInterpolationService.calculate(formula, -100)).toEqual(
                10
            )
            expect(CurveInterpolationService.calculate(formula, 10000)).toEqual(
                10
            )
        })
    })
})
