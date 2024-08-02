export function calculateNgon(diameter, sides) {
	const points = [];
	const angleStep = (2 * Math.PI) / sides;

	// Calculate each vertex
	for (let i = 0; i < sides; i++) {
		const angle = angleStep * i;
		const x = diameter/2 * Math.cos(angle);
		const y = diameter/2 * Math.sin(angle);
		points.push({ x, y, angle });
	}

	return points;
}
