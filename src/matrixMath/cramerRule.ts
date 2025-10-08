export const CramerRuleService = {
    solve: (
        coefficients0: [number, number, number],
        coefficients1: [number, number, number],
        coefficients2: [number, number, number],
        rightSide: [number, number, number]
    ): [number, number, number] | undefined => {
        if (
            coefficients0 == undefined ||
            coefficients0.some((x) => x == undefined)
        ) {
            throw new Error(
                "[CramerRuleService.solve]: coefficients0 must be defined"
            )
        }
        if (
            coefficients1 == undefined ||
            coefficients1.some((x) => x == undefined)
        ) {
            throw new Error(
                "[CramerRuleService.solve]: coefficients1 must be defined"
            )
        }
        if (
            coefficients2 == undefined ||
            coefficients2.some((x) => x == undefined)
        ) {
            throw new Error(
                "[CramerRuleService.solve]: coefficients2 must be defined"
            )
        }

        const [a, b, c] = coefficients0
        const [d, e, f] = coefficients1
        const [g, h, i] = coefficients2

        const mainDeterminant = calculateDeterminant(a, b, c, d, e, f, g, h, i)
        const determinantX = calculateDeterminant(
            rightSide[0],
            b,
            c,
            rightSide[1],
            e,
            f,
            rightSide[2],
            h,
            i
        )
        const determinantY = calculateDeterminant(
            a,
            rightSide[0],
            c,
            d,
            rightSide[1],
            f,
            g,
            rightSide[2],
            i
        )
        const determinantZ = calculateDeterminant(
            a,
            b,
            rightSide[0],
            d,
            e,
            rightSide[1],
            g,
            h,
            rightSide[2]
        )

        if (mainDeterminant == 0) {
            return undefined
        }

        return [
            determinantX / mainDeterminant,
            determinantY / mainDeterminant,
            determinantZ / mainDeterminant,
        ]
    },
}

const calculateDeterminant = (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
    i: number
): number => {
    return a * e * i + b * f * g + c * d * h - c * e * g - b * d * i - a * f * h
}
