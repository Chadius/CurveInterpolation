import {
    type LinearInterpolationFormula,
    type LinearInterpolationNewArgs,
    LinearInterpolationService,
} from "./linearInterpolation"
import { InterpolationTypeEnum } from "./interpolationType"
import {
    type ConstantInterpolationFormula,
    type ConstantInterpolationNewArgs,
    ConstantInterpolationService,
} from "./constantInterpolation.ts"
import {
    type SineInterpolationFormula,
    type SineInterpolationNewArgs,
    SineInterpolationService,
} from "./sineInterpolation.ts"
import {
    type QuadraticInterpolationFormula,
    type QuadraticInterpolationNewArgs,
    QuadraticInterpolationService,
} from "./quadraticInterpolation.ts"

interface Fragment {
    startTime: number
    interpolation: InterpolationFormula
}

export interface CurveInterpolation {
    easeIn?: Fragment
    main: Fragment
    easeOut?: Fragment
    timeRange: [number, number]
}

type InterpolationFormula =
    | ConstantInterpolationFormula
    | LinearInterpolationFormula
    | QuadraticInterpolationFormula
    | SineInterpolationFormula

export type CurveInterpolationNewArgs =
    | ConstantInterpolationNewArgs
    | LinearInterpolationNewArgs
    | QuadraticInterpolationNewArgs
    | SineInterpolationNewArgs

export type PartialCurveInterpolationNewArgs =
    | (Partial<ConstantInterpolationNewArgs> &
          Pick<ConstantInterpolationNewArgs, "type">)
    | (Partial<LinearInterpolationNewArgs> &
          Pick<LinearInterpolationNewArgs, "type">)
    | (Partial<QuadraticInterpolationNewArgs> &
          Pick<QuadraticInterpolationNewArgs, "type" | "points">)
    | (Partial<SineInterpolationNewArgs> &
          Pick<SineInterpolationNewArgs, "type" | "frequency" | "amplitude">)

