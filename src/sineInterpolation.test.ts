import { beforeEach, describe, expect, it } from "vitest"
import {
    type SineInterpolationFormula,
    SineInterpolationService,
} from "./sineInterpolation.ts"

describe("Sine Interpolation", () => {
    describe("validation and sanitization", () => {
        describe(`throws an error if parameters are undefined`, () => {
            const tests = [
                {
                    name: "valueRange start",
                    args: {
                        valueRange: [undefined, 10],
                        amplitude: 10,
                        frequency: 10,
                    },
                },
                {
                    name: "valueRange end",
                    args: {
                        valueRange: [10, undefined],
                        amplitude: 10,
                        frequency: 10,
                    },
                },
                {
                    name: "valueRange is empty",
                    args: {
                        valueRange: [],
                        amplitude: 10,
                        frequency: 10,
                    },
                },
                {
                    name: "valueRange is undefined",
                    args: {
                        valueRange: undefined,
                        amplitude: 10,
                        frequency: 10,
                    },
                },
                {
                    name: "amplitude",
                    args: {
                        valueRange: [0, 10],
                        amplitude: undefined,
                        frequency: 10,
                    },
                },
                {
                    name: "frequency",
                    args: {
                        valueRange: [0, 10],
                        amplitude: 10,
                        frequency: undefined,
                    },
                },
            ]

            it.each(tests)(`$name`, ({ args }) => {
                expect(() => {
                    //@ts-ignore Purposely adding invalid arguments to throw an error
                    SineInterpolationService.new(args)
                }).toThrow("must be defined")
            })
        })
        it("throws an error if start and end point have the same time", () => {
            expect(() => {
                SineInterpolationService.new({
                    timeRange: [10, 10],
                    amplitude: 10,
                    frequency: 10,
                })
            }).toThrow("must have different time")
        })
        it("throws an error if frequency is nonpositive", () => {
            expect(() => {
                SineInterpolationService.new({
                    timeRange: [0, 10],
                    amplitude: 10,
                    frequency: -10,
                })
            }).toThrow("must be positive")
            expect(() => {
                SineInterpolationService.new({
                    timeRange: [0, 10],
                    amplitude: 10,
                    frequency: 0,
                })
            }).toThrow("must be positive")
        })
        it("assumes phaseShift is 0 if it is not provided", () => {
            const formula = SineInterpolationService.new({
                timeRange: [0, 10],
                amplitude: 10,
                frequency: 1,
            })

            expect(formula.phaseShift).toEqual(0)
        })
        it("assumes verticalShift is 0 if it is not provided", () => {
            const formula = SineInterpolationService.new({
                timeRange: [0, 10],
                amplitude: 10,
                frequency: 1,
            })

            expect(formula.verticalShift).toEqual(0)
        })
    })

    describe("calculate distance over time", () => {
        let formula: SineInterpolationFormula
        let amplitude: number = 5
        let frequency: number = 2
        let timeRange: [number, number] = [2, 12]
        let phaseShift: number = 1
        let verticalShift: number = 3
        beforeEach(() => {
            formula = SineInterpolationService.new({
                amplitude,
                frequency,
                timeRange,
                phaseShift,
                verticalShift,
            })
        })

        it("at or before the start time it will give the starting position", () => {
            const expectedStartValue =
                amplitude * Math.sin(((Math.PI * 2) / frequency) * phaseShift) +
                verticalShift
            expect(
                SineInterpolationService.calculate(formula, timeRange[0])
            ).toBeCloseTo(expectedStartValue)
            expect(
                SineInterpolationService.calculate(formula, timeRange[0] - 9001)
            ).toBeCloseTo(expectedStartValue)
        })

        it("at or after the end time it will give the ending position", () => {
            const expectedEndValue =
                amplitude *
                    Math.sin(
                        ((Math.PI * 2) / frequency) *
                            (timeRange[1] - timeRange[0] + phaseShift)
                    ) +
                verticalShift
            expect(
                SineInterpolationService.calculate(formula, timeRange[1])
            ).toBeCloseTo(expectedEndValue)
            expect(
                SineInterpolationService.calculate(formula, timeRange[1] + 9001)
            ).toBeCloseTo(expectedEndValue)
        })

        it("will use a sinusoidal formula to get the expected position", () => {
            expect(
                SineInterpolationService.calculate(
                    formula,
                    timeRange[0] + 1 / frequency
                )
            ).toBeCloseTo(
                amplitude *
                    Math.sin(
                        ((Math.PI * 2) / frequency) *
                            (timeRange[0] + 1 / frequency + phaseShift)
                    ) +
                    verticalShift
            )
            expect(
                SineInterpolationService.calculate(formula, timeRange[0] + 5)
            ).toBeCloseTo(
                amplitude *
                    Math.sin(
                        ((Math.PI * 2) / frequency) *
                            (timeRange[0] + 5 + phaseShift)
                    ) +
                    verticalShift
            )
        })
    })
})
