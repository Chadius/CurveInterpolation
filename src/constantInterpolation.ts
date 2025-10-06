import {
    type InterpolationFormula,
    InterpolationTypeEnum,
} from "./interpolationType"

export interface ConstantInterpolationFormula extends InterpolationFormula {
    value: number
}

export const ConstantInterpolationService = {
    new: ({ value }: { value: number }): ConstantInterpolationFormula => {
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
}

const sanitize = ({ value }: { value: number }) => {
    if (value == undefined) {
        throw new Error(
            "[ConstantInterpolationFormula.new]: value must be defined"
        )
    }
}
