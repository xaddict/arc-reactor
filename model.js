import jscad, { expansions } from '@jscad/modeling'
import { calculateNgon } from './math.js'

console.log(jscad)

const CIRCLE_SEGMENTS = 256
/** group-collapse **/
const {
	// booleans
	intersect,
	scission,
	subtract,
	union
} = jscad.booleans
const {
	extrudeFromSlices,
	extrudeHelical,
	extrudeLinear,
	extrudeRectangular,
	extrudeRotate,
	project,
	slice
} = jscad.extrusions
const {
	arc,
	circle,
	cube,
	cuboid,
	cylinder,
	cylinderElliptic,
	ellipse,
	ellipsoid,
	geodesicSphere,
	line,
	polygon,
	polyhedron,
	rectangle,
	roundedCuboid,
	roundedCylinder,
	roundedRectangle,
	sphere,
	square,
	star,
	torus,
	triangle
} = jscad.primitives
const {
	align,
	center,
	centerX,
	centerY,
	centerZ,
	mirror,
	mirrorX,
	mirrorY,
	mirrorZ,
	rotate,
	rotateX,
	rotateY,
	rotateZ,
	scale,
	scaleX,
	scaleY,
	scaleZ,
	transform,
	translate,
	translateX,
	translateY,
	translateZ
} = jscad.transforms
const {
	areAllShapesTheSameType,
	degToRad,
	flatten,
	fnNumberSort,
	insertSorted,
	radToDeg,
	radiusToSegments
} = jscad.utils
const {
	colorNameToRgb,
	colorize,
	cssColors,
	hexToRgb,
	hslToRgb,
	hsvToRgb,
	hueToColorComponent,
	rgbToHex,
	rgbToHsl,
	rgbToHsv
} = jscad.colors
const { expand, offset } = expansions

function openRing(innerDiameter = 1, outerDiameter = 10) {
	const outerRadius = Math.max(innerDiameter, outerDiameter)
	const innerRadius = Math.min(innerDiameter, outerDiameter)
	return subtract(
		circle({ radius: outerRadius / 2, segments: CIRCLE_SEGMENTS }),
		circle({ radius: innerRadius / 2, segments: CIRCLE_SEGMENTS })
	)
}

function calculateEquilateralTriangle({ x = 0, y = 0, r = 10 } = {}) {
	const points = []

	// Calculate the 60 degrees in radians
	const angle60 = (2 * Math.PI) / 3

	// Calculate each vertex
	for (let i = 0; i < 3; i++) {
		const angle = angle60 * i + degToRad(-90)
		const px = Math.round(x + r * Math.cos(angle))
		const py = Math.round(y + r * Math.sin(angle))
		points.push([ px, py ])
	}

	return points
}

const triangledCircles = function({
	triangleRadius = 14,
	circleRadius = 4
} = {}) {
	const circles = []
	const points = calculateEquilateralTriangle({ r: triangleRadius })
	console.log({ points })
	points.forEach((point) => {
		const c = circle({
			radius: circleRadius,
			center: [ point[0], point[1] ],
			segments: CIRCLE_SEGMENTS
		})
		circles.push(c)
	})
	return union(circles)
}

const OUTER_DIAMETER = 90

const params = {
	OUTER_DIAMETER: 90,
	LAYER_ONE: {
		HEIGHT: 1
	},
	LAYER_TWO: {
		INNER_DIAMETER: 32, // 40 for round screen
		HEIGHT: 5
	},
	LAYER_THREE: {
		INNER_DIAMETER: 46,
		HEIGHT: 1
	},
	LAYER_FOUR: {
		INNER_DIAMETER: 66,
		HEIGHT: 4
	},
	LAYER_FIVE: {
		INNER_DIAMETER: 80,
		HEIGHT: 2
	},
	GLASS: {
		HEIGHT: 1
	}
}

const layerOneHeight = 1
const layerTwoHeight = 5
const layerThreeHeight = 1
const layerFourInnerRadius = 70
const layerFourHeight = 4
const layerFiveInnerDiameter = 80
const glassThickness = 1

