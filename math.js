export function calculateNgon(radius, sides) {
	const points = [];
	const angleStep = (2 * Math.PI) / sides;

	// Calculate each vertex
	for (let i = 0; i < sides; i++) {
		const angle = angleStep * i;
		const x = radius * Math.cos(angle);
		const y = radius * Math.sin(angle);
		points.push({ x, y, angle });
	}

	return points;
}
