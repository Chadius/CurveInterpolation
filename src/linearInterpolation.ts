import {
    type InterpolationFormulaBase,
    InterpolationTypeEnum,
} from "./interpolationType"

export interface LinearInterpolationNewArgs extends InterpolationFormulaBase {
    type: typeof InterpolationTypeEnum.LINEAR
    startPoint: [number, number]
    endPoint: [number, number]
}

export interface LinearInterpolationFormula extends InterpolationFormulaBase {
    slope: number
    offset: number
    startPoint: [number, number]
    endPoint: [number, number]
}

export const LinearInterpolationService = {
    new: ({
        startPoint,
        endPoint,
    }: Omit<
        LinearInterpolationNewArgs,
        "type"
    >): LinearInterpolationFormula => {
        sanitize({
            startPoint,
            endPoint,
        })

        const timeDifference = endPoint[0] - startPoint[0]
        const distanceTraveled = endPoint[1] - startPoint[1]
        const slope = distanceTraveled / timeDifference
        const offset = startPoint[1] - slope * startPoint[0]

        return {
            type: InterpolationTypeEnum.LINEAR,
            startPoint,
            endPoint,
            slope,
            offset,
        }
    },
    calculate: (
        formula: LinearInterpolationFormula,
        timeElapsed: number
    ): number => {
        switch (true) {
            case timeElapsed <= formula.startPoint[0]:
                return formula.startPoint[1]
            case timeElapsed >= formula.endPoint[0]:
                return formula.endPoint[1]
            default:
                return formula.slope * timeElapsed + formula.offset
        }
    },
    getTimeElapsed: (args: LinearInterpolationNewArgs): number => {
        if (args == undefined) {
            throw new Error(
                "[LinearInterpolationService.getTimeElapsed]: args must be defined"
            )
        }

        return args.endPoint[0] - args.startPoint[0]
    },
    deriveStartPointAndEndPointFromArgs: (
        args: LinearInterpolationNewArgs
    ): {
        startPoint: [number, number]
        endPoint: [number, number]
    } => {
        return {
            startPoint: args.startPoint,
            endPoint: args.endPoint,
        }
    },
}

const isPointValid = (point: [number, number]): boolean => {
    if (point == undefined) {
        return false
    }

    return point.length >= 2
}

const sanitizeStartPointAndEndPoint = (
    startPoint: [number, number],
    endPoint: [number, number]
) => {
    if (!isPointValid(startPoint)) {
        throw new Error(
            "[LinearInterpolationService.newFormula]: start point is invalid"
        )
    }
    if (!isPointValid(endPoint)) {
        throw new Error(
            "[LinearInterpolationService.newFormula]: end point is invalid"
        )
    }
}

const sanitize = ({
    startPoint,
    endPoint,
}: {
    startPoint: [number, number]
    endPoint: [number, number]
}) => {
    sanitizeStartPointAndEndPoint(startPoint, endPoint)

    const timeElapsed = endPoint[0] - startPoint[0]
    if (timeElapsed == 0) {
        throw new Error(
            "[LinearInterpolationService.newFormula]: start point and end point must have different time values"
        )
    }
}
