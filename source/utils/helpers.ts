interface Coordinates {
    x: number;
    y: number;
    z: number;
}

// Helper function to calculate Euclidean distance in 3D space
function calculateDistance(a: Coordinates, b: Coordinates): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export default { calculateDistance }