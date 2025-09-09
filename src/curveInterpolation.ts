import {
    type InterpolationFormula,
    type LinearInterpolationFormula,
    LinearInterpolationService,
} from "./linearInterpolation"
import {
    type InterpolationType,
    InterpolationTypeEnum,
} from "./interpolationType"

interface Fragment {
    startTime: number
    interpolation: InterpolationFormula
}

export interface CurveInterpolation {
    easeIn?: Fragment
    main: Fragment
    easeOut?: Fragment
}

export const CurveInterpolationService = {
    new: ({
        startPoint,
        endPoint,
        easeIn,
        easeOut,
    }: {
        startPoint: [number, number]
        endPoint: [number, number]
        easeIn?: {
            time: number
            distance: number
        }
        easeOut?: {
            time: number
            distance: number
        }
    }): CurveInterpolation => {
        sanitize({
            startPoint,
            endPoint,
            easeIn,
            easeOut,
        })

        const formulaWithoutEasing = newInterpolationFormula({
            type: InterpolationTypeEnum.LINEAR,
            startPoint,
            endPoint,
        })

        let easeInFragment = calculateEaseInFragment({
            easeIn: easeIn
                ? { ...easeIn, type: InterpolationTypeEnum.LINEAR }
                : undefined,
            startPoint,
            formulaWithoutEasing,
        })

        const mainStartTime = easeInFragment
            ? startPoint[0] + (easeIn?.time ?? 0)
            : startPoint[0]
        const mainStartDistance = easeInFragment
            ? calculateInterpolationFormula(
                  easeInFragment.interpolation,
                  mainStartTime
              )
            : startPoint[1]

        const mainEndTime = easeOut ? endPoint[0] - easeOut.time : endPoint[0]
        const mainEndDistance = easeOut
            ? endPoint[1] - easeOut.distance
            : endPoint[1]

        const main: Fragment = {
            startTime: mainStartTime,
            interpolation: newInterpolationFormula({
                type: InterpolationTypeEnum.LINEAR,
                startPoint: [mainStartTime, mainStartDistance],
                endPoint: [mainEndTime, mainEndDistance],
            }),
        }
        let easeOutFragment = calculateEaseOutFragment({
            easeOut: easeOut
                ? { ...easeOut, type: InterpolationTypeEnum.LINEAR }
                : undefined,
            endPoint,
            main,
        })

        return {
            easeIn: easeInFragment,
            main,
            easeOut: easeOutFragment,
        }
    },
    calculate: (formula: CurveInterpolation, time: number): number => {
        switch (true) {
            case formula?.easeIn != undefined && time < formula.main.startTime:
                return calculateFragment(formula.easeIn, time)
            case formula?.easeOut != undefined &&
                time >= formula.easeOut.startTime:
                return calculateFragment(formula.easeOut, time)
            default:
                return calculateFragment(formula.main, time)
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
            "[CurveInterpolationService.sanitizeStartPointAndEndPoint]: start point is invalid"
        )
    }
    if (!isPointValid(endPoint)) {
        throw new Error(
            "[CurveInterpolationService.sanitizeStartPointAndEndPoint]: end point is invalid"
        )
    }
}
const sanitizeEaseIn = ({
    easeIn,
    timeElapsed,
    distanceTraveled,
}: {
    easeIn?: { time: number; distance: number }
    timeElapsed: number
    distanceTraveled: number
}) => {
    if (easeIn == undefined) return

    switch (true) {
        case easeIn.time < 0:
            throw new Error(
                "[CurveInterpolationService.sanitizeEaseIn]: easeIn.time cannot be negative"
            )
        case easeIn.time > timeElapsed:
            throw new Error(
                "[CurveInterpolationService.sanitizeEaseIn]: easeIn.time must be less than the elapsed time"
            )
        case easeIn.distance < 0:
            throw new Error(
                "[CurveInterpolationService.sanitizeEaseIn]: easeIn.distance cannot be negative"
            )
        case easeIn.distance > distanceTraveled:
            throw new Error(
                "[CurveInterpolationService.sanitizeEaseIn]: easeIn.distance must be less than the distance traveled"
            )
    }
}

const sanitizeEaseOut = ({
    easeOut,
    timeElapsed,
    distanceTraveled,
}: {
    easeOut?: { time: number; distance: number }
    timeElapsed: number
    distanceTraveled: number
}) => {
    if (easeOut == undefined) return

    switch (true) {
        case easeOut.time < 0:
            throw new Error(
                "[CurveInterpolationService.sanitizeEaseOut]: easeOut.time cannot be negative"
            )
        case easeOut.time > timeElapsed:
            throw new Error(
                "[CurveInterpolationService.sanitizeEaseOut]: easeOut.time must be less than the elapsed time"
            )
        case easeOut.distance < 0:
            throw new Error(
                "[CurveInterpolationService.sanitizeEaseOut]: easeOut.distance cannot be negative"
            )
        case easeOut.distance > distanceTraveled:
            throw new Error(
                "[CurveInterpolationService.sanitizeEaseOut]: easeOut.distance must be less than the distance traveled"
            )
    }
}

