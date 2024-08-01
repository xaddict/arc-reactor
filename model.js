import jscad from '@jscad/modeling';
import { calculateNgon } from './math.js';
console.log(jscad);

const CIRCLE_SEGMENTS = 256;

const {
	// booleans
	intersect,
	scission,
	subtract,
	union,
} = jscad.booleans;
const {
	extrudeFromSlices,
	extrudeHelical,
	extrudeLinear,
	extrudeRectangular,
	extrudeRotate,
	project,
	slice,
} = jscad.extrusions;
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
	triangle,
} = jscad.primitives;
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
	translateZ,
} = jscad.transforms;
const {
	areAllShapesTheSameType,
	degToRad,
	flatten,
	fnNumberSort,
	insertSorted,
	radToDeg,
	radiusToSegments,
} = jscad.utils;
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
	rgbToHsv,
} = jscad.colors;

const OUTER_DIAMETER = 68;

function openRing(innerDiameter = 1, outerDiameter = 10) {
	const outerRadius = Math.max(innerDiameter, outerDiameter);
	const innerRadius = Math.min(innerDiameter, outerDiameter);
	return subtract(
		circle({ radius: outerRadius / 2, segments: CIRCLE_SEGMENTS }),
		circle({ radius: innerRadius / 2, segments: CIRCLE_SEGMENTS })
	);
}

function calculateEquilateralTriangle({ x = 0, y = 0, r = 10 } = {}) {
	const points = [];

	// Calculate the 60 degrees in radians
	const angle60 = (2 * Math.PI) / 3;

	// Calculate each vertex
	for (let i = 0; i < 3; i++) {
		const angle = angle60 * i + degToRad(-90);
		const px = Math.round(x + r * Math.cos(angle));
		const py = Math.round(y + r * Math.sin(angle));
		points.push([px, py]);
	}

	return points;
}

const triangledCircles = function ({
	triangleRadius = 14,
	circleRadius = 4,
} = {}) {
	const circles = [];
	const points = calculateEquilateralTriangle({ r: triangleRadius });
	console.log({ points });
	points.forEach((point) => {
		const c = circle({
			radius: circleRadius,
			center: [point[0], point[1]],
			segments: CIRCLE_SEGMENTS,
		});
		circles.push(c);
	});
	return union(circles);
};

const ringWithSpokes = colorize(
	[0, 1, 0],
	union(
		openRing(68, 60),
		rotateZ(
			degToRad(180 + 21),
			translate(
				[0, -17, 0],
				center(
					{ relativeTo: [0, -7.5, 0] },
					rectangle({ size: [3, 15] })
				)
			)
		),
		rotateZ(
			degToRad(180 - 21),
			translate(
				[0, -17, 0],
				center(
					{ relativeTo: [0, -7.5, 0] },
					rectangle({ size: [3, 15] })
				)
			)
		),
		rotateZ(
			degToRad(80),
			translate(
				[0, -17, 0],
				center(
					{ relativeTo: [0, -7.5, 0] },
					rectangle({ size: [3, 15] })
				)
			)
		),
		rotateZ(
			degToRad(-80),
			translate(
				[0, -17, 0],
				center(
					{ relativeTo: [0, -7.5, 0] },
					rectangle({ size: [3, 15] })
				)
			)
		),
		rotateZ(
			degToRad(40),
			translate(
				[0, -17, 0],
				center(
					{ relativeTo: [0, -7.5, 0] },
					rectangle({ size: [3, 15] })
				)
			)
		),
		rotateZ(
			degToRad(-40),
			translate(
				[0, -17, 0],
				center(
					{ relativeTo: [0, -7.5, 0] },
					rectangle({ size: [3, 15] })
				)
			)
		)
	)
);

const outerTriangle = intersect(
	union(
		subtract(
			polygon({
				points: calculateEquilateralTriangle({ r: 36 }),
			}),
			polygon({
				points: calculateEquilateralTriangle({ r: 30 }),
			})
		),
		rotateZ(
			degToRad(0),
			translate([0, -24, 13], rectangle({ size: [3, 17] }))
		),
		rotateZ(
			degToRad(-120),
			translate([0, -24, 13], rectangle({ size: [3, 17] }))
		),
		rotateZ(
			degToRad(120),
			translate([0, -24, 13], rectangle({ size: [3, 17] }))
		)
	),
	circle({ radius: 34 })
);

