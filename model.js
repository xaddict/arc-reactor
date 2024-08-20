import jscad, { expansions } from '@jscad/modeling'
import { poolparty } from '@jscad/web/data/themes.js'
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
		HEIGHT: 7
	},
	LAYER_THREE: {
		INNER_DIAMETER: 46,
		HEIGHT: 0
	},
	LAYER_FOUR: {
		INNER_DIAMETER: 68,
		HEIGHT: 8
	},
	LAYER_FIVE: {
		INNER_DIAMETER: 80,
		HEIGHT: 4
	},
	GLASS: {
		HEIGHT: 2
	},
	EMBLEM: {
		HEIGHT: 2
	}
}

const ringWithSpokes = colorize(
	[ 0, 1, 0 ],
	union(
		openRing(params.LAYER_FIVE.INNER_DIAMETER - 0.5, params.LAYER_FOUR.INNER_DIAMETER),
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

const emblem = colorize(
	[ 0.5, 0.5, 0.5, 1 ],
	extrudeLinear(
		{ height: params.EMBLEM.HEIGHT },
		union(ringWithSpokes, outerTriangle, innerTriangle)
	)
)

function emblemTwo() {
	return extrudeLinear(
		{ height: 2 },
		subtract(
			circle({ radius: (params.LAYER_FIVE.INNER_DIAMETER - 1) / 2, segments: CIRCLE_SEGMENTS }),
			union(
				// openRing(params.LAYER_FIVE.INNER_DIAMETER - 0.5, params.LAYER_FOUR.INNER_DIAMETER),
				calculateNgon(params.LAYER_FOUR.INNER_DIAMETER - 8.5, 32).map(location => {
					return translate(
						[ location.x, location.y, 0 ],
						rotateZ(location.angle,
							roundedRectangle({ size: [ 8, 4 ], roundRadius: 1.5 })
						)
					)
				}),
				// openRing(params.LAYER_THREE.INNER_DIAMETER, params.LAYER_THREE.INNER_DIAMETER + 5),
				calculateNgon(params.LAYER_TWO.INNER_DIAMETER + 7, 16).map(location => {
					return translate(
						[ location.x, location.y, 0 ],
						rotateZ(location.angle,
							roundedRectangle({ size: [ 8, 4 ], roundRadius: 1.5 })
						)
					)
				}),
				// openRing(25, params.LAYER_TWO.INNER_DIAMETER),
				calculateNgon(params.LAYER_TWO.INNER_DIAMETER - 16, 8).map(location => {
					return translate(
						[ location.x, location.y, 0 ],
						rotateZ(location.angle,
							roundedRectangle({ size: [ 8, 4 ], roundRadius: 1.5 })
						)
					)
				}),
				circle({ radius: 3 })
			)
		)
	)
}

const layerOne = colorize(
	[ 1, 1, 0 ],
	extrudeLinear(
		{ height: params.LAYER_ONE.HEIGHT },
		circle({ radius: params.OUTER_DIAMETER / 2, segments: CIRCLE_SEGMENTS })
	)
)

const layerThree = colorize(
	[ 0, 0, 1 ],
	translateZ(
		params.LAYER_ONE.HEIGHT,
		extrudeLinear(
			{ height: params.LAYER_TWO.HEIGHT },
			openRing(params.OUTER_DIAMETER, params.LAYER_TWO.INNER_DIAMETER)
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

function layerFourWall() {
	const numHoles = 24
	const fencePoleLocations = calculateNgon(params.LAYER_THREE.INNER_DIAMETER + 2.5, numHoles)
	const poles = union(fencePoleLocations.map((location) => {
		return translate(
			[ location.x, location.y, params.LAYER_ONE.HEIGHT + params.LAYER_TWO.HEIGHT + params.LAYER_THREE.HEIGHT ],
			extrudeLinear(
				{ height: params.LAYER_FOUR.HEIGHT - 1 },
				circle({ radius: 1.2, segments: CIRCLE_SEGMENTS })
			)
		)
	}))

	return subtract(poles, translateZ(0, scaleZ(2, cableGap)))
}


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

function pills() {
	const locations = calculateNgon(params.OUTER_DIAMETER - (params.OUTER_DIAMETER - params.LAYER_FIVE.INNER_DIAMETER) / 2, 16)
	const zOffset = params.LAYER_ONE.HEIGHT + params.LAYER_TWO.HEIGHT + params.LAYER_THREE.HEIGHT + params.LAYER_FOUR.HEIGHT + params.LAYER_FIVE.HEIGHT
	return locations.map(pill => {
		return translate(
			[ pill.x, pill.y, zOffset ],
			rotate([ degToRad(90), 0, pill.angle ],
				roundedCylinder({ radius: 1, height: 6, roundRadius: 1 }))
		)
	})
}

const pegs = rotateZ(
	degToRad(11.25),
	union(
		calculateNgon(
			params.LAYER_FIVE.INNER_DIAMETER - (params.LAYER_FIVE.INNER_DIAMETER - params.LAYER_FOUR.INNER_DIAMETER) / 2,
			16
		).map(peg => {
				return translate(
					[ peg.x, peg.y, 0 ],
					extrudeLinear(
						{ height: params.GLASS.HEIGHT + params.EMBLEM.HEIGHT },
						circle({ radius: 1 })
					)
					// roundedCylinder({
					// 	radius: 1,
					// 	height: (params.GLASS.HEIGHT + params.EMBLEM.HEIGHT) * 2,
					// 	roundRadius: 0.25
					// })
				)
			}
		)
	)
)

const pegHoles = rotateZ(
	degToRad(11.25),
	union(
		calculateNgon(
			params.LAYER_FIVE.INNER_DIAMETER - (params.LAYER_FIVE.INNER_DIAMETER - params.LAYER_FOUR.INNER_DIAMETER) / 2,
			16
		).map(peg => {
				return translate(
					[ peg.x, peg.y, 0 ],
					roundedCylinder({
						radius: 1.5,
						height: (params.GLASS.HEIGHT + params.EMBLEM.HEIGHT) * 2,
						roundRadius: 0.25
					})
				)
			}
		)
	)
)

const glassDisc = extrudeLinear(
	{ height: params.GLASS.HEIGHT },
	circle({
		radius: (params.LAYER_FIVE.INNER_DIAMETER / 2) - 0.5,
		segments: CIRCLE_SEGMENTS
	})
)

const glass = glassify(
	subtract(
		glassDisc,
		pegHoles
	)
)


const fakeEmblem = colorize(
	[ 0, 0, 0 ],
	translateZ(
		params.LAYER_ONE.HEIGHT +
		params.LAYER_TWO.HEIGHT +
		params.LAYER_THREE.HEIGHT +
		params.LAYER_FOUR.HEIGHT +
		params.GLASS.HEIGHT,
		extrudeLinear(
			{ height: params.EMBLEM.HEIGHT },
			union(
				rotateZ(
					degToRad(0),
					translateY(
						OUTER_DIAMETER / 4,
						rectangle({
							size: [ 2, params.LAYER_FIVE.INNER_DIAMETER / 2 ]
						})
					)
				),
				rotateZ(
					degToRad(30),
					translateY(
						OUTER_DIAMETER / 4,
						rectangle({
							size: [ 2, params.LAYER_FIVE.INNER_DIAMETER / 2 ]
						})
					)
				),
				rotateZ(
					degToRad(60),
					translateY(
						OUTER_DIAMETER / 4,
						rectangle({
							size: [ 2, params.LAYER_FIVE.INNER_DIAMETER / 2 ]
						})
					)
				),
				rotateZ(
					degToRad(90),
					translateY(
						OUTER_DIAMETER / 4,
						rectangle({
							size: [ 2, params.LAYER_FIVE.INNER_DIAMETER / 2 ]
						})
					)
				),
				rotateZ(
					degToRad(120),
					translateY(
						OUTER_DIAMETER / 4,
						rectangle({
							size: [ 2, params.LAYER_FIVE.INNER_DIAMETER / 2 ]
						})
					)
				),
				rotateZ(
					degToRad(150),
					translateY(
						OUTER_DIAMETER / 4,
						rectangle({
							size: [ 2, params.LAYER_FIVE.INNER_DIAMETER / 2 ]
						})
					)
				),
				rotateZ(
					degToRad(180),
					translateY(
						OUTER_DIAMETER / 4,
						rectangle({
							size: [ 2, params.LAYER_FIVE.INNER_DIAMETER / 2 ]
						})
					)
				),
				rotateZ(
					degToRad(210),
					translateY(
						OUTER_DIAMETER / 4,
						rectangle({
							size: [ 2, params.LAYER_FIVE.INNER_DIAMETER / 2 ]
						})
					)
				),
				rotateZ(
					degToRad(240),
					translateY(
						OUTER_DIAMETER / 4,
						rectangle({
							size: [ 2, params.LAYER_FIVE.INNER_DIAMETER / 2 ]
						})
					)
				),
				rotateZ(
					degToRad(270),
					translateY(
						OUTER_DIAMETER / 4,
						rectangle({
							size: [ 2, params.LAYER_FIVE.INNER_DIAMETER / 2 ]
						})
					)
				),
				rotateZ(
					degToRad(300),
					translateY(
						OUTER_DIAMETER / 4,
						rectangle({
							size: [ 2, params.LAYER_FIVE.INNER_DIAMETER / 2 ]
						})
					)
				),
				rotateZ(
					degToRad(330),
					translateY(
						OUTER_DIAMETER / 4,
						rectangle({
							size: [ 2, params.LAYER_FIVE.INNER_DIAMETER / 2 ]
						})
					)
				),
				openRing(params.LAYER_FIVE.INNER_DIAMETER, params.LAYER_FIVE.INNER_DIAMETER - 14),
				openRing(OUTER_DIAMETER * 0.6, OUTER_DIAMETER * 0.6 - 5),
				openRing(10, 16)
			)
		)
	)
)

function struts() {
	const sides = 16
	const locations = calculateNgon(OUTER_DIAMETER + 1, sides)
	const struts = union(locations.map((location) => {
		return translate(
			[ location.x, location.y, -1 ],
			rotateZ(
				location.angle,
				rotateY(
					degToRad(-5.45),
					extrudeLinear(
						{ height: params.LAYER_ONE.HEIGHT + params.LAYER_TWO.HEIGHT + params.LAYER_THREE.HEIGHT + params.LAYER_FOUR.HEIGHT + params.LAYER_FIVE.HEIGHT + 2 },
						rectangle({ size: [ 3, 4 ] })
					)
				)
			)
		)
	}))
	const bottomCut = colorize(
		[ 1, 0, 0, 1 ],
		translateZ(
			-2,
			extrudeLinear(
				{ height: 2 },
				circle({ radius: OUTER_DIAMETER, segments: CIRCLE_SEGMENTS })
			)
		)
	)
	const topCut = colorize(
		[ 1, 0, 0, 1 ],
		translateZ(
			params.LAYER_ONE.HEIGHT + params.LAYER_TWO.HEIGHT + params.LAYER_THREE.HEIGHT + params.LAYER_FOUR.HEIGHT + params.LAYER_FIVE.HEIGHT - 0.1,
			extrudeLinear(
				{ height: 2 },
				circle({ radius: OUTER_DIAMETER, segments: CIRCLE_SEGMENTS })
			)
		)
	)
	return colorize(
		[ 0, 0, 0, 1 ],
		subtract(
			rotateZ(degToRad((360 / sides) / 2), struts),
			bottomCut,
			topCut
		)
	)
}

function magnetHoles() {
	const magnetRadius = 4.2
	const sides = 4
	const locations = calculateNgon(59.5, sides)
	const holes = locations.map((location) => {
		return translate(
			[ location.x, location.y, params.LAYER_ONE.HEIGHT ],
			extrudeLinear(
				{ height: 100 },
				circle({ radius: magnetRadius, segments: CIRCLE_SEGMENTS })
			)
		)
	})
	return rotateZ(degToRad((360 / 8)), holes)
}

function ledRing({ outerDiameter = 40, innerDiameter = 30, num_leds = 12 } = {}) {
	const width = outerDiameter - innerDiameter
	const ringHeight = 1.5
	const ledHeight = 1.5
	const ring = colorize(
		[ 0, 0, 0 ],
		extrudeLinear(
			{ height: ringHeight },
			openRing(innerDiameter, outerDiameter)
		)
	)
	const points = calculateNgon(outerDiameter - width / 2, num_leds)
	const led_points = []
	points.forEach((point) => {
		led_points.push(
			circle({
				center: [ point.x, point.y ],
				radius: 5 / 2,
				segments: CIRCLE_SEGMENTS
			})
		)
	})
	const led_bases = []
	points.forEach((point) => {
		led_bases.push(
			translate([ point.x, point.y, 0 ],
				rotateZ(
					point.angle,
					rectangle({ size: [ 5.5, 5.5 ] })
				)
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
		params.LAYER_ONE.HEIGHT,
		union(
			extrudeLinear(
				{ height: 1 },
				roundedRectangle({ size: [ 15.3, 27 ], roundRadius: 1 })
			),
			translateY(
				-11,
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

const cableWidth = 11
const cableGap = colorize(
	[ 1, 1, 0 ],
	translateZ(
		params.LAYER_ONE.HEIGHT,
		translateY(
			-30,
			extrudeLinear(
				{ height: params.LAYER_TWO.HEIGHT },
				rectangle({ size: [ cableWidth, 60 ] })
			)
		)
	)
)

const ring = translateZ(
	params.LAYER_ONE.HEIGHT + params.LAYER_TWO.HEIGHT,
	ledRing({
		outerDiameter: 44,
		innerDiameter: 33,
		num_leds: 16
	})
)
const ringTwo = translateZ(
	params.LAYER_ONE.HEIGHT + params.LAYER_TWO.HEIGHT + params.LAYER_THREE.HEIGHT,
	ledRing({
		outerDiameter: 66,
		innerDiameter: 53,
		num_leds: 24
	})
)

function glassify(model) {
	return colorize([ 0, 0, 0, 1 ], model)
}

const SHOW_INNER_GLASS = true

function innerGlass() {
	if (SHOW_INNER_GLASS) {
		return colorize(
			[ 1, 1, 1, 0.25 ],
			translateY(
				0,
				translateZ(
					SPREAD_OUT ? 0 : (params.LAYER_ONE.HEIGHT + params.LAYER_TWO.HEIGHT + params.LAYER_FOUR.HEIGHT - 1),
					extrudeLinear(
						{ height: 1 },
						circle({ radius: (params.LAYER_FOUR.INNER_DIAMETER - 1) / 2, segments: CIRCLE_SEGMENTS })
					)
				)
			)
		)
	}
}

const SPREAD_OUT = true

function magnetCross() {
	// magnet cross
	return translateX(SPREAD_OUT ? 100 : 0,
		rotateX(SPREAD_OUT ? 0 : degToRad(180),
			subtract(
				extrudeLinear(
					{ height: 3 },
					rotateZ(
						degToRad(45),
						union(
							roundedRectangle({ size: [ 10, OUTER_DIAMETER - 20 ], roundRadius: 4.9, segments: CIRCLE_SEGMENTS }),
							rotateZ(degToRad(90), roundedRectangle({ size: [ 10, OUTER_DIAMETER - 20 ], roundRadius: 4.9, segments: CIRCLE_SEGMENTS }))
						)
					),
				),
				magnetHoles(),
			)
		)
	)
}

const CLIP_FOOT_SIZE = [ 14, 10 ]
const CLIP_FOOT_HEIGHT = 1
const CLIP_STEM_SIZE = [ 3, 10 ]
const CLIP_STEM_HEIGHT = 19
const CLIP_HEAD_SIZE = [ 14, 10 ]
const CLIP_HEAD_HEIGHT = 1
const CLIP_RADIUS = 1

function clip() {
	return union(
		translate([ 0, 4, 21.4 ], rotate([ degToRad(90), 0, degToRad(90) ], roundedCylinder({ radius: 1, height: 14, roundRadius: 1 }))),
		translate([ 0, 2, 21.4 ], rotate([ degToRad(90), 0, degToRad(90) ], roundedCylinder({ radius: 1, height: 14, roundRadius: 1 }))),
		translate([ 0, 0, 21.4 ], rotate([ degToRad(90), 0, degToRad(90) ], roundedCylinder({ radius: 1, height: 14, roundRadius: 1 }))),
		translate([ 0, -2, 21.4 ], rotate([ degToRad(90), 0, degToRad(90) ], roundedCylinder({ radius: 1, height: 14, roundRadius: 1 }))),
		translate([ 0, -4, 21.4 ], rotate([ degToRad(90), 0, degToRad(90) ], roundedCylinder({ radius: 1, height: 14, roundRadius: 1 }))),

		translate([ -1.5, 0, 20.4 ], rotateX(degToRad(90), roundedCylinder({ radius: 0.9, height: 6, roundRadius: 0.9 }))),
		subtract(
			extrudeLinear({ height: 21.4 }, roundedRectangle({ size: [ 16, 10 ], center: [ -1, 0, 0 ], roundRadius: 1 })),
			cuboid({ size: [ 4, 10, 30 ], center: [ -9, 0, 10 ] }), // side cut
			cuboid({ size: [ 16.4, 10, 19.4 ], center: [ 4, 0, 10.7 ] }), // inner cut
		)
	)
}

function clips() {
	return !SPREAD_OUT ? [
		translate([ -41, 0, 0 ], rotateZ(degToRad(-0), clip())),
		translate([ 0, 41, 0 ], rotateZ(degToRad(-90), clip())),
		translate([ 41, 0, 0 ], rotateZ(degToRad(-180), clip()))
	] : [
		translate([ -20, -60, 7 ], rotateY(degToRad(-90), rotateX(degToRad(90), clip()))),
		translate([ 0, -60, 7 ], rotateY(degToRad(-90), rotateX(degToRad(90), clip()))),
		translate([ 20, -60, 7 ], rotateY(degToRad(-90), rotateX(degToRad(90), clip()))),
	]
}

function clipGaps() {
	return colorize([ 0, 0, 0, 1 ], union(
		translate(
			[ -41, 0, 0 ],
			extrudeLinear(
				{ height: CLIP_FOOT_HEIGHT + 0.2 },
				roundedRectangle({ size: CLIP_FOOT_SIZE.map(dimension => dimension + 0.4), roundRadius: CLIP_RADIUS })
			)
		),
		translate(
			[ 41, 0, 0 ],
			extrudeLinear(
				{ height: CLIP_FOOT_HEIGHT + 0.2 },
				roundedRectangle({ size: CLIP_FOOT_SIZE.map(dimension => dimension + 0.4), roundRadius: CLIP_RADIUS })
			)
		),
		translate(
			[ 0, 41, 0 ],
			rotateZ(degToRad(90),
				extrudeLinear(
					{ height: CLIP_FOOT_HEIGHT + 0.2 },
					roundedRectangle({ size: CLIP_FOOT_SIZE.map(dimension => dimension + 0.4), roundRadius: CLIP_RADIUS })
				)
			)
		),
	))
}

export default [
	// trinket,
	// roundScreen,
	// ring,
	// ringTwo,
	// fakeEmblem,
	// pills,

	// union(
	// 	subtract(layerOne, clipGaps()),
	// 	layerFour,
	// 	layerFourWall(),
	// 	colorize([ 1, 0, 0, 1 ], subtract(layerFive, pills())),
	// 	colorize([ 0, 0, 1, 1 ], translateZ(params.LAYER_ONE.HEIGHT + params.LAYER_TWO.HEIGHT + params.LAYER_THREE.HEIGHT + params.LAYER_FOUR.HEIGHT, pegs)),
	// 	colorize(
	// 		[ 0, 0, 1, 1 ],
	// 		subtract(
	// 			layerThree,
	// 			cableGap,
	// 			magnetHoles(),
	// 			clipGaps()
	// 		)
	// 	),
	// 	struts(),
	// ),

	// clips(),

	innerGlass(),

	// layerTwoCableGutter,
	// cutterCube
	// ),


	// translateX(
	// 	0,
	// translateZ(
	// 	params.LAYER_ONE.HEIGHT + params.LAYER_TWO.HEIGHT + params.LAYER_THREE.HEIGHT + params.LAYER_FOUR.HEIGHT,
	// 	0,
	// colorize([ 1, 1, 1, 0.5 ], glass)
	// ),
	// ),

	// translateY(
	// 	100,
	// translateZ(
	// 	params.LAYER_ONE.HEIGHT + params.LAYER_TWO.HEIGHT + params.LAYER_THREE.HEIGHT + params.LAYER_FOUR.HEIGHT + params.GLASS.HEIGHT,
	// 	0,
	// subtract(emblem, pegHoles)
	// emblemTwo()
	// ),
	// )

	// magnetCross()
]