export const CurveInterpolationService = {
    new: ({
        formulaSettings,
        easeIn,
        easeOut,
    }: {
        formulaSettings: CurveInterpolationNewArgs
        easeIn?: {
            formulaSettings: PartialCurveInterpolationNewArgs
            time: number
            distance: number
        }
        easeOut?: {
            formulaSettings: PartialCurveInterpolationNewArgs
            time: number
            distance: number
        }
    }): CurveInterpolation => {
        let timeElapsed: number | undefined = undefined
        switch (formulaSettings.type) {
            case InterpolationTypeEnum.LINEAR:
                timeElapsed =
                    LinearInterpolationService.getTimeElapsed(formulaSettings)
                break
            case InterpolationTypeEnum.QUADRATIC:
                timeElapsed =
                    QuadraticInterpolationService.getTimeElapsed(
                        formulaSettings
                    )
                break
            case InterpolationTypeEnum.SINE:
                timeElapsed =
                    SineInterpolationService.getTimeElapsed(formulaSettings)
                break
        }
        if (timeElapsed != undefined) {
            verifyEaseInOutTimeElapsed({
                timeElapsed,
                easeIn,
                easeOut,
            })
        }

        const { startPoint, endPoint } =
            deriveAllPointsFromArgs(formulaSettings)
        const formulaWithoutEasing = newInterpolationFormula(formulaSettings)

        if (formulaSettings.type == InterpolationTypeEnum.CONSTANT) {
            return {
                main: {
                    startTime: 0,
                    interpolation:
                        ConstantInterpolationService.new(formulaSettings),
                },
                timeRange: [0, 0],
            }
        }

        let easeInFragment = calculateEaseInFragment({
            easeIn,
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

        const mainMidTime = (mainStartTime + mainEndTime) / 2
        const mainMidDistance = calculateInterpolationFormula(
            formulaWithoutEasing,
            mainMidTime
        )

        let interpolation = createNewInterpolationFormula({
            formulaSettings,
            startTime: mainStartTime,
            startDistance: mainStartDistance,
            midTime: mainMidTime,
            midDistance: mainMidDistance,
            endTime: mainEndTime,
            endDistance: mainEndDistance,
        })

        const main: Fragment = {
            startTime: mainStartTime,
            interpolation,
        }
        let easeOutFragment = calculateEaseOutFragment({
            easeOut,
            endPoint,
            main,
        })

        return {
            easeIn: easeInFragment,
            main,
            easeOut: easeOutFragment,
            timeRange: [mainStartTime, mainEndTime],
        }
    },
    calculate: (formula: CurveInterpolation, time: number) =>
        calculate(formula, time),
    getStartPoint: (formula: CurveInterpolation): [number, number] => {
        return [formula.timeRange[0], calculate(formula, formula.timeRange[0])]
    },
    getEndPoint: (formula: CurveInterpolation): [number, number] => {
        return [formula.timeRange[1], calculate(formula, formula.timeRange[1])]
    },
}

const verifyEaseIn = ({
    easeIn,
    timeElapsed,
}: {
    easeIn?: { time: number; distance: number }
    timeElapsed: number
}) => {
    if (easeIn == undefined) return

    switch (true) {
        case easeIn.time < 0:
            throw new Error(
                "[CurveInterpolationService.verifyEaseIn]: easeIn.time cannot be negative"
            )
        case easeIn.time > timeElapsed:
            throw new Error(
                "[CurveInterpolationService.verifyEaseIn]: easeIn.time must be less than the elapsed time"
            )
    }
}

const verifyEaseOut = ({
    easeOut,
    timeElapsed,
}: {
    easeOut?: { time: number; distance: number }
    timeElapsed: number
}) => {
    if (easeOut == undefined) return

    switch (true) {
        case easeOut.time < 0:
            throw new Error(
                "[CurveInterpolationService.verifyEaseOut]: easeOut.time cannot be negative"
            )
        case easeOut.time > timeElapsed:
            throw new Error(
                "[CurveInterpolationService.verifyEaseOut]: easeOut.time must be less than the elapsed time"
            )
    }
}

const verifyEaseInAndEaseOut = ({
    easeOut,
    easeIn,
    timeElapsed,
}: {
    easeOut?: { time: number; distance: number }
    easeIn?: { time: number; distance: number }
    timeElapsed: number
}) => {
    if (easeIn == undefined || easeOut == undefined) return

    if (easeIn.time + easeOut.time > timeElapsed) {
        throw new Error(
            "[CurveInterpolationService.verifyEaseInAndEaseOut]: easeIn.time + easeOut.time must be less than the elapsed time"
        )
    }
}

const verifyEaseInOutTimeElapsed = ({
    timeElapsed,
    easeIn,
    easeOut,
}: {
    timeElapsed: number
    easeIn?: {
        time: number
        distance: number
    }
    easeOut?: {
        time: number
        distance: number
    }
}) => {
    verifyEaseIn({
        easeIn: easeIn,
        timeElapsed: timeElapsed,
    })
    verifyEaseOut({
        easeOut: easeOut,
        timeElapsed: timeElapsed,
    })
    verifyEaseInAndEaseOut({
        easeOut: easeOut,
        easeIn: easeIn,
        timeElapsed: timeElapsed,
    })
}

const calculateFragment = (fragment: Fragment, time: number): number => {
    return calculateInterpolationFormula(fragment.interpolation, time)
}

const calculateInterpolationFormula = (
    interpolation: InterpolationFormula,
    time: number
): number => {
    switch (interpolation.type) {
        case InterpolationTypeEnum.CONSTANT:
            return ConstantInterpolationService.calculate(
                interpolation as ConstantInterpolationFormula
            )
        case InterpolationTypeEnum.LINEAR:
            return LinearInterpolationService.calculate(
                interpolation as LinearInterpolationFormula,
                time
            )
        case InterpolationTypeEnum.QUADRATIC:
            return QuadraticInterpolationService.calculate(
                interpolation as QuadraticInterpolationFormula,
                time
            )
        case InterpolationTypeEnum.SINE:
            return SineInterpolationService.calculate(
                interpolation as SineInterpolationFormula,
                time
            )
        default:
            throw new Error(
                "[CurveInterpolationService.calculateInterpolationFormula]: Unsupported interpolation type"
            )
    }
}

const calculateEaseInFragment = ({
    easeIn,
    startPoint,
    formulaWithoutEasing,
}: {
    easeIn?: {
        time: number
        distance: number
        formulaSettings: PartialCurveInterpolationNewArgs
    }
    startPoint: [number, number]
    formulaWithoutEasing: InterpolationFormula
}): Fragment | undefined => {
    if (easeIn == undefined) return undefined
    if (easeIn.time <= 0) return undefined
    if (easeIn.distance == 0) return undefined
    if (easeIn.formulaSettings.type == InterpolationTypeEnum.CONSTANT)
        return undefined

    const easeInEndTime = startPoint[0] + easeIn.time
    const easeInEndDistance =
        calculateInterpolationFormula(formulaWithoutEasing, 0) + easeIn.distance

    const easeOutMidTime = (easeInEndTime + startPoint[0]) / 2
    const easeOutMidDistance = calculateInterpolationFormula(
        formulaWithoutEasing,
        easeOutMidTime
    )

    let easeInFormula = createNewInterpolationFormula({
        formulaSettings: easeIn.formulaSettings,
        startTime: startPoint[0],
        startDistance: startPoint[1],
        midTime: easeOutMidDistance,
        midDistance: easeOutMidDistance,
        endTime: easeInEndTime,
        endDistance: easeInEndDistance,
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

const newInterpolationFormula = (
    formulaSettings: CurveInterpolationNewArgs
): InterpolationFormula => {
    switch (formulaSettings.type) {
        case InterpolationTypeEnum.SINE:
            return SineInterpolationService.new(formulaSettings)
        case InterpolationTypeEnum.LINEAR:
            return LinearInterpolationService.new(formulaSettings)
        case InterpolationTypeEnum.CONSTANT:
            return ConstantInterpolationService.new(formulaSettings)
        default:
            throw new Error(
                "[newInterpolationFormula]: unknown Interpolation type"
            )
    }
}

const calculateEaseOutFragment = ({
    easeOut,
    endPoint,
    main,
}: {
    easeOut?: {
        time: number
        distance: number
        formulaSettings: PartialCurveInterpolationNewArgs
    }
    endPoint: [number, number]
    main: Fragment
}) => {
    if (easeOut == undefined) return undefined
    if (easeOut.time <= 0) return undefined
    if (easeOut.distance < 0) return undefined
    if (easeOut.formulaSettings.type == InterpolationTypeEnum.CONSTANT)
        return undefined

    const easeOutStartTime = endPoint[0] - easeOut.time
    const easeOutStartDistance = calculateInterpolationFormula(
        main.interpolation,
        easeOutStartTime
    )

    const easeOutMidTime = (easeOutStartTime + endPoint[0]) / 2
    const easeOutMidDistance = calculateInterpolationFormula(
        main.interpolation,
        easeOutMidTime
    )

    let easeOutFormula = createNewInterpolationFormula({
        formulaSettings: easeOut.formulaSettings,
        startTime: easeOutStartTime,
        startDistance: easeOutStartDistance,
        midTime: easeOutMidDistance,
        midDistance: easeOutMidDistance,
        endTime: endPoint[0],
        endDistance: easeOutStartDistance + easeOut.distance,
    })

    return {
        interpolation: easeOutFormula,
        startTime: easeOutStartTime,
    }
}

const calculate = (formula: CurveInterpolation, time: number): number => {
    switch (true) {
        case formula?.easeIn != undefined && time < formula.main.startTime:
            return calculateFragment(formula.easeIn, time)
        case formula?.easeOut != undefined && time >= formula.easeOut.startTime:
            return calculateFragment(formula.easeOut, time)
        default:
            return calculateFragment(formula.main, time)
    }
}

const deriveAllPointsFromArgs = (
    formulaSettings: CurveInterpolationNewArgs
) => {
    switch (formulaSettings.type) {
        case InterpolationTypeEnum.CONSTANT:
            return ConstantInterpolationService.deriveAllPointsFromArgs(
                formulaSettings
            )
        case InterpolationTypeEnum.LINEAR:
            return LinearInterpolationService.deriveAllPointsFromArgs(
                formulaSettings
            )
        case InterpolationTypeEnum.QUADRATIC:
            return QuadraticInterpolationService.deriveAllPointsFromArgs(
                formulaSettings
            )
        case InterpolationTypeEnum.SINE:
            return SineInterpolationService.deriveAllPointsFromArgs(
                formulaSettings
            )
        default:
            throw new Error("Unknown type")
    }
}

const createNewInterpolationFormula = ({
    formulaSettings,
    startTime,
    startDistance,
    midTime,
    midDistance,
    endTime,
    endDistance,
}: {
    formulaSettings: PartialCurveInterpolationNewArgs
    startTime: number
    startDistance: number
    midTime: number
    midDistance: number
    endTime: number
    endDistance: number
}): InterpolationFormula => {
    switch (formulaSettings.type) {
        case InterpolationTypeEnum.LINEAR:
            return LinearInterpolationService.new({
                ...formulaSettings,
                startPoint: [startTime, startDistance],
                endPoint: [endTime, endDistance],
            })
        case InterpolationTypeEnum.QUADRATIC:
            return QuadraticInterpolationService.new({
                ...formulaSettings,
                points: [
                    [startTime, startDistance],
                    [midTime, midDistance],
                    [endTime, endDistance],
                ],
            })
        case InterpolationTypeEnum.SINE:
            return SineInterpolationService.new({
                ...formulaSettings,
                timeRange: [startTime, endTime],
            })
        default:
            throw new Error(
                "[newInterpolationFormula]: unknown Interpolation type"
            )
    }
}
