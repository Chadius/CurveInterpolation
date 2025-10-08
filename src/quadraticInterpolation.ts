import {
    type InterpolationFormulaBase,
    InterpolationTypeEnum,
} from "./interpolationType"
import { CramerRuleService } from "./matrixMath/cramerRule.ts"

export interface QuadraticInterpolationNewArgs
    extends InterpolationFormulaBase {
    type: typeof InterpolationTypeEnum.QUADRATIC
    points: [[number, number], [number, number], [number, number]]
}

export interface QuadraticInterpolationFormula
    extends InterpolationFormulaBase {
    points: [[number, number], [number, number], [number, number]]
    a: number
    b: number
    c: number
}

export const QuadraticInterpolationService = {
    new: ({
        points,
    }: Omit<
        QuadraticInterpolationNewArgs,
        "type"
    >): QuadraticInterpolationFormula => {
        sanitize(points)

        const coefficients0: [number, number, number] = [
            points[0][0] * points[0][0],
            points[0][0],
            1,
        ]
        const coefficients1: [number, number, number] = [
            points[1][0] * points[1][0],
            points[1][0],
            1,
        ]
        const coefficients2: [number, number, number] = [
            points[2][0] * points[2][0],
            points[2][0],
            1,
        ]
        const rightSide: [number, number, number] = [
            points[0][1],
            points[1][1],
            points[2][1],
        ]
        const coefficients = CramerRuleService.solve(
            coefficients0,
            coefficients1,
            coefficients2,
            rightSide
        )
        if (coefficients == undefined) {
            throw new Error(
                "[QuadraticInterpolationService.new] points are unsolvable"
            )
        }

        return {
            type: InterpolationTypeEnum.QUADRATIC,
            points: points.sort((a, b) => a[0] - b[0]),
            a: coefficients[0],
            b: coefficients[1],
            c: coefficients[2],
        }
    },
    calculate: (
        formula: QuadraticInterpolationFormula,
        timeElapsed: number
    ): number => {
        switch (true) {
            case timeElapsed <= formula.points[0][0]:
                return formula.points[0][1]
            case timeElapsed >= formula.points[2][0]:
                return formula.points[2][1]
            default:
                return (
                    formula.a * timeElapsed * timeElapsed +
                    formula.b * timeElapsed +
                    formula.c
                )
        }
    },
    getTimeElapsed: (args: QuadraticInterpolationNewArgs): number => {
        if (args == undefined) {
            throw new Error(
                "[QuadraticInterpolationService.getTimeElapsed]: args must be defined"
            )
        }
        validateAllPoints(args.points)
        const timeValues = args.points
            .map((point) => point[0])
            .toSorted((a, b) => a - b)
        return timeValues[2] - timeValues[0]
    },
    deriveAllPointsFromArgs: (
        args: QuadraticInterpolationNewArgs
    ): {
        startPoint: [number, number]
        endPoint: [number, number]
    } => {
        validateAllPoints(args.points)
        return {
            startPoint: args.points[0],
            endPoint: args.points[2],
        }
    },
}

const isPointValid = (point: [number, number]): boolean => {
    if (point == undefined) {
        return false
    }

    return point.length >= 2
}

const validateAllPoints = (
    points: [[number, number], [number, number], [number, number]]
) => {
    for (const [index, point] of points.entries()) {
        if (!isPointValid(point)) {
            throw new Error(
                `[QuadraticInterpolationService.new]: point ${index} is invalid`
            )
        }
    }
}

const sanitize = (
    points: [[number, number], [number, number], [number, number]]
) => {
    validateAllPoints(points)

    const timeValues = points.map((point) => point[0]).toSorted((a, b) => a - b)
    for (let i = 1; i < timeValues.length; i++) {
        if (timeValues[i] == timeValues[i - 1]) {
            throw new Error(
                "[QuadraticInterpolationService.newFormula]: points must have different time values"
            )
        }
    }
}
