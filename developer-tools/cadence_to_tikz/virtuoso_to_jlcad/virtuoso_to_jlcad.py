import json
from collections import defaultdict

INPUT_FILE = 'test_tikz.json'
OUTPUT_FILE = 'converted_virtuoso_circuit.json'

SCALE_FACTOR = 640

COMPONENT_MAP = {
    "nch_lvt": {"macro": "mostransistor", "args": ["", "$NAME$", "n", "terminals, arrow", "{ROT}", "", ""],
                "intrinsic_angle": 0, "scale": 1.0, "offset": (0, 0)},
    "pch_lvt": {"macro": "mostransistor", "args": ["", "$NAME$", "p", "terminals, dot", "{ROT}", "", ""],
                "intrinsic_angle": 0, "scale": 1.0, "offset": (0, 0)},
    "gnd": {"macro": "groundterminal", "args": ["", "$NAME$", "{ROT}", "", ""], "intrinsic_angle": 0, "scale": 1.0,
            "offset": (0, 0)},
    "vdd": {"macro": "supplyterminal", "args": ["", "$NAME$", "{ROT}", "", ""], "intrinsic_angle": 0, "scale": 1.0,
            "offset": (0, 0)},
    "res": {"macro": "resistor", "args": ["", "$NAME$", "none", "fixed", "{ROT}", "", ""], "intrinsic_angle": 90,
            "scale": 1.0, "offset": (0, 0)},
    "cap": {"macro": "capacitor", "args": ["", "$NAME$", "none", "none", "{ROT}", "", ""], "intrinsic_angle": 90,
            "scale": 1.0, "offset": (0, 0)},
    "ind": {"macro": "inductor", "args": ["", "$NAME$", "none", "fixed", "{ROT}", "", ""], "intrinsic_angle": 90,
            "scale": 1.0, "offset": (0, 0)},
    "isource": {"macro": "currentsource", "args": ["", "$NAME$", "none", "standard", "{ROT}", "", ""],
                "intrinsic_angle": 90, "scale": 1.0, "offset": (0, 0)},
    "ipin": {"macro": "ioport", "args": ["", "$NAME$", "input", "{ROT}", "", ""], "intrinsic_angle": 0, "scale": 1.0,
             "offset": (0, 0)},
    "opin": {"macro": "ioport", "args": ["", "$NAME$", "output", "{ROT}", "", ""], "intrinsic_angle": 0, "scale": 1.0,
             "offset": (0, 0)}
}


def parse_orient(orient_str, intrinsic_angle):
    angle, flipH, flipV = 0, False, False

    if orient_str == "R0":
        pass
    elif orient_str == "R90":
        angle = 90
    elif orient_str == "R180":
        angle = 180
    elif orient_str == "R270":
        angle = 270
    elif orient_str == "MX":
        flipV = True
    elif orient_str == "MY":
        flipH = True
    elif orient_str == "MXR90":
        flipV = True; angle = 90
    elif orient_str == "MYR90":
        flipH = True; angle = 90

    angle = (angle + intrinsic_angle) % 360

    flip_str = "none"
    if flipH and flipV:
        flip_str = "hv"
    elif flipH:
        flip_str = "h"
    elif flipV:
        flip_str = "v"

    return angle, flipH, flipV, f"{angle},{flip_str}"


def convert_coordinates(x, y):
    new_x = int(round(x * SCALE_FACTOR)) + 2000
    new_y = int(round(-y * SCALE_FACTOR)) + 2000
    return new_x, new_y