const sanitizeEaseInAndEaseOut = ({
    easeOut,
    easeIn,
    timeElapsed,
    distanceTraveled,
}: {
    easeOut?: { time: number; distance: number }
    easeIn?: { time: number; distance: number }
    timeElapsed: number
    distanceTraveled: number
}) => {
    if (easeIn == undefined || easeOut == undefined) return

    if (easeIn.time + easeOut.time > timeElapsed) {
        throw new Error(
            "[CurveInterpolationService.sanitizeEaseInAndEaseOut]: easeIn.time + easeOut.time must be less than the elapsed time"
        )
    }

    if (easeIn.distance + easeOut.distance > distanceTraveled) {
        throw new Error(
            "[CurveInterpolationService.sanitizeEaseInAndEaseOut]: easeIn.distance + easeOut.distance must be less than the distance traveled"
        )
    }
}
const sanitize = ({
    startPoint,
    endPoint,
    easeIn,
    easeOut,
}: {
    startPoint: [number, number]
    endPoint: [number, number]
    easeIn?: {
        time: number
        distance: number
    }
    easeOut?: {
        time: number
        distance: number
    }
}) => {
    sanitizeStartPointAndEndPoint(startPoint, endPoint)

    const timeElapsed = endPoint[0] - startPoint[0]
    if (timeElapsed == 0) {
        throw new Error(
            "[CurveInterpolationService.sanitize]: start point and end point must have different time values"
        )
    }
    const distanceTraveled = endPoint[1] - startPoint[1]
    sanitizeEaseIn({
        easeIn: easeIn,
        timeElapsed: timeElapsed,
        distanceTraveled: distanceTraveled,
    })
    sanitizeEaseOut({
        easeOut: easeOut,
        timeElapsed: timeElapsed,
        distanceTraveled: distanceTraveled,
    })
    sanitizeEaseInAndEaseOut({
        easeOut: easeOut,
        easeIn: easeIn,
        timeElapsed: timeElapsed,
        distanceTraveled: distanceTraveled,
    })
}

const calculateFragment = (fragment: Fragment, time: number): number => {
    return calculateInterpolationFormula(fragment.interpolation, time)
}

const calculateInterpolationFormula = (
    interpolation: InterpolationFormula,
    time: number
): number => {
    if (interpolation.type == InterpolationTypeEnum.LINEAR) {
        return LinearInterpolationService.calculate(
            interpolation as LinearInterpolationFormula,
            time
        )
    }
    return 0
}

const calculateEaseInFragment = ({
    easeIn,
    startPoint,
    formulaWithoutEasing,
}: {
    easeIn?: { time: number; distance: number; type: InterpolationType }
    startPoint: [number, number]
    formulaWithoutEasing: InterpolationFormula
}): Fragment | undefined => {
    if (easeIn == undefined) return undefined
    if (easeIn.time <= 0) return undefined
    if (easeIn.distance == 0) return undefined

    const easeInEndTime = startPoint[0] + easeIn.time
    const easeInEndDistance = calculateInterpolationFormula(
        formulaWithoutEasing,
        easeIn.distance
    )
    let easeInFormula = newInterpolationFormula({
        type: easeIn.type,
        startPoint,
        endPoint: [easeInEndTime, easeInEndDistance],
    })
    if (easeInFormula == undefined)
        throw new Error(
            "[CurveInterpolation.calculateEaseInFragment]: easeInFormula is undefined"
        )
    return {
        interpolation: easeInFormula,
        startTime: startPoint[0],
    }
}

const newInterpolationFormula = ({
    type,
    startPoint,
    endPoint,
}: {
    type: InterpolationType
    startPoint: [number, number]
    endPoint: [number, number]
}): InterpolationFormula => {
    if (type == InterpolationTypeEnum.LINEAR) {
        return LinearInterpolationService.new({ startPoint, endPoint })
    }
    throw new Error("[newInterpolationFormula]: unknown Interpolation type")
}

const calculateEaseOutFragment = ({
    easeOut,
    endPoint,
    main,
}: {
    easeOut?: { time: number; distance: number; type: InterpolationType }
    endPoint: [number, number]
    main: Fragment
}) => {
    if (easeOut == undefined) return undefined
    if (easeOut.time <= 0) return undefined
    if (easeOut.distance < 0) return undefined

    const easeOutStartTime = endPoint[0] - easeOut.time
    const easeOutStartDistance = calculateInterpolationFormula(
        main.interpolation,
        easeOutStartTime
    )

    let easeOutFormula = newInterpolationFormula({
        type: InterpolationTypeEnum.LINEAR,
        startPoint: [easeOutStartTime, easeOutStartDistance],
        endPoint,
    })

    return {
        interpolation: easeOutFormula,
        startTime: easeOutStartTime,
    }
}