const innerTriangle = colorize(
	[1, 0, 0],

	subtract(
		polygon({
			points: calculateEquilateralTriangle({ r: 20 }),
		}),
		polygon({
			points: calculateEquilateralTriangle({ r: 14 }),
		}),
		triangledCircles({
			triangleRadius: 12,
			circleRadius: 3,
		})
	)
);

const emblem = translateZ(
	12,
	colorize(
		[0.5, 0.5, 0.5, 1],
		extrudeLinear(
			{ height: 1 },
			union(ringWithSpokes, outerTriangle, innerTriangle)
		)
	)
);

const outerDiameter = 90;

const footprint = translateZ(
	3,
	colorize([1, 0, 0], rectangle({ size: [outerDiameter, outerDiameter] }))
);

const layerOneHeight = 1;
const layerOne = colorize(
	[1, 1, 0],
	extrudeLinear(
		{ height: layerOneHeight },
		circle({ radius: outerDiameter / 2, segments: CIRCLE_SEGMENTS })
	)
);

const layerTwoInnerDiameter = 32;
const layerTwoHeight = 5;
const layerTwo = colorize(
	[1, 0, 1],
	translateZ(
		layerOneHeight,
		extrudeLinear(
			{ height: layerTwoHeight },
			openRing(outerDiameter, layerTwoInnerDiameter)
		)
	)
);

const layerThreeInnerRadius = 50;
const layerThreeHeight = 1;
const layerThree = colorize(
	[0, 0, 1],
	translateZ(
		layerOneHeight + layerTwoHeight,
		extrudeLinear(
			{ height: layerThreeHeight },
			openRing(outerDiameter, layerThreeInnerRadius)
		)
	)
);

const layerFourInnerRadius = 70;
const layerFourHeight = 4;
const layerFour = colorize(
	[0, 1, 0],
	translateZ(
		layerOneHeight + layerTwoHeight + layerThreeHeight,
		extrudeLinear(
			{ height: layerFourHeight },
			openRing(outerDiameter, layerFourInnerRadius)
		)
	)
);

const layerFiveInnerDiameter = 80;
const layerFiveHeight = 2;
const layerFive = colorize(
	[1, 0, 0],
	translateZ(
		layerOneHeight + layerTwoHeight + layerThreeHeight + layerFourHeight,
		extrudeLinear(
			{ height: layerFiveHeight },
			openRing(outerDiameter, layerFiveInnerDiameter)
		)
	)
);

const glassThickness = 1;
const glass = colorize(
	[0.5, 0.5, 1, 0.9],
	translateZ(
		layerOneHeight + layerTwoHeight + layerThreeHeight + layerFourHeight,
		extrudeLinear(
			{ height: glassThickness },
			circle({
				radius: layerFiveInnerDiameter / 2,
				segments: CIRCLE_SEGMENTS,
			})
		)
	)
);