def process():
    with open(INPUT_FILE, 'r') as f:
        raw_data = json.load(f)

    jointjs_cells = []
    bulk_pins = set()

    for inst in raw_data.get("instances", []):
        cell_type = inst["cell"]
        if cell_type not in COMPONENT_MAP:
            continue

        mapping = COMPONENT_MAP[cell_type]
        base_x, base_y = convert_coordinates(inst["x"], inst["y"])
        angle, flipH, flipV, rot_flip_arg = parse_orient(inst["orient"], mapping.get("intrinsic_angle", 0))

        dx, dy = mapping.get("offset", (0, 0))
        final_x = base_x + dx
        final_y = base_y + dy

        custom_args = [val.replace("{ROT}", rot_flip_arg) for val in mapping["args"]]

        # --- FORMAT DISPLAY TEXT WITH PROPERTIES ---
        val = inst.get("value", "").strip()
        display_text = inst["name"]

        if val:
            if cell_type in ["ipin", "opin", "iopin"]:
                display_text = val  # e.g., "VIN" instead of "PIN0"
            #elif cell_type in ["nch_lvt", "pch_lvt"]:
                # display_text = f"{inst['name']} ({val})"  # e.g., "M0 (60n)"
            else:
                display_text = f"{inst['name']}={val}"  # e.g., "R0=1K"

        # --- THE FIX: Inject the display_text directly into the Arguments array! ---
        custom_args = [v.replace("{ROT}", rot_flip_arg).replace("$NAME$", display_text) for v in mapping["args"]]

        jl_comp = {
            "type": "jl.Component",
            "id": f"cell-{inst['name']}",
            "position": {"x": final_x, "y": final_y},
            "latexMacro": mapping["macro"],
            "customArgs": custom_args,
            "angle": angle,
            "flipH": flipH,
            "flipV": flipV,
            "displayedText": display_text,
            "customScale": mapping.get("scale", 1.0)
        }
        jointjs_cells.append(jl_comp)

        if cell_type in ["nch_lvt", "pch_lvt"]:
            bx, by = 0.25, 0.0
            if inst["orient"] == "R90":
                bx, by = 0.0, 0.25
            elif inst["orient"] == "R180":
                bx, by = -0.25, 0.0
            elif inst["orient"] == "R270":
                bx, by = 0.0, -0.25
            elif inst["orient"] == "MX":
                bx, by = 0.25, 0.0
            elif inst["orient"] == "MY":
                bx, by = -0.25, 0.0
            bulk_pins.add(convert_coordinates(inst["x"] + bx, inst["y"] + by))

    wires = raw_data.get("wires", [])
    adj = defaultdict(list)
    wire_segments = []

    for i, w in enumerate(wires):
        if len(w) != 2: continue
        p1 = convert_coordinates(*w[0])
        p2 = convert_coordinates(*w[1])
        wire_segments.append((p1, p2))
        adj[p1].append(i)
        adj[p2].append(i)

    to_remove = set()
    for bp in bulk_pins:
        if bp not in adj: continue
        queue = [bp]
        visited = set([bp])

        while queue:
            curr = queue.pop(0)
            active_segs = [i for i in adj[curr] if i not in to_remove]
            for seg_idx in active_segs:
                to_remove.add(seg_idx)
                p1, p2 = wire_segments[seg_idx]
                other = p2 if p1 == curr else p1
                if len(adj[other]) < 3 and other not in visited:
                    visited.add(other)
                    queue.append(other)

    point_counts = {}
    wire_counter = 0

    for i, (p1, p2) in enumerate(wire_segments):
        if i in to_remove: continue
        point_counts[p1] = point_counts.get(p1, 0) + 1
        point_counts[p2] = point_counts.get(p2, 0) + 1

        jointjs_cells.append({
            "type": "standard.Link",
            "id": f"wire-{wire_counter}",
            "source": {"x": p1[0], "y": p1[1]},
            "target": {"x": p2[0], "y": p2[1]},
            "attrs": {
                "line": {
                    "stroke": "#333333",
                    "strokeWidth": 1.8,
                    "targetMarker": None,  # Still using strict null to kill arrowheads
                    "vector-effect": "non-scaling-stroke"
                }
            }
        })
        wire_counter += 1

    for pt, count in point_counts.items():
        if count >= 3:
            jointjs_cells.append({
                "type": "jl.ConnectorDot",
                "id": f"dot-{pt[0]}-{pt[1]}",
                "position": {"x": pt[0] - 20, "y": pt[1] - 20},
                "latexMacro": "connectordot",
                "offsetX": -20, "offsetY": -20
            })

    output_data = {"cells": jointjs_cells}
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(output_data, f, indent=2)


if __name__ == "__main__":
    process()