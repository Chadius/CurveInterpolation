# Curve Interpolation Functions

Create a reusable mathematical formula object to move between 2 points on the x-axis over time.

You can ease in and ease out of the animation using different parameters.

This idea came about as I was trying to write animation functions and realized I could apply some animation principles just by adding ease in and ease out functions. There is also a great GitHub folder called [Optimized Easing Functions by Michael "Code Poet" Pohoreski, aka Michaelangel007](https://github.com/Michaelangel007/easing) that was a source of more inspiration.

# How to Use

1. `CurveInterpolationService.new()` is your entry point to create a new object.
2. Call `CurveInterpolationService.calculate()` with the new curve and time. This will return the distance.

## CurveInterpolationService.new()

This is a general purpose situation where curves can be built with an ease in, the main travel, and an ease out motion.
Use this to create new curves.

Here's a list of parameters:

### Start Point

An array with 2 numbers representing the start time and distance. (t0, x0)
The curve will begin here.

### End Point

An array with 2 numbers representing the end time and distance. (t1, x1)
The curve will end here.

### Ease In

This is a startup curve that can be used to control the initial behavior. Maybe you want the position to slowly accelerate to full speed, or you want a quick explosion as it plateaus.
This field is Optional, can be left undefined.

- This will throw an error if Ease In + Ease Out is more than (t1 - t0).
- This will throw an error if Ease In + Ease Out is more than (x1 - x0).

#### Time

A number representing how long it takes to reach the maximum linear speed.
Will throw an error if it is negative.

#### Distance

A number representing how far it eases in, relative to the start point x0. Needs to be a non-zero value.

### Ease Out

This curve can be used to control the final behavior of the curve. Maybe it slows to a gradual stop, or it rockets off
at full speed.
This field is Optional, can be left undefined.

- This will throw an error if Ease In + Ease Out is more than (t1 - t0).

#### Time

A number representing how long it takes to slow down while reaching t1. So 1 means it will start easing out at t1 - 1.

If time is 0 Ease Out is ignored.
Will throw an error if it is negative.

#### Distance

A number representing what distance it begins to ease out, relative to the end point x1. Needs to be a non-zero value.

## Interpolation Types

You can specify the type of interpolation using strings to define the underlying formula.

### LINEAR: Linear Interpolation

With linear interpolation, you will travel from a start point to an x point in a certain amount of time by moving in a constant speed.
