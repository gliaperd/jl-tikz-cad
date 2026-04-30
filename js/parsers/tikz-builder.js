// js/parsers/tikz-builder.js

window.TikZBuilder = class {
    constructor() {
        this.path = "";
        this.pins = [];
    }
    
    // Core coordinate transformer: 1 TikZ unit = 10 SVG units, invert Y
    pt(x, y) {
        return `${+(x * 10).toFixed(3)} ${+(-y * 10).toFixed(3)}`;
    }
    
    draw(x, y) { this.path += `M ${this.pt(x, y)} `; return this; }
    to(x, y)   { this.path += `L ${this.pt(x, y)} `; return this; }
    
    rect(x1, y1, x2, y2) {
        this.draw(x1, y1).to(x2, y1).to(x2, y2).to(x1, y2).cycle();
        return this;
    }
    
    circle(cx, cy, r) {
        let cx_svg = cx * 10;
        let cy_svg = -cy * 10;
        let r_svg = r * 10;
        // SVG requires two 180-degree arcs to draw a full circle in a single path
        this.path += `M ${+(cx_svg - r_svg).toFixed(3)} ${+cy_svg.toFixed(3)} `;
        this.path += `a ${+r_svg.toFixed(3)} ${+r_svg.toFixed(3)} 0 1 0 ${+(r_svg * 2).toFixed(3)} 0 `;
        this.path += `a ${+r_svg.toFixed(3)} ${+r_svg.toFixed(3)} 0 1 0 ${+(-r_svg * 2).toFixed(3)} 0 `;
        return this;
    }
    
    arc(cx, cy, r, startAngle, endAngle) {
        let cx_svg = cx * 10;
        let cy_svg = -cy * 10;
        let r_svg = r * 10;

        // Math to SVG coordinate conversion (Y is inverted)
        let startRad = startAngle * Math.PI / 180;
        let endRad = endAngle * Math.PI / 180;

        let startX = cx_svg + r_svg * Math.cos(startRad);
        let startY = cy_svg - r_svg * Math.sin(startRad);
        let endX = cx_svg + r_svg * Math.cos(endRad);
        let endY = cy_svg - r_svg * Math.sin(endRad);

        let largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? "0" : "1";
        let sweepFlag = endAngle > startAngle ? "0" : "1"; // Inverted Y-axis reverses sweep logic

        if (this.path === "") {
            this.path += `M ${+startX.toFixed(3)} ${+startY.toFixed(3)} `;
        } else {
            this.path += `L ${+startX.toFixed(3)} ${+startY.toFixed(3)} `;
        }
        
        this.path += `A ${+r_svg.toFixed(3)} ${+r_svg.toFixed(3)} 0 ${largeArcFlag} ${sweepFlag} ${+endX.toFixed(3)} ${+endY.toFixed(3)} `;
        return this;
    }
    
    text(x, y, str, size = 10, style = 'normal') {
        let ptStr = this.pt(x, y);
        this.path += `M ${ptStr} L ${ptStr} /*TEXT:${size},${style},${str}*/ `;
        return this;
    }

    cycle() { this.path += "Z "; return this; }

    pin(id, x, y, dir = 'R', label = undefined) {
        this.pins.push({ id: id, x: x * 10, y: -y * 10, dir: dir, label: label });
        return this;
    }

    export() {
        return { pathStr: this.path.trim(), pins: this.pins };
    }
};