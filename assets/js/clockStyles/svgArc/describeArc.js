export function polarToCartesian(radius, angleInDegrees, centerX = radius, centerY = radius) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

export function describeArc(radius, startAngle, endAngle, x = radius, y = radius) {
    const start = polarToCartesian(radius, endAngle, x, y);
    const end = polarToCartesian(radius, startAngle, x, y);
    const largeArcFlag = (endAngle - startAngle <= 180) ? "0" : "1";

    const d = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;

    return {
        d: d,
        x: start.x,
        y: start.y,
    };
}