const ringWithSpokes = colorize(
	[ 0, 1, 0 ],
	union(
		openRing(layerFiveInnerDiameter - 0.5, layerFourInnerRadius),
		rotateZ(
			degToRad(180 + 21),
			translate(
				[ 0, -20, 0 ],
				center(
					{ relativeTo: [ 0, -7.5, 0 ] },
					rectangle({ size: [ 3, 15 ] })
				)
			)
		),
		rotateZ(
			degToRad(180 - 21),
			translate(
				[ 0, -20, 0 ],
				center(
					{ relativeTo: [ 0, -7.5, 0 ] },
					rectangle({ size: [ 3, 15 ] })
				)
			)
		),
		rotateZ(
			degToRad(80),
			translate(
				[ 0, -20, 0 ],
				center(
					{ relativeTo: [ 0, -7.5, 0 ] },
					rectangle({ size: [ 3, 15 ] })
				)
			)
		),
		rotateZ(
			degToRad(-80),
			translate(
				[ 0, -20, 0 ],
				center(
					{ relativeTo: [ 0, -7.5, 0 ] },
					rectangle({ size: [ 3, 15 ] })
				)
			)
		),
		rotateZ(
			degToRad(40),
			translate(
				[ 0, -20, 0 ],
				center(
					{ relativeTo: [ 0, -7.5, 0 ] },
					rectangle({ size: [ 3, 15 ] })
				)
			)
		),
		rotateZ(
			degToRad(-40),
			translate(
				[ 0, -20, 0 ],
				center(
					{ relativeTo: [ 0, -7.5, 0 ] },
					rectangle({ size: [ 3, 15 ] })
				)
			)
		)
	)
)

const outerTriangle = intersect(
	union(
		subtract(
			expand({ delta: 2 }, polygon({
				points: calculateEquilateralTriangle({ r: 38 })
			})),
			expand({ delta: -2 }, polygon({
				points: calculateEquilateralTriangle({ r: 38 })
			}))
		),
		rotateZ(
			degToRad(0),
			translate([ 0, -26, 13 ], rectangle({ size: [ 3, 20 ] }))
		),
		rotateZ(
			degToRad(-120),
			translate([ 0, -26, 13 ], rectangle({ size: [ 3, 20 ] }))
		),
		rotateZ(
			degToRad(120),
			translate([ 0, -26, 13 ], rectangle({ size: [ 3, 20 ] }))
		)
	),
	circle({ radius: params.LAYER_FIVE.INNER_DIAMETER / 2 - 1 })
)

const innerTriangle = colorize(
	[ 1, 0, 0 ],

	subtract(
		expand({ delta: 2 }, polygon({
			points: calculateEquilateralTriangle({ r: 17 })
		})),
		expand({ delta: -2 }, polygon({
			points: calculateEquilateralTriangle({ r: 17 })
		})),
		triangledCircles({
			triangleRadius: 12,
			circleRadius: 3
		})
	)
)

const emblem = translateZ(
	12,
	colorize(
		[ 0.5, 0.5, 0.5, 1 ],
		extrudeLinear(
			{ height: 1 },
			union(ringWithSpokes, outerTriangle, innerTriangle)
		)
	)
)


const layerOne = colorize(
	[ 1, 1, 0 ],
	extrudeLinear(
		{ height: params.LAYER_ONE.HEIGHT },
		circle({ radius: params.OUTER_DIAMETER / 2, segments: CIRCLE_SEGMENTS })
	)
)


const layerTwo = colorize(
	[ 1, 0, 1 ],
	translateZ(
		params.LAYER_ONE.HEIGHT,
		subtract(
			extrudeLinear(
				{ height: params.LAYER_TWO.HEIGHT },
				openRing(params.OUTER_DIAMETER, params.LAYER_TWO.INNER_DIAMETER)
			),
			translateZ(
				params.LAYER_ONE.HEIGHT + params.LAYER_TWO.HEIGHT - 2,
				extrudeLinear(
					{ height: 2 },
					openRing(params.LAYER_THREE.INNER_DIAMETER, params.LAYER_THREE.INNER_DIAMETER - 5)
				)
			)
		)
	)
)

// const layerTwoCableGutter = colorize(
// 	[ 1, 0, 1 ],
// 	translateZ(
// 		params.LAYER_ONE.HEIGHT + params.LAYER_TWO.HEIGHT,
// 		extrudeLinear(
// 			{ height: 2 },
// 			openRing(params.LAYER_THREE.INNER_DIAMETER, params.LAYER_THREE.INNER_DIAMETER - 5)
// 		)
// 	)
// )


const layerThree = colorize(
	[ 0, 0, 1 ],
	translateZ(
		params.LAYER_ONE.HEIGHT + params.LAYER_TWO.HEIGHT,
		subtract(
			extrudeLinear(
				{ height: params.LAYER_THREE.HEIGHT },
				openRing(params.OUTER_DIAMETER, params.LAYER_THREE.INNER_DIAMETER)
			),
			extrudeLinear(
				{ height: 2 },
				openRing(params.LAYER_FOUR.INNER_DIAMETER, params.LAYER_FOUR.INNER_DIAMETER - 5)
			)
		)
	)
)


