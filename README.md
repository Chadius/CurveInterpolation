# Curve Interpolation Functions

Create a reusable mathematical formula object to move between 2 points on the x-axis over time.

This was built with movement animation in mind, where you can ease in and ease out to speed up the movement in a more natural manner. 

# Examples

## Simple Linear Formula
```typescript
import { InterpolationTypeEnum } from "./interpolationType"
import {
    ConstantInterpolationService,
} from "./constantInterpolation.ts"

const formula = CurveInterpolationService.new({
    formulaSettings: {
        type: InterpolationTypeEnum.LINEAR,
        startPoint: [1, 0],
        endPoint: [9, 4],
    },
})

CurveInterpolationService.calculate(formula, 0) //0
CurveInterpolationService.calculate(formula, 1) //0
CurveInterpolationService.calculate(formula, 3) //1
CurveInterpolationService.calculate(formula, 5) //2
CurveInterpolationService.calculate(formula, 7) //3
CurveInterpolationService.calculate(formula, 9) //4
```

The `new` command here creates a linear formula whose results range from 0 to 4. You can use it to calculate results for a given time using the `calculate` function. The formula expects a range from 1 to 9, and will clamp to before 1 or after 9.

## Linear Formula with ease in
```typescript
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

CurveInterpolationService.calculate(formula, 2) //1
CurveInterpolationService.calculate(formula, 4) //2
CurveInterpolationService.calculate(formula, 6) //5
CurveInterpolationService.calculate(formula, 8) //8
```
The first 4 seconds of real time will be treated like the first 2 seconds of the formula. So the first 4 seconds will move at half the expected speed. 
This formula will speed up afterward to compensate so it has a value of 8 after 8 seconds.

## Linear Formula with ease in and ease out
```typescript
const formula = CurveInterpolationService.new({
    formulaSettings: {
        type: InterpolationTypeEnum.LINEAR,
        startPoint: [0, 0],
        endPoint: [8, 8],
    },
    easeIn: {
        realTime: 3,
        formulaTime: 2,
    },
    easeOut: {
        realTime: 3,
        formulaTime: 2,
    },
})

CurveInterpolationService.calculate(formula, 0) //0
CurveInterpolationService.calculate(formula, 3) //2
CurveInterpolationService.calculate(formula, 4) //4
CurveInterpolationService.calculate(formula, 5) //6
CurveInterpolationService.calculate(formula, 8) //8
```
`easeOut` is similar to `easeIn`, except it affects the end of the formula. Usually the formula will speed up until it reaches the end and then slow down as it eases out. You can combine `easeIn` and `easeOut` to change the speed.

## Sine Interpolation
```typescript
import { InterpolationTypeEnum } from "./interpolationType"
import {
    ConstantInterpolationService,
} from "./constantInterpolation.ts"

const formula = CurveInterpolationService.new({
    formulaSettings: {
        type: InterpolationTypeEnum.SINE,
        timeRange: [2, 12],
        amplitude: 5,
        frequency: 2,
        phaseShift: 1,
        verticalShift: 3,
    },
})

CurveInterpolationService.calculate(formula, 2.5) //2
CurveInterpolationService.calculate(formula, 7) //3
```
Curves can be sinusoidal and use the sine function to produce sine waves.

# Reference
## CurveInterpolationService.new()
Use this function to create a new formula. This function will throw errors if any are found.

```typescript
let new = ({
     formulaSettings,
     easeIn,
     easeOut,
 }: {
    formulaSettings: CurveInterpolationNewArgs
    easeIn?: {
        realTime: number
        formulaTime: number
    }
    easeOut?: {
        realTime: number
        formulaTime: number
    }
}) => CurveInterpolation
```

- `formulaSettings`: describe the formula you want to represent. More on that below.
- `easeIn` (optional): You can change the speed at which the formula starts. You must specify how much real time this will take from the formula as well as how much of the formula time it will take.  
- `easeOut` (optional): You can change the speed at which the formula ends. These use the same parameters as `easeIn`.

easeIn and easeOut's times have the following restrictions:
- Times must be non-negative
- Adding easeIn and easeOut's time must not exceed the overall length of the formula.

### formulaSettings
#### Constant
Always returns a constant value, no matter what time you use.

```typescript
let formulaSettings = {
    type: InterpolationTypeEnum.CONSTANT,
    value: number,
}
```

- `type`: Use `InterpolationTypeEnum.CONSTANT`
- `value`: The value the formula will always return.

#### Linear
Interpolates between the start and end points in a linear fashion.

```typescript
let formulaSettings: {
    type: InterpolationTypeEnum.LINEAR,
    startPoint: [number, number],
    endPoint: [number, number]
}
```

- `type`: Use `InterpolationTypeEnum.LINEAR`
- `startPoint`: Two numbers representing the start time of the formula and the starting value.
- `endPoint`: Two numbers representing the end time of the formula and the ending value.

`startPoint` and `endPoint` must start at different times.

#### Quadratic
Interpolates between the 3 points using a parabola that connects them.

```typescript
let formulaSettings: {
    type: InterpolationTypeEnum.QUADRATIC,
    points: [[number, number],[number, number],[number, number]],
}
```

- `type`: Use `InterpolationTypeEnum.QUADRATIC`
- `points`: Three pairs of two numbers representing the time and value at 3 different points in the parabola.

Some restrictions on `points`:
- All of them must have different start times.
- If all 3 points are collinear, the equation will collapse into a line or a constant curve. This will not throw an error.

#### Sine
Using `sin(time)` this will draw a never ending curve that wavers up and down.

```typescript
let formulaSettings: {
    type: InterpolationTypeEnum.SINE,
    timeRange: [number, number],
    amplitude: number,
    frequency: number,
    phaseShift?: number,
    verticalShift?: number,
}
```

- `type`: Use `InterpolationTypeEnum.SINE`
- `timeRange`: Two numbers representing the start and end time of the formula.
- `amplitude`: A single number representing the peak of the sine curve from the middle. The curve's total height is twice the amplitude.
- `frequency`: The number of complete oscillations per second. A complete oscillation will move up, hit the peak, move down, cross the middle, hit the bottom peak, then move up to the middle again. Inverse of the Period.
- `phaseShift` (optional): Default is 0, where the curve will start at the bottom and move up towards the peak. A positive `phaseShift` value will start later (think of moving the curve to the left.) For example, setting this to one quarter of the Period will turn the sine wave into a cosine wave. 
- `verticalShift` (optional): Default is 0, where the curve will oscillate between + and - `amplitude`. A positive `verticalShift` will increase the results (think of raising the curve.) So a value of `amplitude` means the curve will vary from 0 to `2 * amplitude`.

`frequency` must be a positive number.
`timeRange` must have 2 different numbers.

## CurveInterpolationService.calculate()
With a given formula and real time, use the formula to calculate the result. Returns a number.

```typescript
calculate: (formula: CurveInterpolation, time: number) => number
```

- `formula`: Created using `CurveInterpolationService.new()`.
- `time`: a number in real time.

If `time` is before the formula starts, it will return the starting value.
If `time` is after the formula starts, it will return the ending value.
Otherwise, `time` is applied. 