const fakeEmblem = colorize(
	[0, 0, 0],
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
						outerDiameter / 4,
						rectangle({
							size: [2, layerFiveInnerDiameter / 2],
						})
					)
				),
				rotateZ(
					degToRad(30),
					translateY(
						outerDiameter / 4,
						rectangle({
							size: [2, layerFiveInnerDiameter / 2],
						})
					)
				),
				rotateZ(
					degToRad(60),
					translateY(
						outerDiameter / 4,
						rectangle({
							size: [2, layerFiveInnerDiameter / 2],
						})
					)
				),
				rotateZ(
					degToRad(90),
					translateY(
						outerDiameter / 4,
						rectangle({
							size: [2, layerFiveInnerDiameter / 2],
						})
					)
				),
				rotateZ(
					degToRad(120),
					translateY(
						outerDiameter / 4,
						rectangle({
							size: [2, layerFiveInnerDiameter / 2],
						})
					)
				),
				rotateZ(
					degToRad(150),
					translateY(
						outerDiameter / 4,
						rectangle({
							size: [2, layerFiveInnerDiameter / 2],
						})
					)
				),
				rotateZ(
					degToRad(180),
					translateY(
						outerDiameter / 4,
						rectangle({
							size: [2, layerFiveInnerDiameter / 2],
						})
					)
				),
				rotateZ(
					degToRad(210),
					translateY(
						outerDiameter / 4,
						rectangle({
							size: [2, layerFiveInnerDiameter / 2],
						})
					)
				),
				rotateZ(
					degToRad(240),
					translateY(
						outerDiameter / 4,
						rectangle({
							size: [2, layerFiveInnerDiameter / 2],
						})
					)
				),
				rotateZ(
					degToRad(270),
					translateY(
						outerDiameter / 4,
						rectangle({
							size: [2, layerFiveInnerDiameter / 2],
						})
					)
				),
				rotateZ(
					degToRad(300),
					translateY(
						outerDiameter / 4,
						rectangle({
							size: [2, layerFiveInnerDiameter / 2],
						})
					)
				),
				rotateZ(
					degToRad(330),
					translateY(
						outerDiameter / 4,
						rectangle({
							size: [2, layerFiveInnerDiameter / 2],
						})
					)
				),
				openRing(layerFiveInnerDiameter, layerFiveInnerDiameter - 14),
				openRing(outerDiameter * 0.6, outerDiameter * 0.6 - 5),
				openRing(10, 16)
			)
		)
	)
);

function ledRing({ diameter = 10, width = 2, num_leds = 12 } = {}) {
	const ringHeight = 1.5;
	const ledHeight = 1.5;
	const ring = colorize(
		[0, 0, 0],
		extrudeLinear(
			{ height: ringHeight },
			openRing(diameter - width, diameter + width)
		)
	);
	const points = calculateNgon(diameter, num_leds);
	const led_points = [];
	points.forEach((point) => {
		led_points.push(
			circle({
				center: [point.x, point.y],
				radius: width / 2,
				segments: CIRCLE_SEGMENTS,
			})
		);
	});
	const led_bases = [];
	points.forEach((point) => {
		led_bases.push(
			rotateZ(
				point.angle,
				translateY(diameter, rectangle({ size: [width, width] }))
			)
		);
	});
	const ledBases = colorize(
		[0.9, 0.9, 0.9],
		translateZ(ringHeight, extrudeLinear({ height: 0.5 }, union(led_bases)))
	);
	const leds = colorize(
		[1, 1, 1],
		translateZ(
			ringHeight,
			extrudeLinear({ height: ledHeight }, union(led_points))
		)
	);
	return [ring, ledBases, leds];
}

const trinket = colorize(
	[0.1, 0.1, 0.1],
	translateZ(
		layerOneHeight,
		union(
			extrudeLinear(
				{ height: 1 },
				roundedRectangle({ size: [15.3, 27], roundRadius: 1 })
			),
			translateY(
				11,
				extrudeLinear(
					{ height: 5 },
					roundedRectangle({ size: [7, 5], roundRadius: 1 })
				)
			)
		)
	)
);

const cableHeight = 5;
const cableWidth = 10;
const gap = colorize(
	[1, 1, 0],
	translateZ(
		layerOneHeight,
		translateY(
			60,
			extrudeLinear(
				{ height: cableHeight },
				rectangle({ size: [cableWidth, 100] })
			)
		)
	)
);

const ring = translateZ(
	layerOneHeight + layerTwoHeight,
	ledRing({ diameter: 40 / 2, width: 5, num_leds: 16 })
);
const ringTwo = translateZ(
	layerOneHeight + layerTwoHeight + layerThreeHeight,
	ledRing({ diameter: 60 / 2, width: 5, num_leds: 24 })
);

const cutterCube = cube({ size: outerRadius, center: [0, 0, 0] });

export default [
	// emblem,
	footprint,
	layerOne,
	subtract(layerTwo, gap),
	layerThree,
	layerFour,
	layerFive,

	trinket,
	ring,
	ringTwo,

	glass,
	fakeEmblem,
	cutterCube,
];