const layerFour = colorize(
	[ 0, 1, 0 ],
	translateZ(
		params.LAYER_ONE.HEIGHT + params.LAYER_TWO.HEIGHT + params.LAYER_THREE.HEIGHT,
		extrudeLinear(
			{ height: params.LAYER_FOUR.HEIGHT },
			openRing(params.OUTER_DIAMETER, params.LAYER_FOUR.INNER_DIAMETER)
		)
	)
)

const layerFourWall = colorize(
	[ 0, 1, 0 ],
	translateZ(
		params.LAYER_ONE.HEIGHT + params.LAYER_TWO.HEIGHT + params.LAYER_THREE.HEIGHT,
		extrudeLinear(
			{ height: params.LAYER_FOUR.HEIGHT },
			openRing(params.LAYER_THREE.INNER_DIAMETER, params.LAYER_THREE.INNER_DIAMETER + 8)
		)
	)
)


const layerFive = colorize(
	[ 1, 0, 0 ],
	translateZ(
		params.LAYER_ONE.HEIGHT + params.LAYER_TWO.HEIGHT + params.LAYER_THREE.HEIGHT + params.LAYER_FOUR.HEIGHT,
		extrudeLinear(
			{ height: params.LAYER_FIVE.HEIGHT },
			openRing(params.OUTER_DIAMETER, params.LAYER_FIVE.INNER_DIAMETER)
		)
	)
)

const pills = union(
	calculateNgon(params.OUTER_DIAMETER - (params.OUTER_DIAMETER - params.LAYER_FIVE.INNER_DIAMETER) / 2, 16).map(pill => {
		return translate([ pill.x, pill.y, 13 ], rotate([ degToRad(90), 0, pill.angle ],
			roundedCylinder({ radius: 1, height: 6, roundRadius: 1 }))
		)
	}))

const pegs = rotateZ(
	degToRad(11.25),
	union(
		calculateNgon(params.LAYER_FIVE.INNER_DIAMETER - (params.LAYER_FIVE.INNER_DIAMETER - params.LAYER_FOUR.INNER_DIAMETER) / 2 + 1.5, 16)
			.map(peg => {
					return translate([ peg.x, peg.y, 11.25 ], rotate([ 0, 0, 0 ],
						roundedCylinder({ radius: 1, height: 4, roundRadius: 0.25 }))
					)
				}
			)
	)
)

const glassDisc = translateZ(
	params.LAYER_ONE.HEIGHT + params.LAYER_TWO.HEIGHT + params.LAYER_THREE.HEIGHT + params.LAYER_FOUR.HEIGHT,
	extrudeLinear(
		{ height: glassThickness },
		circle({
			radius: layerFiveInnerDiameter / 2,
			segments: CIRCLE_SEGMENTS
		})
	)
)
const glass = glassify(
	subtract(
		glassDisc,
		pegs
	)
)


const fakeEmblem = colorize(
	[ 0, 0, 0 ],
	translateZ(
		layerOneHeight +
		layerTwoHeight +
		layerThreeHeight +
		layerFourHeight +
		glassThickness,
		extrudeLinear(
			{ height: 1 },
			union(
				rotateZ(
					degToRad(0),
					translateY(
						OUTER_DIAMETER / 4,
						rectangle({
							size: [ 2, layerFiveInnerDiameter / 2 ]
						})
					)
				),
				rotateZ(
					degToRad(30),
					translateY(
						OUTER_DIAMETER / 4,
						rectangle({
							size: [ 2, layerFiveInnerDiameter / 2 ]
						})
					)
				),
				rotateZ(
					degToRad(60),
					translateY(
						OUTER_DIAMETER / 4,
						rectangle({
							size: [ 2, layerFiveInnerDiameter / 2 ]
						})
					)
				),
				rotateZ(
					degToRad(90),
					translateY(
						OUTER_DIAMETER / 4,
						rectangle({
							size: [ 2, layerFiveInnerDiameter / 2 ]
						})
					)
				),
				rotateZ(
					degToRad(120),
					translateY(
						OUTER_DIAMETER / 4,
						rectangle({
							size: [ 2, layerFiveInnerDiameter / 2 ]
						})
					)
				),
				rotateZ(
					degToRad(150),
					translateY(
						OUTER_DIAMETER / 4,
						rectangle({
							size: [ 2, layerFiveInnerDiameter / 2 ]
						})
					)
				),
				rotateZ(
					degToRad(180),
					translateY(
						OUTER_DIAMETER / 4,
						rectangle({
							size: [ 2, layerFiveInnerDiameter / 2 ]
						})
					)
				),
				rotateZ(
					degToRad(210),
					translateY(
						OUTER_DIAMETER / 4,
						rectangle({
							size: [ 2, layerFiveInnerDiameter / 2 ]
						})
					)
				),
				rotateZ(
					degToRad(240),
					translateY(
						OUTER_DIAMETER / 4,
						rectangle({
							size: [ 2, layerFiveInnerDiameter / 2 ]
						})
					)
				),
				rotateZ(
					degToRad(270),
					translateY(
						OUTER_DIAMETER / 4,
						rectangle({
							size: [ 2, layerFiveInnerDiameter / 2 ]
						})
					)
				),
				rotateZ(
					degToRad(300),
					translateY(
						OUTER_DIAMETER / 4,
						rectangle({
							size: [ 2, layerFiveInnerDiameter / 2 ]
						})
					)
				),
				rotateZ(
					degToRad(330),
					translateY(
						OUTER_DIAMETER / 4,
						rectangle({
							size: [ 2, layerFiveInnerDiameter / 2 ]
						})
					)
				),
				openRing(layerFiveInnerDiameter, layerFiveInnerDiameter - 14),
				openRing(OUTER_DIAMETER * 0.6, OUTER_DIAMETER * 0.6 - 5),
				openRing(10, 16)
			)
		)
	)
)

