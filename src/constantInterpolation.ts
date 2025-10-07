import {
    type InterpolationFormula,
    InterpolationTypeEnum,
} from "./interpolationType"

export interface ConstantInterpolationNewArgs extends InterpolationFormula {
    type: typeof InterpolationTypeEnum.CONSTANT
    value: number
}

export interface ConstantInterpolationFormula extends InterpolationFormula {
    value: number
}

export const ConstantInterpolationService = {
    new: ({
        value,
    }: ConstantInterpolationNewArgs): ConstantInterpolationFormula => {
        sanitize({
            value,
        })

        return {
            type: InterpolationTypeEnum.CONSTANT,
            value,
        }
    },
    calculate: (formula: ConstantInterpolationFormula): number => {
        return formula.value
    },
    deriveStartPointAndEndPointFromArgs: (
        args: ConstantInterpolationNewArgs
    ): {
        startPoint: [number, number]
        endPoint: [number, number]
    } => {
        return {
            startPoint: [0, args.value],
            endPoint: [0, args.value],
        }
    },
}

const sanitize = ({ value }: { value: number }) => {
    if (value == undefined) {
        throw new Error(
            "[ConstantInterpolationFormula.new]: value must be defined"
        )
    }
}