function ledRing({ diameter = 10, width = 2, num_leds = 12 } = {}) {
	const ringHeight = 1.5
	const ledHeight = 1.5
	const ring = colorize(
		[ 0, 0, 0 ],
		extrudeLinear(
			{ height: ringHeight },
			openRing(diameter - width, diameter + width)
		)
	)
	const points = calculateNgon(diameter, num_leds)
	const led_points = []
	points.forEach((point) => {
		led_points.push(
			circle({
				center: [ point.x, point.y ],
				radius: width / 2,
				segments: CIRCLE_SEGMENTS
			})
		)
	})
	const led_bases = []
	points.forEach((point) => {
		led_bases.push(
			rotateZ(
				point.angle,
				translateY(diameter / 2, rectangle({ size: [ width, width ] }))
			)
		)
	})
	const ledBases = colorize(
		[ 0.9, 0.9, 0.9 ],
		translateZ(ringHeight, extrudeLinear({ height: 0.5 }, union(led_bases)))
	)
	const leds = colorize(
		[ 1, 1, 1 ],
		translateZ(
			ringHeight,
			extrudeLinear({ height: ledHeight }, union(led_points))
		)
	)
	return [ ring, ledBases, leds ]
}

const trinket = colorize(
	[ 0.1, 0.1, 0.1 ],
	translateZ(
		layerOneHeight,
		union(
			extrudeLinear(
				{ height: 1 },
				roundedRectangle({ size: [ 15.3, 27 ], roundRadius: 1 })
			),
			translateY(
				11,
				extrudeLinear(
					{ height: 5 },
					roundedRectangle({ size: [ 7, 5 ], roundRadius: 1 })
				)
			)
		)
	)
)

const roundScreen = colorize([ 1, 0, 0 ], translateZ(
	params.LAYER_ONE.HEIGHT,
	extrudeLinear(
		{ height: 9 },
		union(
			circle({ radius: 18.25, segments: CIRCLE_SEGMENTS }),
			translateY(15.7, polygon({ points: [ [ 18.37 / 2, 0 ], [ 12.81 / 2, 5.48 ], [ -12.81 / 2, 5.48 ], [ -18.38 / 2, 0 ] ] }))
			// width of lip
			// 12.81 min
			// 18.37 max
			// 5.48 height
		)
	)
))

const cableHeight = 6
const cableWidth = 10
const gap = colorize(
	[ 1, 1, 0 ],
	translateZ(
		layerOneHeight,
		translateY(
			20,
			extrudeLinear(
				{ height: cableHeight },
				rectangle({ size: [ cableWidth, 110 ] })
			)
		)
	)
)

const ring = translateZ(
	layerOneHeight + layerTwoHeight,
	ledRing({ diameter: 40, width: 5, num_leds: 16 })
)
const ringTwo = translateZ(
	layerOneHeight + layerTwoHeight + layerThreeHeight,
	ledRing({ diameter: 60, width: 5, num_leds: 24 })
)

const cutterCube = cube({ size: OUTER_DIAMETER, center: [ 0, -OUTER_DIAMETER / 2, 0 ] })

function glassify(model) {
	return colorize([ 0, 0, 0, 1 ], model)
}

export default [
	// trinket,
	// roundScreen,
	// ring,
	// ringTwo,
	// fakeEmblem,
	// pills,

	// subtract(
	// 	union(
	// 		layerOne,
	// 		layerTwo,
	// 		layerThree,
	// 		layerFour,
	// 		layerFourWall,
	// 		pegs,
	// 		subtract(layerFive, pills)
	// 	),
	// 	gap
	// ),

	// layerTwoCableGutter,
	// cutterCube
	// ),

	// glass,

	// pegs,
	subtract(emblem, pegs)
]
