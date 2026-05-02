const JL_DATABASE = {
    "mechanicalswitch": {
        "name": "mechanicalswitch",
        "displayName": "Mechanical Switch",
        "argsCount": 7,
        "enabled": "true",
        "category": "Switches",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "previewArgs": {
            "3": "open"
        },
        "argDefs": [
            {
                "idx": 3,
                "type": "select",
                "label": "closed/open",
                "defVal": "open",
                "options": "closed, open"
            },
            {
                "idx": 4,
                "type": "text",
                "label": "state tag",
                "defVal": ""
            },
            {
                "idx": 5,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            }
        ],
        "spiceTemplate": "R_{NAME} {pin1} {pin2} {RESISTANCE}",
        "propDefs": [
            {
                "type": "SPICE",
                "id": "RON",
                "label": "Closed Resistance (\u03a9)",
                "defVal": "1m"
            },
            {
                "type": "SPICE",
                "id": "ROFF",
                "label": "Open Resistance (\u03a9)",
                "defVal": "100Meg"
            }
        ],
        "iconBase": "M 30 0 L 40 0 M 30 0 A 1 1 0 1 0 28 -1 A 1 1 0 1 0 30 0 Z M 0 0 L 10.5 0",
        "iconBaseStyle": "fill=solid",
        "filled": true,
        "iconLayers": [
            {
                "condition": "3==closed",
                "style": "fill=solid",
                "path": "M 10 0 L 27 -2 M 28 -1 A 1 1 0 1 0 27 -3 A 1 1 0 1 0 28 -1 Z"
            },
            {
                "condition": "3==open",
                "style": "fill=solid",
                "path": "M 10 0 L 28 -11 M 29 -11 A 1 1 0 1 0 27 -11 A 1 1 0 1 0 29 -11 Z"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "closed/open",
                "optional": false
            },
            {
                "name": "state",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 40.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "$4",
                "x": 19.5,
                "y": -5.5,
                "label": "",
                "dir": "T",
                "condition": "3==closed"
            },
            {
                "id": "$4",
                "x": 17.0,
                "y": -11.0,
                "label": "",
                "dir": "T",
                "condition": "3==open"
            }
        ]
    },
    "mechanicalswitchthreeport": {
        "name": "mechanicalswitchthreeport",
        "displayName": "Three-Port Mechanical Switch",
        "argsCount": 6,
        "enabled": "true",
        "category": "Switches",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "previewArgs": {
            "3": "state1"
        },
        "spiceTemplate": "R_{NAME}_1 {pin3} {pin1} {RES1}\\nR_{NAME}_2 {pin3} {pin2} {RES2}",
        "propDefs": [
            {
                "type": "SPICE",
                "id": "RON",
                "label": "Closed Resistance (\u03a9)",
                "defVal": "1m"
            },
            {
                "type": "SPICE",
                "id": "ROFF",
                "label": "Open Resistance (\u03a9)",
                "defVal": "100Meg"
            }
        ],
        "argDefs": [
            {
                "idx": 3,
                "type": "select",
                "label": "state1/state2",
                "defVal": "state1",
                "options": "state1, state2"
            },
            {
                "idx": 4,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            }
        ],
        "iconBase": "M 0 0 L 10 0 M 0 -20 L 10 -20 M 30 -10 L 40 -10 M 11 0 A 1 1 0 1 0 9 0 A 1 1 0 1 0 11 0 Z M 11 -20 A 1 1 0 1 0 9 -20 A 1 1 0 1 0 11 -20 Z M 30 -10 m -0.5 0 a 0.5 0.5 0 1 0 1 0 a 0.5 0.5 0 1 0 -1 0",
        "iconBaseStyle": "fill=solid",
        "filled": true,
        "iconLayers": [
            {
                "condition": "3==state1",
                "style": "",
                "path": "M 9 -2 L 30 -10 M 11 -2 A 1 1 0 1 0 9 -2 A 1 1 0 1 0 11 -2 Z"
            },
            {
                "condition": "3==state2",
                "style": "",
                "path": "M 9 -18 L 30 -10 M 11 -18 A 1 1 0 1 0 9 -18 A 1 1 0 1 0 11 -18 Z"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "state1/state2",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -20.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "pin3",
                "x": 40.0,
                "y": -10.0,
                "label": "",
                "dir": "R"
            }
        ]
    },
    "controlledswitch": {
        "name": "controlledswitch",
        "displayName": "Controlled Switch",
        "argsCount": 7,
        "enabled": "true",
        "category": "Switches",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "previewArgs": {
            "3": "open"
        },
        "spiceTemplate": "R_{NAME} {pin1} {pin2} {RESISTANCE}",
        "propDefs": [
            {
                "type": "SPICE",
                "id": "RON",
                "label": "Closed Resistance (\u03a9)",
                "defVal": "1m"
            },
            {
                "type": "SPICE",
                "id": "ROFF",
                "label": "Open Resistance (\u03a9)",
                "defVal": "100Meg"
            }
        ],
        "argDefs": [
            {
                "idx": 3,
                "type": "select",
                "label": "closed/open",
                "defVal": "open",
                "options": "closed, open"
            },
            {
                "idx": 4,
                "type": "text",
                "label": "control_terminal",
                "defVal": ""
            },
            {
                "idx": 5,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            }
        ],
        "iconBase": "M 0 0 L 10 0 M 30 0 L 40 0 M 30 0 A 1 1 0 1 0 28 -1 A 1 1 0 1 0 30 0 Z M 20 -13 L 20 -15 M 19 -15 L 21 -15 M 15 -15 L 25 -15 M 10 0 m -0.5 0 a 0.5 0.5 0 1 0 1 0 a 0.5 0.5 0 1 0 -1 0",
        "iconBaseStyle": "fill=solid",
        "filled": true,
        "iconLayers": [
            {
                "condition": "3==closed",
                "style": "fill=solid",
                "path": "M 10 0 L 27 -2 M 28 -1 A 1 1 0 1 0 27 -3 A 1 1 0 1 0 28 -1 Z M 20 -1 L 20 -2 M 20 -3 L 20 -4 M 20 -5 L 20 -6 M 20 -7 L 20 -8 M 20 -9 L 20 -10 M 20 -11 L 20 -12"
            },
            {
                "condition": "3==open",
                "style": "fill=solid",
                "path": "M 10 0 L 28 -11 M 29 -11 A 1 1 0 1 0 27 -11 A 1 1 0 1 0 29 -11 Z M 20 -6 L 20 -7 M 20 -8 L 20 -9 M 20 -10 L 20 -11 M 20 -12 L 20 -13 M 20 -14 L 20 -15"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "closed/open",
                "optional": false
            },
            {
                "name": "control_terminal",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 40.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "$4",
                "x": 20.0,
                "y": -17.5,
                "label": "",
                "dir": "T"
            }
        ]
    },
    "controlledswitchbox": {
        "name": "controlledswitchbox",
        "displayName": "Controlled Switch - Box",
        "argsCount": 7,
        "enabled": "true",
        "category": "Switches",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "x": 24.0,
            "y": 5.0,
            "dir": "B"
        },
        "flippable": false,
        "previewArgs": {
            "4": "n",
            "5": "0"
        },
        "argDefs": [
            {
                "idx": 3,
                "type": "text",
                "label": "control value",
                "defVal": ""
            },
            {
                "idx": 4,
                "type": "select",
                "label": "type",
                "defVal": "n",
                "options": "n, p"
            },
            {
                "idx": 5,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            }
        ],
        "iconBase": "M 0 0 L 10 0 M 30 0 L 40 0 M 10 0 L 28 -11 M 10 0 m -0.5 0 a 0.5 0.5 0 1 0 1 0 a 0.5 0.5 0 1 0 -1 0",
        "iconBaseStyle": "fill=solid",
        "filled": true,
        "iconLayers": [
            {
                "condition": "1~=",
                "style": "",
                "path": "M 9 -13 L 32 -13 L 32 4 L 9 4 Z"
            },
            {
                "condition": "1~=",
                "style": "stroke-width=2.8",
                "path": "M 16 -23 L 24 -23"
            },
            {
                "condition": "1~=",
                "style": "fill=solid",
                "path": "M 30 0 A 1 1 0 1 0 28 -1 A 1 1 0 1 0 30 0 Z M 29 -11 A 1 1 0 1 0 27 -11 A 1 1 0 1 0 29 -11 Z"
            },
            {
                "condition": "4==n",
                "style": "stroke-width=1.6",
                "path": "M 20 -22.5 L 20 -12.5"
            },
            {
                "condition": "4==p",
                "style": "stroke-width=1.6",
                "path": "M 20 -22 L 20 -18.5"
            },
            {
                "condition": "4==p",
                "style": "stroke-width=0.7",
                "path": "M 20 -16 m -2.5 0 a 2.5 2.5 0 1 0 5 0 a 2.5 2.5 0 1 0 -5 0"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "control value",
                "optional": false
            },
            {
                "name": "n/p",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 40.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "$3",
                "x": 20.0,
                "y": -25.0,
                "label": "",
                "dir": "T"
            }
        ]
    },
    "groundterminal": {
        "name": "groundterminal",
        "displayName": "Ground Terminal",
        "argsCount": 5,
        "enabled": "true",
        "category": "Terminals",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "x": 0.0,
            "y": 35.0,
            "dir": "B"
        },
        "flippable": false,
        "argDefs": [
            {
                "idx": 3,
                "type": "rotflip",
                "label": "Rotation & Flip",
                "defVal": "0,none"
            }
        ],
        "iconBase": "M 0 0 L 0 15",
        "filled": false,
        "iconLayers": [
            {
                "condition": "1~=",
                "style": "stroke-width=4.5",
                "path": "M -15 15 L 15 15"
            },
            {
                "condition": "1~=",
                "style": "stroke-width=3.5",
                "path": "M -10 22 L 10 22"
            },
            {
                "condition": "1~=",
                "style": "stroke-width=3.0",
                "path": "M -5 29 L 5 29"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "rotation,flip(h, v, hv, or none)",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            }
        ]
    },
    "voltagesource": {
        "name": "voltagesource",
        "displayName": "Voltage Source (Independent/Controlled)",
        "argsCount": 7,
        "enabled": "true",
        "category": "Sources",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "spiceTemplate": "V_{NAME} {pin1} {pin2} {SIGNAL}",
        "previewArgs": {
            "3": "none",
            "4": "standard",
            "5": "0"
        },
        "argDefs": [
            {
                "idx": 3,
                "type": "select",
                "label": "horizontal/vertical",
                "defVal": "none",
                "options": "horizontal, vertical, none"
            },
            {
                "idx": 4,
                "type": "select",
                "label": "type",
                "defVal": "standard",
                "options": "standard, controlled"
            },
            {
                "idx": 5,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            }
        ],
        "iconBase": "M -30 0 L -20 0 M 20 0 L 30 0 M -12 0 L -4 0 M -8 -4 L -8 4 M 4 0 L 12 0",
        "filled": false,
        "iconLayers": [
            {
                "condition": "4==standard",
                "style": "stroke-width=2.5",
                "path": "M 0 0 m -20 0 a 20 20 0 1 0 40 0 a 20 20 0 1 0 -40 0"
            },
            {
                "condition": "4==controlled",
                "style": "stroke-width=2.5",
                "path": "M -20 0 L 0 -20 L 20 0 L 0 20 L -20 0"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "horizontal/vertical",
                "optional": false
            },
            {
                "name": "standard/controlled",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": -30.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 30.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            }
        ]
    },
    "currentsource": {
        "name": "currentsource",
        "displayName": "Current Source (Independent/Controlled)",
        "argsCount": 7,
        "enabled": "true",
        "category": "Sources",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "x": 0.0,
            "y": 24.0,
            "dir": "B"
        },
        "flippable": false,
        "spiceTemplate": "I_{NAME} {pin1} {pin2} {SIGNAL}",
        "previewArgs": {
            "3": "horizontal",
            "4": "standard",
            "5": "0"
        },
        "argDefs": [
            {
                "idx": 3,
                "type": "select",
                "label": "horizontal/vertical",
                "defVal": "horizontal",
                "options": "horizontal, vertical"
            },
            {
                "idx": 4,
                "type": "select",
                "label": "standard/controlled",
                "defVal": "standard",
                "options": "standard, controlled"
            },
            {
                "idx": 5,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            }
        ],
        "iconBase": "M -30 0 L -20 0 M 20 0 L 30 0 M -10 0 L 10 0 M 10 0 L 3 -5 L 10 0 L 3 5",
        "filled": false,
        "iconLayers": [
            {
                "condition": "4==standard",
                "style": "stroke-width=2.5",
                "path": "M 0 0 m -20 0 a 20 20 0 1 0 40 0 a 20 20 0 1 0 -40 0"
            },
            {
                "condition": "4==controlled",
                "style": "stroke-width=2.5",
                "path": "M -20 0 L 0 -20 L 20 0 L 0 20 L -20 0"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "horizontal, vertical",
                "optional": false
            },
            {
                "name": "standard/controlled",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": -30.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 30.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            }
        ]
    },
    "lamp": {
        "name": "lamp",
        "displayName": "Lamp",
        "argsCount": 6,
        "enabled": "true",
        "category": "Indicators",
        "scales": [
            0.5,
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "spiceTemplate": "R_{NAME} {pin1} {pin2} {VALUE}",
        "previewArgs": {
            "3": "0",
            "4": "on"
        },
        "argDefs": [
            {
                "idx": 3,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            },
            {
                "idx": 4,
                "type": "select",
                "label": "on/off",
                "defVal": "on",
                "options": "on, off"
            }
        ],
        "iconBase": "M -15 -5 a 15 15 0 1 0 30 6 a 15 15 0 1 0 -30 -6 M -20 20 L -20 9 L -12 9 L -7 -6 L -10 -6 L -6 5 L -8 5 L -2 -6 L -4 -6 L 0 5 L -2 5 L 4 -6 L 2 -6 L 6 5 L 4 5 L 9 -6 L 7 -6 L 12 9 M 20 20 L 20 8 L 11.5 8 L 20.5 8",
        "filled": false,
        "iconLayers": [
            {
                "condition": "4==on",
                "style": "stroke-width=2.5",
                "path": "M 17 0 L 22 0 M -17 0 L -22 0 M 15 -13 L 20 -19 M 0 -20 L 0 -24 M -14.5 -13 L -19.5 -19"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "on/off",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": -20.0,
                "y": 20.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 20.0,
                "y": 20.0,
                "label": "",
                "dir": "R"
            }
        ]
    },
    "functiongenerator": {
        "name": "functiongenerator",
        "displayName": "Function Generator",
        "argsCount": 7,
        "enabled": "true",
        "category": "Sources",
        "scales": [
            0.5,
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "previewArgs": {
            "3": "horizontal",
            "4": "sine",
            "5": "0"
        },
        "spiceTemplate": "V_{NAME} {pin1} {pin2} {SIGNAL}",
        "argDefs": [
            {
                "idx": 3,
                "type": "select",
                "label": "horizontal/vertical",
                "defVal": "horizontal",
                "options": "horizontal, vertical"
            },
            {
                "idx": 4,
                "type": "select",
                "label": "waveform",
                "defVal": "sine",
                "options": "sine, square, triangle"
            },
            {
                "idx": 5,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            }
        ],
        "iconBase": "M 0 0 m -20 0 a 20 20 0 1 0 40 0 a 20 20 0 1 0 -40 0 M -30 0 L -20 0 M 20 0 L 30 0",
        "filled": false,
        "iconLayers": [
            {
                "condition": "4==sine",
                "style": "stroke-width=2.5",
                "path": "M -15 0 Q -7.5 -20 0 0 Q 7.5 20 15 0"
            },
            {
                "condition": "4==square",
                "style": "stroke-width=2.5",
                "path": "M -15 0 L -12 0 L -12 -11 L -4 -11 L -4 11 L 4 11 L 4 -11 L 12 -11 L 12 0 L 15 0"
            },
            {
                "condition": "4==triangle",
                "style": "stroke-width=2.5",
                "path": "M -14 7 L -8 -11 L 0 11 L 8 -11 L 15 7"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "horizontal, vertical",
                "optional": false
            },
            {
                "name": "sine/square/triangle",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": -30.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 30.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            }
        ]
    },
    "clocksource": {
        "name": "clocksource",
        "displayName": "Clock Source",
        "argsCount": 7,
        "enabled": "true",
        "category": "Sources",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "previewArgs": {
            "3": "4",
            "4": "0"
        },
        "spiceTemplate": "V_{NAME} {pin1} 0 PULSE({V_LOW} {V_HIGH} {DELAY} {TRISE} {TFALL} {WIDTH} {PERIOD})",
        "propDefs": [
            {
                "type": "SIM",
                "id": "FREQ",
                "label": "Frequency (Hz)",
                "defVal": "1Meg"
            },
            {
                "type": "SIM",
                "id": "INIT",
                "label": "Initial State (0/1)",
                "defVal": "0"
            }
        ],
        "iconBase": "M 0 0 m -20 0 a 20 20 0 1 0 40 0 a 20 20 0 1 0 -40 0 M 20 0 L 30 0 M -10 -5 L -5 -5 L -5 5 L 5 5 L 5 -5 L 10 -5",
        "filled": false,
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "period",
                "optional": false
            },
            {
                "name": "initial state",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 30.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            }
        ]
    },
    "multimeter": {
        "name": "multimeter",
        "displayName": "Multimeter",
        "argsCount": 7,
        "enabled": "true",
        "category": "Basic Components",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "previewArgs": {
            "3": "horizontal",
            "4": "25",
            "5": "0"
        },
        "argDefs": [
            {
                "idx": 3,
                "type": "select",
                "label": "horizontal/vertical",
                "defVal": "horizontal",
                "options": "horizontal, vertical"
            },
            {
                "idx": 5,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            },
            {
                "idx": 4,
                "type": "select",
                "label": "value",
                "defVal": "25",
                "options": "0, 25, 50, 75, 100"
            }
        ],
        "iconBase": "M 0 0 m -20 0 a 20 20 0 1 0 40 0 a 20 20 0 1 0 -40 0 M -30 0 L -20 0 M 20 0 L 30 0",
        "filled": false,
        "iconLayers": [
            {
                "condition": "1~=",
                "style": "stroke-width=2.5",
                "path": "M -16 -3 A 17 17 0 0 1 16 -3"
            },
            {
                "condition": "4==50",
                "style": "stroke-width=2.5, rounded=true",
                "path": "M 0 10 L 0 -10"
            },
            {
                "condition": "4==0",
                "style": "stroke-width=2.5, rounded=true",
                "path": "M -12.5 -2.5 L 0 9.5"
            },
            {
                "condition": "4==100",
                "style": "stroke-width=2.5, rounded=true",
                "path": "M 12.5 -1.5 L 0.5 9.5"
            },
            {
                "condition": "4==25",
                "style": "stroke-width=2.5, rounded=true",
                "path": "M -7.5 -8 L 0 9.5"
            },
            {
                "condition": "4==75",
                "style": "stroke-width=2.1, rounded=true",
                "path": "M 7 -7 L 0 9.5"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "horizontal/vertical",
                "optional": false
            },
            {
                "name": "value (0 to 100)",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": -30.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 30.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            }
        ]
    },
    "resistor": {
        "name": "resistor",
        "displayName": "Resistor",
        "argsCount": 7,
        "enabled": "true",
        "category": "Passives",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "x": 40.0,
            "y": 7.0,
            "dir": "B"
        },
        "flippable": false,
        "spiceTemplate": "R_{NAME} {pin1} {pin2} {VALUE}",
        "previewArgs": {
            "4": "fixed"
        },
        "argDefs": [
            {
                "idx": 3,
                "type": "select",
                "label": "horizontal/vertical",
                "defVal": "horizontal",
                "options": "horizontal, vertical, none"
            },
            {
                "idx": 4,
                "type": "select",
                "label": "fixed/variable",
                "defVal": "fixed",
                "options": "fixed,variable"
            },
            {
                "idx": 5,
                "type": "rotflip",
                "label": "Rotation & Flip",
                "defVal": "0,none"
            }
        ],
        "iconBase": "M 10 0 L 15 -10 M 15 -10 L 25 10 M 25 10 L 35 -10 M 35 -10 L 45 10 M 45 10 L 55 -10 M 55 -10 L 65 10 M 65 10 L 70 0",
        "iconBaseStyle": "stroke-width=2.8, rounded=true",
        "filled": false,
        "iconLayers": [
            {
                "condition": "4==variable",
                "style": "stroke-width=2.3, rounded=true",
                "path": "M 48.33 -21.32 L 42.41 -17.44 L 48.33 -21.32 L 49.47 -14.13 M 28.5 16.5 L 47.5 -19.5"
            },
            {
                "condition": "1~=",
                "style": "rounded=true",
                "path": "M 0 0 L 8.50 0 M 80 0 L 70 0 M 0 0 L 10 -0.20 M 80 0 L 70 0.4 M 80 0 L 70 -0.4 M 80 0 L 70 0.4 M 0 0 L 10 0.40"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "horizontal/vertical/empty",
                "optional": false
            },
            {
                "name": "fixed/variable",
                "optional": false
            },
            {
                "name": "rotation,flip(h, v, hv, or none)",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 80.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            }
        ]
    },
    "inductor": {
        "name": "inductor",
        "displayName": "Inductor",
        "argsCount": 7,
        "enabled": "true",
        "category": "Passives",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "x": 40.0,
            "y": 0.0,
            "dir": "B"
        },
        "flippable": false,
        "spiceTemplate": "L_{NAME} {pin1} {pin2} {VALUE}",
        "previewArgs": {
            "4": "fixed"
        },
        "argDefs": [
            {
                "idx": 3,
                "type": "select",
                "label": "horizontal/vertical",
                "defVal": "horizontal",
                "options": "horizontal, vertical, none"
            },
            {
                "idx": 4,
                "type": "select",
                "label": "fixed/variable",
                "defVal": "fixed",
                "options": "fixed, variable"
            },
            {
                "idx": 5,
                "type": "rotflip",
                "label": "Rotation & Flip",
                "defVal": "0,none"
            }
        ],
        "iconBase": "M 0 0 L 10 0 A 7.5 7.5 0 0 1 25 0 A 7.5 7.5 0 0 1 40 0 A 7.5 7.5 0 0 1 55 0 A 7.5 7.5 0 0 1 70 0 L 80 0",
        "iconBaseStyle": "stroke-width=2.7",
        "filled": false,
        "iconLayers": [
            {
                "condition": "4==variable",
                "style": "stroke-width=2.3, rounded=true",
                "path": "M 25 10 L 53 -19 M 53 -19 L 46 -18 L 53 -19 L 51 -12"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "horizontal/vertical/empty",
                "optional": false
            },
            {
                "name": "fixed/variable",
                "optional": false
            },
            {
                "name": "rotation,flip(h, v, hv, or none)",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 80.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            }
        ]
    },
    "capacitor": {
        "name": "capacitor",
        "displayName": "Capacitor",
        "argsCount": 7,
        "enabled": "true",
        "category": "Passives",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "spiceTemplate": "C_{NAME} {pin1} {pin2} {VALUE}",
        "previewArgs": {
            "3": "fixed",
            "4": "none"
        },
        "argDefs": [
            {
                "idx": 3,
                "type": "select",
                "label": "horizontal/vertical",
                "defVal": "horizontal",
                "options": "horizontal, vertical, none"
            },
            {
                "idx": 3,
                "type": "select",
                "label": "fixed/variable",
                "defVal": "fixed",
                "options": "fixed, variable"
            },
            {
                "idx": 4,
                "type": "select",
                "label": "sign",
                "defVal": "none",
                "options": "plus, minus, none"
            },
            {
                "idx": 5,
                "type": "rotflip",
                "label": "Rotation & Flip",
                "defVal": "0,none"
            }
        ],
        "iconBase": "M 0 0 L 16 0 M 24 0 L 40 0",
        "filled": false,
        "iconLayers": [
            {
                "condition": "3~=variable",
                "style": "stroke-width=1.3, rounded=true",
                "path": "M 27.770000000000003 -15.34 L 34.84 -15.34 L 34.84 -8.27 L 34.84 -15.34 M 35 -15 L 8 8.5"
            },
            {
                "condition": "4==plus",
                "style": "stroke-width=0.9",
                "path": "M 12 -12 L 12 -8 M 10 -10 L 14 -10"
            },
            {
                "condition": "4==minus",
                "style": "stroke-width=0.9",
                "path": "M 10 -10 L 14 -10"
            },
            {
                "condition": "1~=",
                "style": "stroke-width=2.9",
                "path": "M 16 -15 L 16 15 M 24 -15 L 24 15"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "horizontal/vertical/empty-fixed/variable",
                "optional": false
            },
            {
                "name": "plus/minus/none",
                "optional": false
            },
            {
                "name": "rotation,flip(h, v, hv, or none)",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 40.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            }
        ]
    },
    "dcvoltagesource": {
        "name": "dcvoltagesource",
        "displayName": "DC Voltage Source",
        "argsCount": 7,
        "enabled": "true",
        "category": "Sources",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "x": 20.0,
            "y": 11.0,
            "dir": "B"
        },
        "flippable": false,
        "spiceTemplate": "V_{NAME} {pin2} {pin1} {VOLTAGE}",
        "previewArgs": {
            "3": "horizontal",
            "4": "none",
            "5": "0,none"
        },
        "argDefs": [
            {
                "idx": 3,
                "type": "select",
                "label": "horizontal/vertical",
                "defVal": "horizontal",
                "options": "horizontal, vertical, none"
            },
            {
                "idx": 3,
                "type": "select",
                "label": "fixed/variable",
                "defVal": "fixed",
                "options": "fixed, variable"
            },
            {
                "idx": 4,
                "type": "select",
                "label": "plus sign",
                "defVal": "plus",
                "options": "plus, none"
            },
            {
                "idx": 5,
                "type": "rotflip",
                "label": "Rotation & Flip",
                "defVal": "0,none"
            }
        ],
        "iconBase": "M 0 0 L 16 0 M 24 -15 L 24 15 M 24 0 L 40 0",
        "filled": false,
        "iconLayers": [
            {
                "condition": "3~=variable",
                "style": "rounded=true",
                "path": "M 8.5 13 L 28.5 -11 M 30 -12 L 24 -11 L 30 -12 L 28 -6"
            },
            {
                "condition": "4==plus",
                "style": "stroke-width=1.1, rounded=true",
                "path": "M 28 -12 L 28 -8 M 26 -10 L 30 -10"
            },
            {
                "condition": "1~=",
                "style": "stroke-width=2.8",
                "path": "M 16 -7 L 16 7"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "horizontal/vertical/empty-fixed/variable",
                "optional": false
            },
            {
                "name": "plus/none",
                "optional": false
            },
            {
                "name": "rotation,flip(h, v, hv, or none)",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 40.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            }
        ]
    },
    "dcbattery": {
        "name": "dcbattery",
        "displayName": "DC battery",
        "argsCount": 7,
        "enabled": "true",
        "category": "Sources",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "spiceTemplate": "V_{NAME} {pin2} {pin1} {VOLTAGE}",
        "argDefs": [
            {
                "idx": 3,
                "type": "select",
                "label": "horizontal/vertical/none",
                "defVal": "horizontal",
                "options": "horizontal, vertical, none"
            },
            {
                "idx": 3,
                "type": "select",
                "label": "fixed/variable",
                "defVal": "fixed",
                "options": "fixed, variable"
            },
            {
                "idx": 4,
                "type": "select",
                "label": "plus sign",
                "defVal": "none",
                "options": "plus, none"
            },
            {
                "idx": 5,
                "type": "rotflip",
                "label": "Rotation & Flip",
                "defVal": "0,none"
            }
        ],
        "iconBase": "M -30 0 L -10 0 M 0 -15 L 0 15 M -10 -7 L -10 7 M 0 0 L 10 0 M 20 -15 L 20 15 M 10 -7 L 10 7 M 20 0 L 40 0",
        "filled": false,
        "iconLayers": [
            {
                "condition": "3~=variable",
                "style": "stroke-width=1.6, rounded=true",
                "path": "M -10 -17 L -4 -16 L -10 -17 L -8 -11 M -9.5 -16.5 L 27 14"
            },
            {
                "condition": "4==plus",
                "style": "stroke-width=0.8",
                "path": "M 26 -12 L 26 -8 M 24 -10 L 28 -10"
            },
            {
                "condition": "1~=",
                "style": "stroke-width=3.2, rounded=true",
                "path": "M -10 -7 L -10 7 M 10 -7 L 10 7"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "horizontal/vertical/empty-fixed/variable",
                "optional": false
            },
            {
                "name": "plus/none",
                "optional": false
            },
            {
                "name": "rotation,flip(h, v, hv, or none)",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": -30.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 40.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            }
        ]
    },
    "bipolartransistor": {
        "name": "bipolartransistor",
        "displayName": "Bipolar Transistor",
        "argsCount": 7,
        "enabled": "true",
        "category": "Active Components",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "x": 10.0,
            "y": 33.0,
            "dir": "L"
        },
        "flippable": false,
        "spiceTemplate": "Q_{NAME} {pin2} {pin1} {pin3} {MODEL}",
        "previewArgs": {
            "3": "n",
            "4": "case"
        },
        "argDefs": [
            {
                "idx": 3,
                "type": "select",
                "label": "n/p",
                "defVal": "n",
                "options": "n, p"
            },
            {
                "idx": 4,
                "type": "flags",
                "label": "terminals/case",
                "defVal": "case",
                "options": "terminals, case"
            },
            {
                "idx": 5,
                "type": "rotflip",
                "label": "Rotation & Flip",
                "defVal": "0,none"
            }
        ],
        "iconBase": "M -40 0 L -10 0 M -10 -5 L 10 -25 L 10 -40 M -10 5 L 10 25 L 10 40 M -10 -5 L 10 -25 L 10 -40 M -10 5 L 10 25 L 10 40",
        "filled": false,
        "iconLayers": [
            {
                "condition": "1~=",
                "style": "stroke-width=3.5, rounded=true",
                "path": "M -10 -15 L -10 15"
            },
            {
                "condition": "3==n",
                "style": "rounded=true",
                "path": "M 1.5 21.5 L 8.5 23 L 7 17 L 8 23"
            },
            {
                "condition": "3==p",
                "style": "rounded=true",
                "path": "M -1 8 L -8 6.5 L -6.5 12.5 L -7.5 6.5"
            },
            {
                "condition": "4~=case",
                "style": "",
                "path": "M 0 0 m -25 0 a 25 25 0 1 0 50 0 a 25 25 0 1 0 -50 0"
            },
            {
                "condition": "4~=terminals",
                "style": "",
                "path": "M 18 -30.50 L 18 -30.50 9 NaN mal,C*/ M 30 25 L 30 25 21 NaN mal,E*/ M -31 5.50 L -31 5.50 /*TEXT:9,normal,B*/ M 15 -30 L 15 -30 /*TEXT:9,normal,C*/ M 15 27.50 L 15 27.50 /*TEXT:9,normal,E*/"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "n/p",
                "optional": false
            },
            {
                "name": "terminals-case",
                "optional": false
            },
            {
                "name": "rotation,flip(h, v, hv, or none)",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": -40.0,
                "y": -0.0,
                "label": "base",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 10.0,
                "y": -40.0,
                "label": "collector",
                "dir": "R"
            },
            {
                "id": "pin3",
                "x": 10.0,
                "y": 40.0,
                "label": "emitter",
                "dir": "R"
            }
        ]
    },
    "mostransistor": {
        "name": "mostransistor",
        "displayName": "MOS Transistor",
        "argsCount": 7,
        "enabled": "true",
        "category": "Active Components",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "x": -10.0,
            "y": -25.0,
            "dir": "L"
        },
        "flippable": true,
        "spiceTemplate": "M_{NAME} {D} {G} {S} 0 {MODEL} W={W} L={L}",
        "previewArgs": {
            "3": "n",
            "4": "case, arrow"
        },
        "argDefs": [
            {
                "idx": 3,
                "type": "select",
                "label": "n/p",
                "defVal": "n",
                "options": "n,p"
            },
            {
                "idx": 4,
                "type": "flags",
                "label": "terminal names / case",
                "defVal": "",
                "options": "terminals, case"
            },
            {
                "idx": 4,
                "type": "select",
                "label": "dot/arrow notation",
                "defVal": "arrow",
                "options": "dot, arrow"
            },
            {
                "idx": 5,
                "type": "rotflip",
                "label": "Rotation & Flip",
                "defVal": "0,none"
            }
        ],
        "iconBase": "M -2 -20 L -2 20 M -2 0 M -2 -15 L 10 -15 L 10 -40 M -2 15 L 10 15 L 10 40 M -40 0 L -18 0",
        "filled": false,
        "iconLayers": [
            {
                "condition": "1~=",
                "style": "stroke-width=3.3",
                "path": "M -10 -15 L -10 15"
            },
            {
                "condition": "3==n",
                "style": "",
                "path": "M -10 0 L -40 0"
            },
            {
                "condition": "3==n && 4~=arrow",
                "style": "rounded=true",
                "path": "M 10 15 L 6 12 L 10 15 L 6 18"
            },
            {
                "condition": "3==p && 4~=arrow",
                "style": "rounded=true",
                "path": "M -2 15 L 2 12 L -2 15 L 2 18"
            },
            {
                "condition": "3==p && 4~=dot",
                "style": "",
                "path": "M -15 0 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0"
            },
            {
                "condition": "3==p && 4~=arrow",
                "style": "",
                "path": "M -20 0 L -10 0"
            },
            {
                "condition": "4~=case",
                "style": "",
                "path": "M 0 0 m -25 0 a 25 25 0 1 0 50 0 a 25 25 0 1 0 -50 0"
            },
            {
                "condition": "4~=terminals",
                "style": "",
                "path": "M -31 6 L -31 6 /*TEXT:10,normal,G*/ M 15 -30 L 15 -30 /*TEXT:10,normal,D*/ M 15.50 27 L 15.50 27 /*TEXT:10,normal,S*/"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "n/p",
                "optional": false
            },
            {
                "name": "terminals, case, dot, arrow",
                "optional": false
            },
            {
                "name": "rotation,flip(h, v, hv, or none)",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "G",
                "x": -40.0,
                "y": -0.0,
                "label": "gate",
                "dir": "R"
            },
            {
                "id": "D",
                "x": 10.0,
                "y": -40.0,
                "label": "drain",
                "dir": "R"
            },
            {
                "id": "S",
                "x": 10.0,
                "y": 40.0,
                "label": "source",
                "dir": "R"
            }
        ]
    },
    "passgate": {
        "name": "passgate",
        "displayName": "Transmission Gate",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "x": -21.0,
            "y": -17.0,
            "dir": "L"
        },
        "flippable": false,
        "previewArgs": {
            "3": "normal"
        },
        "argDefs": [
            {
                "idx": 3,
                "type": "select",
                "label": "symbol",
                "defVal": "normal",
                "options": "plain, normal, diamond"
            },
            {
                "idx": 4,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            }
        ],
        "iconBase": "M -40 0 L -20 0 M 20 0 L 40 0",
        "iconBaseStyle": "rounded=true",
        "filled": false,
        "iconLayers": [
            {
                "condition": "3==diamond",
                "style": "rounded=true",
                "path": "M 0 -16 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0 M -20 0 L -20 -20 L 20 0 L 20 -20 L -20 0 M -20 0 L -20 20 M -20 20 L 20 0 M 20 0 L 20 20 M 20 20 L -20 0 M 0 -50 L 0 -20 M 0 10 L 0 50"
            },
            {
                "condition": "3==normal",
                "style": "rounded=true",
                "path": "M 0 -34 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0 M 0 -50 L 0 -38 M 0 30 L 0 50"
            },
            {
                "condition": "3==normal",
                "style": "rounded=true",
                "path": "M -20 -20 L 20 -20 L 20 20 L -20 20 Z M -20 -30 L 20 -30 M -20 30 L 20 30"
            },
            {
                "condition": "3==plain",
                "style": "rounded=true",
                "path": "M -20 -20 L 20 -20 L 20 20 L -20 20 Z M -20 -30 L 20 -30 M -20 30 L 20 30"
            },
            {
                "condition": "3==plain",
                "style": "rounded=true",
                "path": "M 0 30 L 0 50 M 0 -30 L 0 -50"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "symbol(plain, normal or diamond)",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": -40.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 40.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "pin3",
                "x": 0.0,
                "y": -50.0,
                "label": "ctrln",
                "dir": "R"
            },
            {
                "id": "pin4",
                "x": 0.0,
                "y": 50.0,
                "label": "ctrl",
                "dir": "R"
            }
        ]
    },
    "opamplifier": {
        "name": "opamplifier",
        "displayName": "OPAMP",
        "argsCount": 7,
        "enabled": "true",
        "category": "Active Components",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "x": 68.0,
            "y": 24.0,
            "dir": "R"
        },
        "flippable": false,
        "spiceTemplate": "X_{NAME} {pin1} {pin2} {pin3} {MODEL}",
        "argDefs": [
            {
                "idx": 3,
                "type": "flags",
                "label": "flip",
                "defVal": "",
                "options": "flip"
            },
            {
                "idx": 4,
                "type": "text",
                "label": "supplyvoltage",
                "defVal": ""
            },
            {
                "idx": 5,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            }
        ],
        "iconBase": "M 0 -20 L 20 -20 M 0 20 L 20 20 M 100 0 L 120 0 M 20 -40 L 20 40 L 100 0 Z M 25 -20 L 35 -20 M 25 20 L 35 20",
        "filled": false,
        "iconLayers": [
            {
                "condition": "4!=",
                "style": "",
                "path": "M 60 -20 L 60 -40 M 50 -40 L 70 -40 M 60 20 L 60 40 M 50 40 L 70 40"
            },
            {
                "condition": "3!=flip",
                "style": "",
                "path": "M 30 -25 L 30 -15"
            },
            {
                "condition": "3~=flip",
                "style": "",
                "path": "M 30 15 L 30 25"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "flip",
                "optional": false
            },
            {
                "name": "supplyvoltage",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -20.0,
                "label": "input-1",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": 20.0,
                "label": "input-2",
                "dir": "R"
            },
            {
                "id": "pin3",
                "x": 120.0,
                "y": -0.0,
                "label": "output",
                "dir": "R"
            },
            {
                "id": "$4",
                "x": 60.0,
                "y": -50.0,
                "label": "$4",
                "dir": "T",
                "condition": "4!="
            },
            {
                "id": "-$4",
                "x": 60.0,
                "y": 50.0,
                "label": "-$4",
                "dir": "B",
                "condition": "4!="
            }
        ]
    },
    "diode": {
        "name": "diode",
        "displayName": "Diode",
        "argsCount": 6,
        "enabled": "true",
        "category": "Diodes",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "spiceTemplate": "D_{NAME} {pin1} {pin2} {MODEL}",
        "argDefs": [
            {
                "idx": 3,
                "type": "select",
                "label": "horizontal/vertical",
                "defVal": "horizontal",
                "options": "horizontal, vertical"
            },
            {
                "idx": 4,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            }
        ],
        "iconBase": "M 0 0 L 15 0 M 15 -15 L 15 15 L 35 0 Z M 35 0 L 50 0",
        "filled": false,
        "iconLayers": [
            {
                "condition": "1~=",
                "style": "stroke-width=3.4",
                "path": "M 36.50 -15 L 36.50 15"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "horizontal/vertical",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -0.0,
                "label": "anode",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 50.0,
                "y": -0.0,
                "label": "cathode",
                "dir": "R"
            }
        ]
    },
    "zenerdiode": {
        "name": "zenerdiode",
        "displayName": "Zener Diode",
        "argsCount": 6,
        "enabled": "true",
        "category": "Diodes",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "argDefs": [
            {
                "idx": 3,
                "type": "select",
                "label": "horizontal/vertical",
                "defVal": "",
                "options": "horizontal, vertical,"
            },
            {
                "idx": 4,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            }
        ],
        "iconBase": "M 0 0 L 15 0 M 15 -15 L 15 15 L 35 0 Z M 35 0 L 50 0",
        "filled": false,
        "iconLayers": [
            {
                "condition": "1~=",
                "style": "stroke-width=2.7",
                "path": "M 31 -15 L 36 -15 L 36 15 L 41 15"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "horizontal/vertical",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -0.0,
                "label": "anode",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 50.0,
                "y": -0.0,
                "label": "cathode",
                "dir": "R"
            }
        ]
    },
    "leddiode": {
        "name": "leddiode",
        "displayName": "LED",
        "argsCount": 6,
        "enabled": "true",
        "category": "Diodes",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "argDefs": [
            {
                "idx": 3,
                "type": "select",
                "label": "horizontal/vertical",
                "defVal": "",
                "options": "horizontal, vertical,"
            },
            {
                "idx": 4,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            }
        ],
        "iconBase": "M 0 0 L 15 0 M 15 -15 L 15 15 L 35 0 Z M 35 0 L 50 0",
        "filled": false,
        "iconLayers": [
            {
                "condition": "1~=",
                "style": "stroke-width=2.9",
                "path": "M 36.50 -15 L 36.50 15"
            },
            {
                "condition": "1~=",
                "style": "rounded=true",
                "path": "M 17.50 -19.50 L 27.50 -29.50 M 22.50 -29.50 L 27.50 -29.50 L 27.50 -24.50 M 26 -17 L 36 -27 M 31 -27 L 36 -27 L 36 -22"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "horizontal/vertical",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -0.0,
                "label": "anode",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 50.0,
                "y": -0.0,
                "label": "cathode",
                "dir": "R"
            }
        ]
    },
    "photodiode": {
        "name": "photodiode",
        "displayName": "Photodiode",
        "argsCount": 6,
        "enabled": "true",
        "category": "Diodes",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "argDefs": [
            {
                "idx": 3,
                "type": "select",
                "label": "horizontal/vertical",
                "defVal": "",
                "options": "horizontal, vertical,"
            },
            {
                "idx": 4,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            }
        ],
        "iconBase": "M 0 0 L 15 0 M 15 -15 L 15 15 L 35 0 Z M 35 0 L 50 0",
        "filled": false,
        "iconLayers": [
            {
                "condition": "1~=",
                "style": "rounded=true",
                "path": "M 27.50 -30 L 17.50 -20 M 17.50 -25 L 17.50 -20 L 22.50 -20 M 37.50 -27.50 L 27.50 -17.50 M 27.50 -22.50 L 27.50 -17.50 L 32.50 -17.50"
            },
            {
                "condition": "1~=",
                "style": "stroke-width=2.7",
                "path": "M 36.50 -15 L 36.50 15"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "horizontal/vertical",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -0.0,
                "label": "anode",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 50.0,
                "y": -0.0,
                "label": "cathode",
                "dir": "R"
            }
        ]
    },
    "supplyterminal": {
        "name": "supplyterminal",
        "displayName": "Supply Terminal",
        "argsCount": 5,
        "enabled": "true",
        "category": "Terminals",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "x": 0.0,
            "y": -1.0,
            "dir": "T"
        },
        "flippable": false,
        "spiceTemplate": "V_{NAME} {pin1} 0 {VOLTAGE}",
        "argDefs": [
            {
                "idx": 3,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            }
        ],
        "iconBase": "M 0 10 L 0 0",
        "filled": false,
        "iconLayers": [
            {
                "condition": "1~=",
                "style": "stroke-width=4",
                "path": "M -15 0 L 15 0"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": 10.0,
                "label": "",
                "dir": "R"
            }
        ]
    },
    "ioport": {
        "name": "ioport",
        "displayName": "Input/Output Port",
        "argsCount": 6,
        "enabled": "true",
        "category": "Terminals",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "hideLabel": true,
        "argDefs": [
            {
                "idx": 3,
                "type": "select",
                "label": "orientation",
                "defVal": "input",
                "options": "input, output, top, bottom"
            },
            {
                "idx": 4,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            }
        ],
        "iconBase": "",
        "filled": false,
        "iconLayers": [
            {
                "condition": "3==input",
                "style": "",
                "path": "M -11 0 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 0 L -7.50 0"
            },
            {
                "condition": "3==output",
                "style": "",
                "path": "M 11 0 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 0 L 7.5 0"
            },
            {
                "condition": "3==top",
                "style": "",
                "path": "M 0 -11 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 0 L 0 -7.50"
            },
            {
                "condition": "3==bottom",
                "style": "",
                "path": "M 0 11 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 0 L 0 7.50"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "input/output/top/bottom",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "$2",
                "x": -15.0,
                "y": -0.0,
                "label": "",
                "dir": "L",
                "condition": "3==input"
            },
            {
                "id": "$2",
                "x": 18.0,
                "y": -0.0,
                "label": "",
                "dir": "R",
                "condition": "3==output"
            },
            {
                "id": "$2",
                "x": 0.0,
                "y": -18.0,
                "label": "",
                "dir": "T",
                "condition": "3==top"
            },
            {
                "id": "$2",
                "x": 0.0,
                "y": 17.0,
                "label": "",
                "dir": "B",
                "condition": "3==bottom"
            },
            {
                "id": "pin3",
                "x": 0.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            }
        ]
    },
    "ioportdot": {
        "name": "ioportdot",
        "displayName": "Input/Output Port (dot only)",
        "argsCount": 6,
        "enabled": "true",
        "category": "Terminals",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "hideLabel": true,
        "argDefs": [
            {
                "idx": 3,
                "type": "select",
                "label": "orientation",
                "defVal": "input",
                "options": "input, output, top, bottom"
            },
            {
                "idx": 4,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            }
        ],
        "iconBase": "",
        "filled": false,
        "iconLayers": [
            {
                "condition": "3==input",
                "style": "",
                "path": "M -3 0 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0"
            },
            {
                "condition": "3==output",
                "style": "",
                "path": "M 3.50 0 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0"
            },
            {
                "condition": "3==top",
                "style": "",
                "path": "M 0 -3.50 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0"
            },
            {
                "condition": "3==bottom",
                "style": "",
                "path": "M 0 3.50 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "input/output/top/bottom",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "$2",
                "x": -7.0,
                "y": -0.0,
                "label": "",
                "dir": "L",
                "condition": "3==input"
            },
            {
                "id": "$2",
                "x": 8.5,
                "y": -0.0,
                "label": "",
                "dir": "R",
                "condition": "3==output"
            },
            {
                "id": "$2",
                "x": 0.0,
                "y": -10.0,
                "label": "",
                "dir": "T",
                "condition": "3==top"
            },
            {
                "id": "$2",
                "x": 0.0,
                "y": 10.5,
                "label": "",
                "dir": "B",
                "condition": "3==bottom"
            },
            {
                "id": "pin3",
                "x": 0.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            }
        ]
    },
    "andthree": {
        "name": "andthree",
        "displayName": "AND-3",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "argDefs": [
            {
                "idx": 1,
                "type": "select",
                "label": "string for inverted inputs",
                "defVal": "000",
                "options": "000, 001, 010, 011, 100, 101, 110, 111"
            },
            {
                "idx": 4,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            }
        ],
        "iconBase": "M 16 -40 L 40 -40 C 55 -40 60 -20 60 -20 C 60 -20 55 0 40 0 L 16 0 Z M 60 -20 L 70 -20 M 0 -30 L 10 -30 M 0 -20 L 10 -20 M 0 -10 L 10 -10",
        "filled": false,
        "iconLayers": [
            {
                "condition": "1==000",
                "style": "",
                "path": "M 0 -30 L 15 -30 M 0 -20 L 15 -20 M 0 -10 L 15 -10"
            },
            {
                "condition": "1==001",
                "style": "",
                "path": "M 12.50 -29.50 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -29.50 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 0 -30 L 10 -30 M 0 -20 L 15 -20 M 0 -10 L 15 -10"
            },
            {
                "condition": "1==010",
                "style": "",
                "path": "M 12.50 -20 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -20 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 0 -20 L 10 -20 M 0 -30 L 15 -30 M 0 -10 L 15 -10"
            },
            {
                "condition": "1==011",
                "style": "",
                "path": "M 12.50 -29.50 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -20 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -29.50 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -20 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 0 -30 L 10 -30 M 0 -20 L 10 -20 M 0 -10 L 15 -10"
            },
            {
                "condition": "1==100",
                "style": "",
                "path": "M 12.50 -10 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -10 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 0 -10 L 10 -10 M 0 -20 L 15 -20 M 0 -30 L 15 -30"
            },
            {
                "condition": "1==101",
                "style": "",
                "path": "M 12.50 -29.50 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -10 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -29.50 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -10 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 0 -20 L 15 -20 M 0 -30 L 10 -30 M 0 -10 L 10 -10"
            },
            {
                "condition": "1==110",
                "style": "",
                "path": "M 12.50 -29.50 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -20 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -29.50 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -20 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 0 -30 L 10 -30 M 0 -20 L 10 -20 M 0 -10 L 15 -10"
            },
            {
                "condition": "1==111",
                "style": "",
                "path": "M 12.50 -29.50 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -20 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -10 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -29.50 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -20 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -10 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 0 -30 L 10 -30 M 0 -20 L 10 -20 M 0 -10 L 10 -10"
            }
        ],
        "argNames": [
            {
                "name": "string for inverted inputs",
                "optional": true
            },
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -30.0,
                "label": "input-1",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -20.0,
                "label": "input-2",
                "dir": "R"
            },
            {
                "id": "pin3",
                "x": 0.0,
                "y": -10.0,
                "label": "input-3",
                "dir": "R"
            },
            {
                "id": "pin4",
                "x": 70.0,
                "y": -20.0,
                "label": "output",
                "dir": "R"
            }
        ]
    },
    "andninputs": {
        "name": "andninputs",
        "displayName": "AND - n inputs",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "previewArgs": {
            "3": "4"
        },
        "argDefs": [
            {
                "idx": 3,
                "type": "text",
                "label": "number of inputs",
                "defVal": "4"
            },
            {
                "idx": 4,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            }
        ],
        "shapeGenerator": "\nlet n = parseInt(args[3]);\nif (isNaN(n) || n < 2) n = 2;\nlet tikz = new TikZBuilder();\n\nlet startY = 2 - Math.floor(n/2) + ((n % 2 === 0) ? 0.5 : 0);\n\nif (n > 4) {\nlet endY = startY + n - 1;\nfor(let i=0; i<n; i++) {\nlet y = startY + i;\ntikz.draw(-2, y).to(-1, y);\ntikz.pin('pin' + (i+1), -2, y, 'L', '');\n}\ntikz.draw(-1, startY).to(-1, endY);\ntikz.draw(-1, 2).to(1, 2);\ntikz.draw(-0.2, 1.5).to(0.2, 2.5);\ntikz.text(0, 3.0, n.toString(), 10, 'normal');\n} else {\nfor(let i=0; i<n; i++) {\nlet y = startY + i;\ntikz.draw(0, y).to(1, y);\ntikz.pin('pin' + (i+1), 0, y, 'L', '');\n}\n}\n\ntikz.draw(1, 0).to(4, 0).arc(4, 2, 2, -90, 90).to(4, 4).to(1, 4).cycle();\ntikz.text(2.5, 2, args[2] || \"\", 12, 'bold');\n\ntikz.draw(6, 2).to(7, 2);\ntikz.pin('pinRight', 7, 2, 'R', '');\nreturn tikz.export();",
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "number of inputs",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pinRight",
                "x": 70.0,
                "y": -20.0,
                "label": "",
                "dir": "R"
            }
        ]
    },
    "nandninputs": {
        "name": "nandninputs",
        "displayName": "NAND - n inputs",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "previewArgs": {
            "3": "4"
        },
        "argDefs": [
            {
                "idx": 3,
                "type": "text",
                "label": "number of inputs",
                "defVal": "4"
            },
            {
                "idx": 4,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            }
        ],
        "shapeGenerator": "\nlet n = parseInt(args[3]);\nif (isNaN(n) || n < 2) n = 2;\nlet tikz = new TikZBuilder();\n\nlet startY = 2 - Math.floor(n/2) + ((n % 2 === 0) ? 0.5 : 0);\n\nif (n > 4) {\nlet endY = startY + n - 1;\nfor(let i=0; i<n; i++) {\nlet y = startY + i;\ntikz.draw(-2, y).to(-1, y);\ntikz.pin('pin' + (i+1), -2, y, 'L', '');\n}\ntikz.draw(-1, startY).to(-1, endY);\ntikz.draw(-1, 2).to(1, 2);\ntikz.draw(-0.2, 1.5).to(0.2, 2.5);\ntikz.text(0, 3.0, n.toString(), 10, 'normal');\n} else {\nfor(let i=0; i<n; i++) {\nlet y = startY + i;\ntikz.draw(0, y).to(1, y);\ntikz.pin('pin' + (i+1), 0, y, 'L', '');\n}\n}\n\ntikz.draw(1, 0).to(4, 0).arc(4, 2, 2, -90, 90).to(4, 4).to(1, 4).cycle();\ntikz.text(2.5, 2, args[2] || \"\", 12, 'bold');\n\ntikz.circle(6.25, 2, 0.25);\ntikz.draw(6.5, 2).to(7.5, 2);\ntikz.pin('pinRight', 7.5, 2, 'R', '');\nreturn tikz.export();",
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "number of inputs",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pinRight",
                "x": 75.0,
                "y": -20.0,
                "label": "",
                "dir": "R"
            }
        ]
    },
    "nandthree": {
        "name": "nandthree",
        "displayName": "NAND-3",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "argDefs": [
            {
                "idx": 1,
                "type": "select",
                "label": "string for inverted inputs",
                "defVal": "000",
                "options": "000, 001, 010, 011, 100, 101, 110, 111"
            },
            {
                "idx": 4,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            }
        ],
        "iconBase": "M 16 -40 L 40 -40 C 55 -40 60 -20 60 -20 C 60 -20 55 0 40 0 L 16 0 Z M 0 -30 L 10 -30 M 0 -20 L 10 -20 M 0 -10 L 10 -10 M 63.50 -20 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 70 -20 L 66.50 -20",
        "filled": false,
        "iconLayers": [
            {
                "condition": "1==000",
                "style": "",
                "path": "M 0 -30 L 15 -30 M 0 -20 L 15 -20 M 0 -10 L 15 -10"
            },
            {
                "condition": "1==001",
                "style": "",
                "path": "M 12.50 -29.50 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -29.50 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 0 -30 L 10 -30 M 0 -20 L 15 -20 M 0 -10 L 15 -10"
            },
            {
                "condition": "1==010",
                "style": "",
                "path": "M 12.50 -20 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -20 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 0 -20 L 10 -20 M 0 -30 L 15 -30 M 0 -10 L 15 -10"
            },
            {
                "condition": "1==011",
                "style": "",
                "path": "M 12.50 -29.50 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -20 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -29.50 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -20 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 0 -30 L 10 -30 M 0 -20 L 10 -20 M 0 -10 L 15 -10"
            },
            {
                "condition": "1==100",
                "style": "",
                "path": "M 12.50 -10 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -10 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 0 -10 L 10 -10 M 0 -20 L 15 -20 M 0 -30 L 15 -30"
            },
            {
                "condition": "1==101",
                "style": "",
                "path": "M 12.50 -29.50 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -10 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -29.50 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -10 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 0 -20 L 15 -20 M 0 -30 L 10 -30 M 0 -10 L 10 -10"
            },
            {
                "condition": "1==110",
                "style": "",
                "path": "M 12.50 -29.50 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -20 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -29.50 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -20 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 0 -30 L 10 -30 M 0 -20 L 10 -20 M 0 -10 L 15 -10"
            },
            {
                "condition": "1==111",
                "style": "",
                "path": "M 12.50 -29.50 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -20 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -10 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -29.50 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -20 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 12.50 -10 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 0 -30 L 10 -30 M 0 -20 L 10 -20 M 0 -10 L 10 -10"
            }
        ],
        "argNames": [
            {
                "name": "string for inverted inputs",
                "optional": true
            },
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -30.0,
                "label": "input-1",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -20.0,
                "label": "input-2",
                "dir": "R"
            },
            {
                "id": "pin3",
                "x": 0.0,
                "y": -10.0,
                "label": "input-3",
                "dir": "R"
            },
            {
                "id": "pin4",
                "x": 70.0,
                "y": -20.0,
                "label": "output",
                "dir": "R"
            }
        ]
    },
    "andtwo": {
        "name": "andtwo",
        "displayName": "AND-2",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "argDefs": [
            {
                "idx": 1,
                "type": "select",
                "label": "string for inverted inputs",
                "defVal": "00",
                "options": "00, 01, 10, 11"
            },
            {
                "idx": 4,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            }
        ],
        "propDefs": [
            {
                "type": "SIM",
                "id": "DELAY",
                "label": "Gate Delay (s)",
                "defVal": "5n"
            }
        ],
        "iconBase": "M 16 -40 L 40 -40 C 55 -40 60 -20 60 -20 C 60 -20 55 0 40 0 L 16 0 Z M 60 -20 L 70 -20",
        "filled": false,
        "iconLayers": [
            {
                "condition": "1==00",
                "style": "",
                "path": "M 0 -30 L 16 -30 M 0 -10 L 16 -10"
            },
            {
                "condition": "1==01",
                "style": "",
                "path": "M 0 -30 L 16 -30 M 12.50 -10 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -10 L 10 -10"
            },
            {
                "condition": "1==10",
                "style": "",
                "path": "M 0 -10 L 16 -10 M 12.50 -30 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -30 L 10 -30"
            },
            {
                "condition": "1==11",
                "style": "",
                "path": "M 12.50 -30 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 12.50 -10 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -30 L 10 -30 M 0 -10 L 10 -10"
            }
        ],
        "argNames": [
            {
                "name": "string for inverted inputs",
                "optional": true
            },
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -30.0,
                "label": "input-1",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -10.0,
                "label": "input-2",
                "dir": "R"
            },
            {
                "id": "pin3",
                "x": 70.0,
                "y": -20.0,
                "label": "output",
                "dir": "R"
            }
        ]
    },
    "nandtwo": {
        "name": "nandtwo",
        "displayName": "NAND-2",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "argDefs": [
            {
                "idx": 1,
                "type": "select",
                "label": "string for inverted inputs",
                "defVal": "00",
                "options": "00, 01, 10, 11"
            },
            {
                "idx": 4,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            }
        ],
        "iconBase": "M 16 -40 L 35 -40 C 45 -40 55 -20 55 -20 C 55 -20 45 0 35 0 L 16 0 Z M 59 -20 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0 M 63 -20 L 70 -20",
        "filled": false,
        "iconLayers": [
            {
                "condition": "1==00",
                "style": "",
                "path": "M 0 -30 L 16 -30 M 0 -10 L 16 -10"
            },
            {
                "condition": "1==01",
                "style": "",
                "path": "M 0 -30 L 16 -30 M 12.50 -10 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -10 L 10 -10"
            },
            {
                "condition": "1==10",
                "style": "",
                "path": "M 12.50 -30 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -10 L 16 -10 M 0 -30 L 10 -30"
            },
            {
                "condition": "1==11",
                "style": "",
                "path": "M 12.50 -30 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -30 L 10 -30 M 12.50 -10 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -10 L 10 -10"
            }
        ],
        "argNames": [
            {
                "name": "string for inverted inputs",
                "optional": true
            },
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -30.0,
                "label": "input-1",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -10.0,
                "label": "input-3",
                "dir": "R"
            },
            {
                "id": "pin3",
                "x": 70.0,
                "y": -20.0,
                "label": "output",
                "dir": "R"
            }
        ]
    },
    "orthree": {
        "name": "orthree",
        "displayName": "OR-3",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "argDefs": [
            {
                "idx": 1,
                "type": "select",
                "label": "string for inverted inputs",
                "defVal": "000",
                "options": "000, 001, 010, 011, 100, 101, 110, 111"
            }
        ],
        "iconBase": "M 10 -40 Q 25 -20 10 0 C 35 0 50 -10 60 -20 C 50 -30 35 -40 10 -40 Z M 60 -20 L 70 -20",
        "filled": false,
        "iconLayers": [
            {
                "condition": "1==000",
                "style": "",
                "path": "M 0 -30 L 16 -30 M 0 -20 L 18 -20 M 0 -10 L 16 -10"
            },
            {
                "condition": "1==001",
                "style": "",
                "path": "M 0 -30 L 16 -30 M 0 -20 L 18 -20 M 12.50 -10 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -10 L 10 -10"
            },
            {
                "condition": "1==010",
                "style": "",
                "path": "M 0 -30 L 16 -30 M 0 -10 L 16 -10 M 14.50 -20 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -20 L 12 -20"
            },
            {
                "condition": "1==011",
                "style": "",
                "path": "M 0 -30 L 16 -30 M 14.50 -20 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 12.50 -10 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -10 L 10 -10 M 0 -20 L 11.5 -20"
            },
            {
                "condition": "1==100",
                "style": "",
                "path": "M 0 -20 L 18 -20 M 0 -10 L 16 -10 M 12.50 -30 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -30 L 10 -30"
            },
            {
                "condition": "1==101",
                "style": "",
                "path": "M 0 -20 L 18 -20 M 12.50 -30 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 12.50 -10 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -30 L 10 -30 M 0 -10 L 10 -10"
            },
            {
                "condition": "1==110",
                "style": "",
                "path": "M 0 -10 L 16 -10 M 12.50 -30 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 14.50 -20 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -30 L 10 -30 M 0 -20 L 12 -20"
            },
            {
                "condition": "1==111",
                "style": "",
                "path": "M 12.50 -30 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 12.50 -10 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 14.50 -20 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -30 L 10 -30 M 0 -10 L 10 -10 M 0 -20 L 11.5 -20"
            }
        ],
        "argNames": [
            {
                "name": "string for inverted inputs",
                "optional": true
            },
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -30.0,
                "label": "input-1",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -20.0,
                "label": "input-2",
                "dir": "R"
            },
            {
                "id": "pin3",
                "x": 0.0,
                "y": -10.0,
                "label": "input-3",
                "dir": "R"
            },
            {
                "id": "pin4",
                "x": 70.0,
                "y": -20.0,
                "label": "output",
                "dir": "R"
            }
        ]
    },
    "northree": {
        "name": "northree",
        "displayName": "NOR-3",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "argDefs": [
            {
                "idx": 1,
                "type": "select",
                "label": "string for inverted inputs",
                "defVal": "000",
                "options": "000, 001, 010, 011, 100, 101, 110, 111"
            }
        ],
        "iconBase": "M 10 -40 Q 25 -20 10 0 C 35 0 50 -10 60 -20 C 50 -30 35 -40 10 -40 Z M 63.50 -20 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 70 -20 L 66.50 -20",
        "filled": false,
        "iconLayers": [
            {
                "condition": "1==000",
                "style": "",
                "path": "M 0 -30 L 16 -30 M 0 -20 L 18 -20 M 0 -10 L 16 -10"
            },
            {
                "condition": "1==001",
                "style": "",
                "path": "M 0 -30 L 16 -30 M 0 -20 L 18 -20 M 12.50 -10 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -10 L 10 -10"
            },
            {
                "condition": "1==010",
                "style": "",
                "path": "M 0 -30 L 16 -30 M 0 -10 L 16 -10 M 14.50 -20 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -20 L 12 -20"
            },
            {
                "condition": "1==011",
                "style": "",
                "path": "M 0 -30 L 16 -30 M 14.50 -20 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 12.50 -10 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -10 L 10 -10 M 0 -20 L 11.5 -20"
            },
            {
                "condition": "1==100",
                "style": "",
                "path": "M 0 -20 L 18 -20 M 0 -10 L 16 -10 M 12.50 -30 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -30 L 10 -30"
            },
            {
                "condition": "1==101",
                "style": "",
                "path": "M 0 -20 L 18 -20 M 12.50 -30 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 12.50 -10 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -30 L 10 -30 M 0 -10 L 10 -10"
            },
            {
                "condition": "1==110",
                "style": "",
                "path": "M 0 -10 L 16 -10 M 12.50 -30 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 14.50 -20 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -30 L 10 -30 M 0 -20 L 12 -20"
            },
            {
                "condition": "1==111",
                "style": "",
                "path": "M 12.50 -30 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 12.50 -10 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 14.50 -20 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -30 L 10 -30 M 0 -10 L 10 -10 M 0 -20 L 11.5 -20"
            }
        ],
        "argNames": [
            {
                "name": "string for inverted inputs",
                "optional": true
            },
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -30.0,
                "label": "input-1",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -20.0,
                "label": "input-2",
                "dir": "R"
            },
            {
                "id": "pin3",
                "x": 0.0,
                "y": -10.0,
                "label": "input-3",
                "dir": "R"
            },
            {
                "id": "pin4",
                "x": 70.0,
                "y": -20.0,
                "label": "output",
                "dir": "R"
            }
        ]
    },
    "ortwo": {
        "name": "ortwo",
        "displayName": "OR-2",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "argDefs": [
            {
                "idx": 1,
                "type": "select",
                "label": "string for inverted inputs",
                "defVal": "00",
                "options": "00, 01, 10, 11"
            }
        ],
        "iconBase": "M 10 -40 Q 25 -20 10 0 C 35 0 50 -10 60 -20 C 50 -30 35 -40 10 -40 Z M 60 -20 L 70 -20",
        "filled": false,
        "iconLayers": [
            {
                "condition": "1==00",
                "style": "",
                "path": "M 0 -30 L 16 -30 M 0 -10 L 16 -10"
            },
            {
                "condition": "1==01",
                "style": "",
                "path": "M 0 -30 L 16 -30 M 12.50 -10 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -10 L 10 -10"
            },
            {
                "condition": "1==10",
                "style": "",
                "path": "M 0 -10 L 16 -10 M 12.50 -30 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -30 L 10 -30"
            },
            {
                "condition": "1==11",
                "style": "",
                "path": "M 12.50 -30 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 12.50 -10 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -30 L 10 -30 M 0 -10 L 10 -10"
            }
        ],
        "argNames": [
            {
                "name": "string for inverted inputs",
                "optional": true
            },
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -30.0,
                "label": "input-1",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -10.0,
                "label": "input-3",
                "dir": "R"
            },
            {
                "id": "pin3",
                "x": 70.0,
                "y": -20.0,
                "label": "output",
                "dir": "R"
            }
        ]
    },
    "orninputs": {
        "name": "orninputs",
        "displayName": "OR - n inputs",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "previewArgs": {
            "3": "4"
        },
        "argDefs": [
            {
                "idx": 3,
                "type": "text",
                "label": "number of inputs",
                "defVal": "4"
            },
            {
                "idx": 4,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            }
        ],
        "shapeGenerator": "\nlet n = parseInt(args[3]);\nif (isNaN(n) || n < 2) n = 2;\nlet tikz = new TikZBuilder();\n\nlet startY = 2 - Math.floor(n/2) + ((n % 2 === 0) ? 0.5 : 0);\n\nif (n > 4) {\nlet endY = startY + n - 1;\nfor(let i=0; i<n; i++) {\nlet y = startY + i;\ntikz.draw(-2, y).to(-1, y);\ntikz.pin('pin' + (i+1), -2, y, 'L', '');\n}\ntikz.draw(-1, startY).to(-1, endY);\nlet endX = -1.236 + 3; // \u03a4\u03bf\u03bc\u03ae \u03bc\u03b5 \u03c4\u03b7\u03bd \u03ba\u03b1\u03bc\u03c0\u03cd\u03bb\u03b7 \u03c3\u03c4\u03bf \u03ba\u03ad\u03bd\u03c4\u03c1\u03bf (y=2)\ntikz.draw(-1, 2).to(endX, 2);\ntikz.draw(-0.2, 1.5).to(0.2, 2.5);\ntikz.text(0, 3.0, n.toString(), 10, 'normal');\n} else {\nfor(let i=0; i<n; i++) {\nlet y = startY + i;\nlet dy = y - 2;\nlet endX = -1.236 + Math.sqrt(9 - dy*dy);\ntikz.draw(0, y).to(endX, y);\ntikz.pin('pin' + (i+1), 0, y, 'L', '');\n}\n}\n\n// THE FIX: sweep-flag is 0 so the arc bows INWARD (concave) relative to the inputs!\ntikz.path += `M ${tikz.pt(1, 4)} C ${tikz.pt(4, 4)} ${tikz.pt(5, 3)} ${tikz.pt(6, 2)} C ${tikz.pt(5, 1)} ${tikz.pt(4, 0)} ${tikz.pt(1, 0)} A 30 30 0 0 0 ${tikz.pt(1, 4)} Z `;\ntikz.text(3.5, 2, args[2] || \"\", 12, 'bold');\n\ntikz.draw(6, 2).to(7, 2);\ntikz.pin('pinRight', 7, 2, 'R', '');\nreturn tikz.export();",
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "number of inputs",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pinRight",
                "x": 70.0,
                "y": -20.0,
                "label": "",
                "dir": "R"
            }
        ]
    },
    "nortwo": {
        "name": "nortwo",
        "displayName": "NOR-2",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "argDefs": [
            {
                "idx": 1,
                "type": "select",
                "label": "string for inverted inputs",
                "defVal": "00",
                "options": "00, 01, 10, 11"
            }
        ],
        "iconBase": "M 10 -40 Q 25 -20 10 0 C 35 0 50 -10 60 -20 C 50 -30 35 -40 10 -40 Z M 63.50 -20 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 70 -20 L 66.50 -20",
        "filled": false,
        "iconLayers": [
            {
                "condition": "1==00",
                "style": "",
                "path": "M 0 -30 L 16 -30 M 0 -10 L 16 -10"
            },
            {
                "condition": "1==01",
                "style": "",
                "path": "M 0 -30 L 16 -30 M 12.50 -10 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -10 L 10 -10"
            },
            {
                "condition": "1==10",
                "style": "",
                "path": "M 0 -10 L 16 -10 M 12.50 -30 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -30 L 10 -30"
            },
            {
                "condition": "1==11",
                "style": "",
                "path": "M 12.50 -30 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 12.50 -10 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -30 L 10 -30 M 0 -10 L 10 -10"
            }
        ],
        "argNames": [
            {
                "name": "string for inverted inputs",
                "optional": true
            },
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -30.0,
                "label": "input-1",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -10.0,
                "label": "input-3",
                "dir": "R"
            },
            {
                "id": "pin3",
                "x": 70.0,
                "y": -20.0,
                "label": "output",
                "dir": "R"
            }
        ]
    },
    "norninputs": {
        "name": "norninputs",
        "displayName": "NOR - n inputs",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "previewArgs": {
            "3": "4"
        },
        "argDefs": [
            {
                "idx": 3,
                "type": "text",
                "label": "number of inputs",
                "defVal": "4"
            },
            {
                "idx": 4,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            }
        ],
        "shapeGenerator": "\nlet n = parseInt(args[3]);\nif (isNaN(n) || n < 2) n = 2;\nlet tikz = new TikZBuilder();\n\nlet startY = 2 - Math.floor(n/2) + ((n % 2 === 0) ? 0.5 : 0);\n\nif (n > 4) {\nlet endY = startY + n - 1;\nfor(let i=0; i<n; i++) {\nlet y = startY + i;\ntikz.draw(-2, y).to(-1, y);\ntikz.pin('pin' + (i+1), -2, y, 'L', '');\n}\ntikz.draw(-1, startY).to(-1, endY);\nlet endX = -1.236 + 3; // \u03a4\u03bf\u03bc\u03ae \u03bc\u03b5 \u03c4\u03b7\u03bd \u03ba\u03b1\u03bc\u03c0\u03cd\u03bb\u03b7 \u03c3\u03c4\u03bf \u03ba\u03ad\u03bd\u03c4\u03c1\u03bf (y=2)\ntikz.draw(-1, 2).to(endX, 2);\ntikz.draw(-0.2, 1.5).to(0.2, 2.5);\ntikz.text(0, 3.0, n.toString(), 10, 'normal');\n} else {\nfor(let i=0; i<n; i++) {\nlet y = startY + i;\nlet dy = y - 2;\nlet endX = -1.236 + Math.sqrt(9 - dy*dy);\ntikz.draw(0, y).to(endX, y);\ntikz.pin('pin' + (i+1), 0, y, 'L', '');\n}\n}\n\n// THE FIX: sweep-flag is 0 so the arc bows INWARD (concave) relative to the inputs!\ntikz.path += `M ${tikz.pt(1, 4)} C ${tikz.pt(4, 4)} ${tikz.pt(5, 3)} ${tikz.pt(6, 2)} C ${tikz.pt(5, 1)} ${tikz.pt(4, 0)} ${tikz.pt(1, 0)} A 30 30 0 0 0 ${tikz.pt(1, 4)} Z `;\ntikz.text(3.5, 2, args[2] || \"\", 12, 'bold');\n\ntikz.circle(6.25, 2, 0.25);\ntikz.draw(6.5, 2).to(7.5, 2);\ntikz.pin('pinRight', 7.5, 2, 'R', '');\nreturn tikz.export();",
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "number of inputs",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pinRight",
                "x": 75.0,
                "y": -20.0,
                "label": "",
                "dir": "R"
            }
        ]
    },
    "xortwo": {
        "name": "xortwo",
        "displayName": "XOR-2",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "argDefs": [
            {
                "idx": 1,
                "type": "select",
                "label": "string for inverted inputs",
                "defVal": "00",
                "options": "00, 01, 10, 11"
            }
        ],
        "iconBase": "M 8 -39.50 Q 23 -19.50 8 0.50 M 15 -40 Q 30 -20 15 0 C 40 0 50 -10 60 -20 C 50 -30 40 -40 15 -40 Z M 60 -20 L 70 -20",
        "filled": false,
        "iconLayers": [
            {
                "condition": "1==00",
                "style": "",
                "path": "M 0 -30 L 13 -30 M 0 -10 L 13 -10"
            },
            {
                "condition": "1==01",
                "style": "",
                "path": "M 0 -30 L 13 -30 M 9.50 -10 m -2.50 0 a 2.50 2.50 0 1 0 5 0 a 2.50 2.50 0 1 0 -5 0 M 0 -10 L 6 -10"
            },
            {
                "condition": "1==10",
                "style": "",
                "path": "M 9.50 -30 m -2.50 0 a 2.50 2.50 0 1 0 5 0 a 2.50 2.50 0 1 0 -5 0 M 0 -10 L 13 -10 M 0 -30 L 7.5 -30"
            },
            {
                "condition": "1==11",
                "style": "",
                "path": "M 9.50 -30 m -2.50 0 a 2.50 2.50 0 1 0 5 0 a 2.50 2.50 0 1 0 -5 0 M 0 -30 L 7.5 -30 M 9.50 -10 m -2.50 0 a 2.50 2.50 0 1 0 5 0 a 2.50 2.50 0 1 0 -5 0 M 0 -10 L 7 -10"
            }
        ],
        "argNames": [
            {
                "name": "string for inverted inputs",
                "optional": true
            },
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -30.0,
                "label": "input-1",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -10.0,
                "label": "input-3",
                "dir": "R"
            },
            {
                "id": "pin3",
                "x": 70.0,
                "y": -20.0,
                "label": "output",
                "dir": "R"
            }
        ]
    },
    "xnortwo": {
        "name": "xnortwo",
        "displayName": "XNOR-2",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "argDefs": [
            {
                "idx": 1,
                "type": "select",
                "label": "string for inverted inputs",
                "defVal": "00",
                "options": "00, 01, 10, 11"
            }
        ],
        "iconBase": "M 8 -39.50 Q 23 -19.50 8 0.50 M 15 -40 Q 30 -20 15 0 C 40 0 50 -10 60 -20 C 50 -30 40 -40 15 -40 Z M 64 -20 m -2.50 0 a 2.50 2.50 0 1 0 5 0 a 2.50 2.50 0 1 0 -5 0 M 70 -20 L 66 -20",
        "filled": false,
        "iconLayers": [
            {
                "condition": "1==00",
                "style": "",
                "path": "M 0 -30 L 13 -30 M 0 -10 L 13 -10"
            },
            {
                "condition": "1==01",
                "style": "",
                "path": "M 0 -30 L 13 -30 M 9.50 -10 m -2.50 0 a 2.50 2.50 0 1 0 5 0 a 2.50 2.50 0 1 0 -5 0 M 0 -10 L 6 -10"
            },
            {
                "condition": "1==10",
                "style": "",
                "path": "M 9.50 -30 m -2.50 0 a 2.50 2.50 0 1 0 5 0 a 2.50 2.50 0 1 0 -5 0 M 0 -10 L 13 -10 M 0 -30 L 7.5 -30"
            },
            {
                "condition": "1==11",
                "style": "",
                "path": "M 9.50 -30 m -2.50 0 a 2.50 2.50 0 1 0 5 0 a 2.50 2.50 0 1 0 -5 0 M 0 -30 L 7.5 -30 M 9.50 -10 m -2.50 0 a 2.50 2.50 0 1 0 5 0 a 2.50 2.50 0 1 0 -5 0 M 0 -10 L 7 -10"
            }
        ],
        "argNames": [
            {
                "name": "string for inverted inputs",
                "optional": true
            },
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -30.0,
                "label": "input-1",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -10.0,
                "label": "input-3",
                "dir": "R"
            },
            {
                "id": "pin3",
                "x": 70.0,
                "y": -20.0,
                "label": "output",
                "dir": "R"
            }
        ]
    },
    "inverter": {
        "name": "inverter",
        "displayName": "NOT",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "propDefs": [
            {
                "type": "SIM",
                "id": "DELAY",
                "label": "Gate Delay (s)",
                "defVal": "5n"
            }
        ],
        "argDefs": [
            {
                "idx": 3,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            },
            {
                "idx": 4,
                "type": "select",
                "label": "color (LaTeX only)",
                "defVal": "nocolor",
                "options": "nocolor, color"
            }
        ],
        "iconBase": "M 43 -20 L 50 -20 M 0 -20 L 10 -20 M 10 0 L 10 -40 L 35 -20 Z M 39.50 -20 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0",
        "filled": false,
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "nocolor",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -20.0,
                "label": "input",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 50.0,
                "y": -20.0,
                "label": "output",
                "dir": "R"
            }
        ]
    },
    "invertersmall": {
        "name": "invertersmall",
        "displayName": "NOT small",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "argDefs": [
            {
                "idx": 3,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            },
            {
                "idx": 4,
                "type": "flags",
                "label": "color (LaTeX only)",
                "defVal": "nocolor",
                "options": "nocolor"
            }
        ],
        "iconBase": "M 0 -10 L 10 -10 M 10 -20 L 10 0 L 29 -10 Z M 33.50 -10 m -2.50 0 a 2.50 2.50 0 1 0 5 0 a 2.50 2.50 0 1 0 -5 0 M 40 -10 L 35 -10",
        "filled": false,
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "nocolor",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -10.0,
                "label": "input",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 40.0,
                "y": -10.0,
                "label": "output",
                "dir": "R"
            }
        ]
    },
    "buffer": {
        "name": "buffer",
        "displayName": "BUFFER",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "argDefs": [
            {
                "idx": 3,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            },
            {
                "idx": 4,
                "type": "flags",
                "label": "Color (LaTeX only)",
                "defVal": "nocolor",
                "options": "nocolor"
            }
        ],
        "iconBase": "M 0 -20 L 15 -20 M 15 0 L 15 -40 L 40 -20 Z M 40 -20 L 50 -20",
        "filled": false,
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "nocolor",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -20.0,
                "label": "input",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 50.0,
                "y": -20.0,
                "label": "output",
                "dir": "R"
            }
        ]
    },
    "jkflipflop": {
        "name": "jkflipflop",
        "displayName": "J-K Flip Flop",
        "argsCount": 7,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "T"
        },
        "flippable": false,
        "argDefs": [
            {
                "idx": 3,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            },
            {
                "idx": 4,
                "type": "select",
                "label": "reset",
                "defVal": "noreset",
                "options": "reset, resetn, noreset"
            },
            {
                "idx": 5,
                "type": "select",
                "label": "negative, positive trigger",
                "defVal": "positive",
                "options": "negative, positive"
            }
        ],
        "propDefs": [
            {
                "type": "SIM",
                "id": "DELAY",
                "label": "Gate Delay (s)",
                "defVal": "5n"
            }
        ],
        "iconBase": "M 10 0 L 60 0 L 60 -100 L 10 -100 Z M 0 -80 L 10 -80 M 0 -20 L 10 -20 M 10 -45 L 15 -50 L 10 -55 M 60 -80 L 70 -80 M 60 -20 L 70 -20",
        "filled": false,
        "iconLayers": [
            {
                "condition": "1~=",
                "style": "",
                "path": "M 15 -80 L 15 -80 /*TEXT:10,normal,J*/ M 15 -20 L 15 -20 /*TEXT:10,normal,K*/ M 30 -50 L 30 -50 /*TEXT:10,normal,CLK*/ M 50 -80 L 50 -80 /*TEXT:10,normal,Q*/ M 50 -20 L 50 -20 /*TEXT:10,normal,Q*/ M 46.50 -26.50 L 53.50 -26.50"
            },
            {
                "condition": "1== && 4==reset",
                "style": "",
                "path": "M 35 0 L 35 10 M 35 -5 L 35 -5 /*TEXT:10,normal,clr*/"
            },
            {
                "condition": "5==negative",
                "style": "",
                "path": "M 6.50 -50 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -50 L 3.5 -50"
            },
            {
                "condition": "5==positive",
                "style": "",
                "path": "M 0 -50 L 10 -50"
            },
            {
                "condition": "4==resetn",
                "style": "",
                "path": "M 35 -5 L 35 -5 /*TEXT:10,normal,clrn*/ M 35 3 m -2.50 0 a 2.50 2.50 0 1 0 5 0 a 2.50 2.50 0 1 0 -5 0 M 35 10 L 35 5"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "reset/resetn/noreset",
                "optional": false
            },
            {
                "name": "positive/negative trigger",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin4",
                "x": 35.0,
                "y": 10.0,
                "label": "clr",
                "dir": "R",
                "condition": "1== && 4==reset"
            },
            {
                "id": "pin1",
                "x": 0.0,
                "y": -80.0,
                "label": "J",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -50.0,
                "label": "CLK",
                "dir": "R"
            },
            {
                "id": "pin3",
                "x": 0.0,
                "y": -20.0,
                "label": "K",
                "dir": "R"
            },
            {
                "id": "pin5",
                "x": 70.0,
                "y": -80.0,
                "label": "Q",
                "dir": "R"
            },
            {
                "id": "pin6",
                "x": 70.0,
                "y": -20.0,
                "label": "Qn",
                "dir": "R"
            },
            {
                "id": "pin7",
                "x": 35.0,
                "y": 10.0,
                "label": "clr",
                "dir": "R",
                "condition": "4==resetn"
            }
        ]
    },
    "srlatch": {
        "name": "srlatch",
        "displayName": "S-R Latch",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "T"
        },
        "flippable": false,
        "argDefs": [
            {
                "idx": 3,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            },
            {
                "idx": 4,
                "type": "flags",
                "label": "enable",
                "defVal": "",
                "options": "enable"
            }
        ],
        "iconBase": "M 10 0 L 60 0 L 60 -100 L 10 -100 Z M 0 -80 L 10 -80 M 0 -20 L 10 -20 M 60 -80 L 70 -80 M 60 -20 L 70 -20 M 15 -80 L 15 -80 /*TEXT:10,normal,S*/ M 15 -20 L 15 -20 /*TEXT:10,normal,R*/ M 55 -80 L 55 -80 /*TEXT:10,normal,Q*/ M 55 -20 L 55 -20 /*TEXT:10,normal,Q*/ M 52 -26 L 57.50 -26",
        "filled": false,
        "iconLayers": [
            {
                "condition": "4==enable",
                "style": "",
                "path": "M 0 -50 L 10 -50 M 20 -50 L 20 -50 /*TEXT:10,normal,EN*/"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "enable",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin2",
                "x": 0.0,
                "y": -50.0,
                "label": "E",
                "dir": "R",
                "condition": "4==enable"
            },
            {
                "id": "pin1",
                "x": 0.0,
                "y": -80.0,
                "label": "S",
                "dir": "R"
            },
            {
                "id": "pin3",
                "x": 0.0,
                "y": -20.0,
                "label": "R",
                "dir": "R"
            },
            {
                "id": "pin4",
                "x": 70.0,
                "y": -80.0,
                "label": "Q",
                "dir": "R"
            },
            {
                "id": "pin5",
                "x": 70.0,
                "y": -20.0,
                "label": "Qn",
                "dir": "R"
            }
        ]
    },
    "srflipflop": {
        "name": "srflipflop",
        "displayName": "S-R Flip Flop",
        "argsCount": 7,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "T"
        },
        "flippable": false,
        "argDefs": [
            {
                "idx": 3,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            },
            {
                "idx": 4,
                "type": "select",
                "label": "reset",
                "defVal": "noreset",
                "options": "reset, resetn, noreset"
            },
            {
                "idx": 5,
                "type": "flags",
                "label": "positive/negative trigger",
                "defVal": "positive",
                "options": "positive"
            }
        ],
        "iconBase": "M 10 0 L 60 0 L 60 -100 L 10 -100 Z M 0 -80 L 10 -80 M 0 -20 L 10 -20 M 10 -45 L 15 -50 L 10 -55 M 60 -80 L 70 -80 M 60 -20 L 70 -20 M 15 -80 L 15 -80 /*TEXT:10,normal,S*/ M 15 -20 L 15 -20 /*TEXT:10,normal,R*/ M 28 -50.50 L 28 -50.50 /*TEXT:10,normal,CLK*/ M 54 -80 L 54 -80 /*TEXT:10,normal,Q*/ M 54 -20 L 54 -20 /*TEXT:10,normal,Q*/ M 50.50 -25.50 L 57 -25.50",
        "filled": false,
        "iconLayers": [
            {
                "condition": "4==reset",
                "style": "",
                "path": "M 35 0 L 35 10 M 35 -5 L 35 -5 /*TEXT:10,normal,clr*/"
            },
            {
                "condition": "5==positive",
                "style": "",
                "path": "M 0 -50 L 10 -50"
            },
            {
                "condition": "5!=positive",
                "style": "",
                "path": "M 6.50 -50 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -50 L 3 -50"
            },
            {
                "condition": "4==resetn",
                "style": "",
                "path": "M 35 -5 L 35 -5 /*TEXT:10,normal,clr*/ M 35 3.50 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 35 10 L 35 6.50"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "reset/resetn/noreset",
                "optional": false
            },
            {
                "name": "positive/negative trigger",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin4",
                "x": 35.0,
                "y": 10.0,
                "label": "clr",
                "dir": "R",
                "condition": "4==reset"
            },
            {
                "id": "pin1",
                "x": 0.0,
                "y": -80.0,
                "label": "S",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -50.0,
                "label": "CLK",
                "dir": "R"
            },
            {
                "id": "pin3",
                "x": 0.0,
                "y": -20.0,
                "label": "R",
                "dir": "R"
            },
            {
                "id": "pin5",
                "x": 70.0,
                "y": -80.0,
                "label": "Q",
                "dir": "R"
            },
            {
                "id": "pin6",
                "x": 70.0,
                "y": -20.0,
                "label": "Qn",
                "dir": "R"
            },
            {
                "id": "pin7",
                "x": 35.0,
                "y": 10.0,
                "label": "clr",
                "dir": "R",
                "condition": "4==resetn"
            }
        ]
    },
    "dflipflop": {
        "name": "dflipflop",
        "displayName": "D Flip Flop",
        "argsCount": 7,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "T"
        },
        "flippable": false,
        "argDefs": [
            {
                "idx": 3,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            },
            {
                "idx": 4,
                "type": "select",
                "label": "reset",
                "defVal": "noreset",
                "options": "reset, resetn, noreset"
            },
            {
                "idx": 5,
                "type": "flags",
                "label": "positive/negative trigger",
                "defVal": "positive",
                "options": "positive"
            }
        ],
        "iconBase": "M 10 0 L 60 0 L 60 -100 L 10 -100 Z M 0 -80 L 10 -80 M 0 -20 L 10 -20 M 10 -15 L 15 -20 L 10 -25 M 60 -80 L 70 -80 M 60 -20 L 70 -20 M 15 -80 L 15 -80 /*TEXT:10,normal,D*/ M 28 -20.50 L 28 -20.50 /*TEXT:10,normal,CLK*/ M 54 -80 L 54 -80 /*TEXT:10,normal,Q*/ M 54 -20 L 54 -20 /*TEXT:10,normal,Q*/ M 50.50 -25.50 L 57 -25.50",
        "filled": false,
        "iconLayers": [
            {
                "condition": "4==reset",
                "style": "",
                "path": "M 35 0 L 35 10 M 35 -5 L 35 -5 /*TEXT:10,normal,clr*/"
            },
            {
                "condition": "5==positive",
                "style": "",
                "path": "M 0 -20 L 10 -20"
            },
            {
                "condition": "5!=positive",
                "style": "",
                "path": "M 6.50 -20 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -20 L 3 -20"
            },
            {
                "condition": "4==resetn",
                "style": "",
                "path": "M 35 -5 L 35 -5 /*TEXT:10,normal,clr*/ M 35 3.50 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 35 10 L 35 6.50"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "reset/resetn/noreset",
                "optional": false
            },
            {
                "name": "positive/negative trigger",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin3",
                "x": 35.0,
                "y": 10.0,
                "label": "clr",
                "dir": "R",
                "condition": "4==reset"
            },
            {
                "id": "pin1",
                "x": 0.0,
                "y": -80.0,
                "label": "D",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -20.0,
                "label": "CLK",
                "dir": "R"
            },
            {
                "id": "pin4",
                "x": 70.0,
                "y": -80.0,
                "label": "Q",
                "dir": "R"
            },
            {
                "id": "pin5",
                "x": 70.0,
                "y": -20.0,
                "label": "Qn",
                "dir": "R"
            }
        ]
    },
    "dlatch": {
        "name": "dlatch",
        "displayName": "D Latch",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "T"
        },
        "flippable": false,
        "argDefs": [
            {
                "idx": 3,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            },
            {
                "idx": 4,
                "type": "flags",
                "label": "enable",
                "defVal": "",
                "options": "enable"
            }
        ],
        "iconBase": "M 10 0 L 60 0 L 60 -100 L 10 -100 Z M 0 -80 L 10 -80 M 60 -80 L 70 -80 M 60 -20 L 70 -20 M 15 -80 L 15 -80 /*TEXT:10,normal,D*/ M 55 -80 L 55 -80 /*TEXT:10,normal,Q*/ M 55 -20 L 55 -20 /*TEXT:10,normal,Q*/ M 52 -26 L 57.50 -26",
        "filled": false,
        "iconLayers": [
            {
                "condition": "4==enable",
                "style": "",
                "path": "M 0 -20 L 10 -20 M 20 -20 L 20 -20 /*TEXT:10,normal,EN*/"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "enable",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -80.0,
                "label": "D",
                "dir": "R"
            },
            {
                "id": "pin4",
                "x": 70.0,
                "y": -80.0,
                "label": "Qn",
                "dir": "R"
            },
            {
                "id": "pin5",
                "x": 70.0,
                "y": -20.0,
                "label": "Qn",
                "dir": "R"
            }
        ]
    },
    "tflipflop": {
        "name": "tflipflop",
        "displayName": "T Flip Flop",
        "argsCount": 7,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "T"
        },
        "flippable": false,
        "argDefs": [
            {
                "idx": 3,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            },
            {
                "idx": 4,
                "type": "select",
                "label": "reset",
                "defVal": "noreset",
                "options": "reset, resetn, noreset"
            },
            {
                "idx": 5,
                "type": "flags",
                "label": "positive/negative trigger",
                "defVal": "positive",
                "options": "positive"
            }
        ],
        "iconBase": "M 10 0 L 60 0 L 60 -100 L 10 -100 Z M 0 -80 L 10 -80 M 0 -20 L 10 -20 M 10 -15 L 15 -20 L 10 -25 M 60 -80 L 70 -80 M 60 -20 L 70 -20 M 15 -80 L 15 -80 /*TEXT:10,normal,T*/ M 28 -20.50 L 28 -20.50 /*TEXT:10,normal,CLK*/ M 54 -80 L 54 -80 /*TEXT:10,normal,Q*/ M 54 -20 L 54 -20 /*TEXT:10,normal,Q*/ M 50.50 -25.50 L 57 -25.50",
        "filled": false,
        "iconLayers": [
            {
                "condition": "4==reset",
                "style": "",
                "path": "M 35 0 L 35 10 M 35 -5 L 35 -5 /*TEXT:10,normal,clr*/"
            },
            {
                "condition": "5==positive",
                "style": "",
                "path": "M 0 -20 L 10 -20"
            },
            {
                "condition": "5!=positive",
                "style": "",
                "path": "M 6.50 -20 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 0 -20 L 3 -20"
            },
            {
                "condition": "4==resetn",
                "style": "",
                "path": "M 35 -5 L 35 -5 /*TEXT:10,normal,clr*/ M 35 3.50 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 35 10 L 35 6.50"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "reset/resetn/noreset",
                "optional": false
            },
            {
                "name": "positive/negative trigger",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin3",
                "x": 35.0,
                "y": 10.0,
                "label": "clr",
                "dir": "R"
            },
            {
                "id": "pin3",
                "x": 35.0,
                "y": 10.0,
                "label": "clr",
                "dir": "R"
            },
            {
                "id": "pin1",
                "x": 0.0,
                "y": -80.0,
                "label": "T",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -20.0,
                "label": "CLK",
                "dir": "R"
            },
            {
                "id": "pin4",
                "x": 70.0,
                "y": -80.0,
                "label": "Q",
                "dir": "R"
            },
            {
                "id": "pin5",
                "x": 70.0,
                "y": -20.0,
                "label": "Qn",
                "dir": "R"
            }
        ]
    },
    "muxninputs": {
        "name": "muxninputs",
        "displayName": "Multiplexer with n inputs",
        "argsCount": 7,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "x": 15.0,
            "y": 2.0,
            "dir": "L"
        },
        "flippable": false,
        "previewArgs": {
            "3": "2",
            "4": "0",
            "5": "bottom"
        },
        "shapeGenerator": "\nlet n = parseInt(args[3]);\nif (isNaN(n) || n < 2) n = 2; // Fallback to 2 inputs\nlet spacing = (n === 2) ? 2 : 1;\nlet yOffset = (n === 2) ? -1 : 0;\nlet isTop = args[5] === 'top';\n\nlet numSelects = Math.ceil(Math.log2(n));\nlet w = numSelects + 1; // Width of the mux body\nlet h = (n === 2) ? n*spacing: (n + 1)*spacing;  // Height of the mux body\n\nlet tikz = new TikZBuilder();\n\n// 1. Draw Inputs & Input Pins\nfor (let i = 1; i <= n; i++) {\ntikz.draw(0, i*spacing+yOffset).to(1, i*spacing+yOffset);\ntikz.pin('pin' + i, 0, i*spacing+yOffset, 'L', '');\n}\n\n// 2. Draw Select Lines & Select Pins\nlet selY2 = isTop ? (h + 1) : -1; // The outer tip of the pin\n\nfor (let i = 1; i <= numSelects; i++) {\nlet selX = 1 + i;\n\n// --- THE EXACT SLANT INTERSECTION ---\n// Because the slope is 0.4, for every 'i' units we move right,\n// the slant moves exactly 0.4 * i units vertically!\nlet selY1 = isTop ? (h - 0.4 * i) : (0.4 * i);\n\ntikz.draw(selX, selY1).to(selX, selY2);\ntikz.pin('pinSelect' + i, selX, selY2, isTop ? 'T' : 'B', '');\n}\n\n// 3. Draw Output & Output Pin\nlet outY = Math.ceil((n + 1) / 2);\ntikz.draw(w + 1, outY).to(w + 2, outY);\ntikz.pin('pinOutput', w + 2, outY, 'R', '');\n\n// 4. Draw Trapezoid Box\ntikz.draw(1, 0)\n.to(1, h)\n.to(w + 1, h - 0.4 * w)\n.to(w + 1, 0.4 * w)\n.cycle();\n\n// 5. Add the Center Text Label\n// X center is halfway between the left edge (1) and right edge (w + 1)\n// Y center is halfway down the height (h)\nlet centerX = 1 + (w / 2);\nlet centerY = h / 2;\n\ntikz.text(centerX, centerY, n+\":1\", 9, 'normal');\n\nreturn tikz.export();",
        "argDefs": [
            {
                "idx": 3,
                "type": "text",
                "label": "number of inputs",
                "defVal": "2"
            },
            {
                "idx": 4,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            },
            {
                "idx": 5,
                "type": "select",
                "label": "select terminals position",
                "defVal": "bottom",
                "options": "bottom, top"
            }
        ],
        "iconBase": "",
        "filled": false,
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "number of inputs",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "select at top/bottom",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": []
    },
    "demuxnoutputs": {
        "name": "demuxnoutputs",
        "displayName": "Demultiplexer with n outputs",
        "argsCount": 7,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "shapeGenerator": "\nlet n = parseInt(args[3]);\nif (isNaN(n) || n < 2) n = 2; // Fallback to 2 outputs\nlet spacing = (n === 2) ? 2 : 1;\nlet yOffset = (n === 2) ? -1 : 0;\nlet isTop = args[5] === 'top';\n\nlet numSelects = Math.ceil(Math.log2(n));\nlet w = numSelects + 1; // Width of the mux body\nlet h = (n === 2) ? n*spacing: (n + 1)*spacing;  // Height of the mux body\n\nlet tikz = new TikZBuilder();\n\n// 1. Draw Outputs & Output Pins\nfor (let i = 1; i <= n; i++) {\ntikz.draw(w+1, i*spacing+yOffset).to(w+2, i*spacing+yOffset);\ntikz.pin('pin' + i, w+2, i*spacing+yOffset, 'L', '');\n}\n\n// 2. Draw Select Lines & Select Pins\nlet selY2 = isTop ? (h + 1) : -1; // The outer tip of the pin\n\nfor (let i = 1; i <= numSelects; i++) {\nlet selX = 1 + i;\n\nlet selY1 = isTop ? (h-0.4*(w-i)) : (0.4*(w-i));\n\ntikz.draw(selX, selY1).to(selX, selY2);\ntikz.pin('pinSelect' + i, selX, selY2, isTop ? 'T' : 'B', '');\n}\n\n// 3. Draw Input & Input Pin\nlet outY = Math.ceil((n + 1) / 2);\ntikz.draw(0, outY).to(1, outY);\ntikz.pin('pinOutput', 0, outY, 'R', '');\n\n// 4. Draw Trapezoid Box\ntikz.draw(1, h - 0.4 * w)\n.to(w+1, h)\n.to(w+1, 0)\n.to(1, 0.4 * w)\n.cycle();\n\n// 5. Add the Center Text Label\n// X center is halfway between the left edge (1) and right edge (w + 1)\n// Y center is halfway down the height (h)\nlet centerX = 1 + (w / 2);\nlet centerY = h / 2;\n\ntikz.text(centerX, centerY, \"1:\"+n, 9, 'normal');\n\nreturn tikz.export();",
        "argDefs": [
            {
                "idx": 3,
                "type": "text",
                "label": "number of outputs",
                "defVal": "2"
            },
            {
                "idx": 4,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            },
            {
                "idx": 5,
                "type": "select",
                "label": "select position",
                "defVal": "bottom",
                "options": "bottom, top"
            }
        ],
        "iconBase": "",
        "filled": false,
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "number of outputs",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "select at top/bottom",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": []
    },
    "genericdigitalcircuit": {
        "name": "genericdigitalcircuit",
        "displayName": "Generic digital circuit (n-inputs, m-outputs)",
        "argsCount": 7,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "previewArgs": {
            "2": "ALU",
            "3": "2",
            "4": "2"
        },
        "argDefs": [
            {
                "idx": 3,
                "type": "text",
                "label": "number of inputs",
                "defVal": "2"
            },
            {
                "idx": 3,
                "type": "flags",
                "label": "enable",
                "defVal": "",
                "options": "enable"
            },
            {
                "idx": 4,
                "type": "text",
                "label": "number of outputs",
                "defVal": "2"
            },
            {
                "idx": 5,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            }
        ],
        "shapeGenerator": "\nlet inStr = args[3] ? args[3].toString().trim().toLowerCase() : \"1\";\nlet parts = inStr.split(',');\nlet baseIn = parseInt(parts[0]);\nif (isNaN(baseIn) || baseIn < 1) baseIn = 1;\nlet hasEn = inStr.includes('enable');\n\n// \u03a3\u03c4\u03bf TikZ, \u03b1\u03bd \u03c5\u03c0\u03ac\u03c1\u03c7\u03b5\u03b9 enable, \u03b4\u03b5\u03c3\u03bc\u03b5\u03cd\u03b5\u03b9 +2 \u03b8\u03ad\u03c3\u03b5\u03b9\u03c2 (\u03b7 \u03bc\u03af\u03b1 \u03b3\u03b9\u03b1 \u03c4\u03bf En \u03c3\u03c4\u03bf \u03ba\u03ac\u03c4\u03c9 \u03bc\u03ad\u03c1\u03bf\u03c2)\nlet numInTerms = hasEn ? baseIn + 2 : baseIn;\nlet numOut = parseInt(args[4]);\nif (isNaN(numOut) || numOut < 1) numOut = 1;\n\n// \u03a4\u03bf \u03cd\u03c8\u03bf\u03c2 \u03c4\u03bf\u03c5 \u03ba\u03bf\u03c5\u03c4\u03b9\u03bf\u03cd \u03ba\u03b1\u03b8\u03bf\u03c1\u03af\u03b6\u03b5\u03c4\u03b1\u03b9 \u03b1\u03c0\u03cc \u03c4\u03bf \u03b1\u03bd \u03ad\u03c7\u03bf\u03c5\u03bc\u03b5 \u03c0\u03b5\u03c1\u03b9\u03c3\u03c3\u03cc\u03c4\u03b5\u03c1\u03b5\u03c2 \u03b5\u03b9\u03c3\u03cc\u03b4\u03bf\u03c5\u03c2 \u03ae \u03b5\u03be\u03cc\u03b4\u03bf\u03c5\u03c2\nlet maxTerms = Math.max(numInTerms, numOut);\nlet h = maxTerms + 1;\n\n// \u03a5\u03c0\u03bf\u03bb\u03bf\u03b3\u03b9\u03c3\u03bc\u03cc\u03c2 \u03c4\u03bf\u03c5 offset \u03b3\u03b9\u03b1 \u03bd\u03b1 \u03ba\u03b5\u03bd\u03c4\u03c1\u03ac\u03c1\u03bf\u03bd\u03c4\u03b1\u03b9 \u03c4\u03b1 pins\nlet inOff = Math.round((maxTerms - numInTerms) / 2);\nlet outOff = Math.round((maxTerms - numOut) / 2);\n\nlet tikz = new TikZBuilder();\n\n// 1. \u0396\u03c9\u03b3\u03c1\u03b1\u03c6\u03af\u03b6\u03bf\u03c5\u03bc\u03b5 \u03c4\u03bf \u03ba\u03b5\u03bd\u03c4\u03c1\u03b9\u03ba\u03cc \u03ba\u03bf\u03c5\u03c4\u03af\ntikz.draw(1, 0).to(6, 0).to(6, h).to(1, h).cycle();\n\n// 2. \u0396\u03c9\u03b3\u03c1\u03b1\u03c6\u03af\u03b6\u03bf\u03c5\u03bc\u03b5 \u03c4\u03b9\u03c2 \u0395\u03b9\u03c3\u03cc\u03b4\u03bf\u03c5\u03c2 (\u0391\u03c1\u03b9\u03c3\u03c4\u03b5\u03c1\u03ac)\nlet startIdx = hasEn ? 3 : 1;\nfor (let i = startIdx; i <= numInTerms; i++) {\nlet y = i + inOff;\ntikz.draw(0, y).to(1, y);\ntikz.pin('pinInput' + i, 0, y, 'L', '');\n\n// \u0391\u03bd \u03b5\u03af\u03bd\u03b1\u03b9 \u03bc\u03cc\u03bd\u03bf 1 \u03b5\u03af\u03c3\u03bf\u03b4\u03bf\u03c2 \u03c4\u03b7\u03bd \u03bb\u03ad\u03bc\u03b5 \"I\", \u03b1\u03bb\u03bb\u03b9\u03ce\u03c2 \"I0\", \"I1\" \u03ba\u03bb\u03c0.\nlet lbl = (baseIn === 1) ? \"I\" : \"I\" + (i - startIdx);\ntikz.text(1.5, y, lbl, 9, 'normal');\n}\n\n// 3. \u0396\u03c9\u03b3\u03c1\u03b1\u03c6\u03af\u03b6\u03bf\u03c5\u03bc\u03b5 \u03c4\u03b9\u03c2 \u0395\u03be\u03cc\u03b4\u03bf\u03c5\u03c2 (\u0394\u03b5\u03be\u03b9\u03ac)\nfor (let i = 1; i <= numOut; i++) {\nlet y = i + outOff;\ntikz.draw(6, y).to(7, y);\ntikz.pin('pinOutput' + i, 7, y, 'R', '');\n\nlet lbl = (numOut === 1) ? \"O\" : \"O\" + (i - 1);\ntikz.text(5.5, y, lbl, 9, 'normal');\n}\n\n// 4. \u0396\u03c9\u03b3\u03c1\u03b1\u03c6\u03af\u03b6\u03bf\u03c5\u03bc\u03b5 \u03c4\u03bf Enable Pin (\u03b1\u03bd \u03b6\u03b7\u03c4\u03ae\u03b8\u03b7\u03ba\u03b5)\nif (hasEn) {\nlet y = 1 + inOff; // \u03a4\u03bf \u03c4\u03bf\u03c0\u03bf\u03b8\u03b5\u03c4\u03bf\u03cd\u03bc\u03b5 \u03c3\u03b5 \u03c3\u03c7\u03ad\u03c3\u03b7 \u03bc\u03b5 \u03c4\u03bf grid \u03c4\u03c9\u03bd \u03b5\u03b9\u03c3\u03cc\u03b4\u03c9\u03bd\ntikz.draw(0, y).to(1, y);\ntikz.pin('pinEnable', 0, y, 'L', '');\ntikz.text(1.6, y, \"En\", 9, 'normal');\n}\n\n// 5. \u03a0\u03c1\u03bf\u03c3\u03b8\u03ae\u03ba\u03b7 \u03c4\u03bf\u03c5 \u039f\u03bd\u03cc\u03bc\u03b1\u03c4\u03bf\u03c2 (\u03a3\u03c4\u03bf \u03ba\u03ad\u03bd\u03c4\u03c1\u03bf)\nlet name = args[2] || \"\";\nif (name !== \"\") {\ntikz.text(3.5, h / 2, name, 12, 'bold');\n}\n\nreturn tikz.export();",
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "number of inputs-enable",
                "optional": false
            },
            {
                "name": "number of outputs",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pinEnable",
                "x": 0.0,
                "y": -10.0,
                "label": "enable",
                "dir": "R"
            }
        ]
    },
    "sevensegmentdisplay": {
        "name": "sevensegmentdisplay",
        "displayName": "Seven-segment display",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "T"
        },
        "flippable": false,
        "argDefs": [
            {
                "idx": 3,
                "type": "select",
                "label": "displayed number",
                "defVal": "8",
                "options": "0, 1, 2, 3, 4, 5, 6, 7, 8, 9"
            },
            {
                "idx": 4,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            }
        ],
        "iconBase": "M 0 0 L 80 0 L 80 -100 L 0 -100 Z M 25 -85 L 55 -85 L 55 -75 L 25 -75 Z M 25 -25 L 55 -25 L 55 -15 L 25 -15 Z M 25 -55 L 55 -55 L 55 -45 L 25 -45 Z M 15 -80 L 25 -80 L 25 -50 L 15 -50 Z M 55 -80 L 65 -80 L 65 -50 L 55 -50 Z M 15 -50 L 25 -50 L 25 -20 L 15 -20 Z M 55 -50 L 65 -50 L 65 -20 L 55 -20 Z M 10 0 L 10 10 M 20 0 L 20 10 M 30 0 L 30 10 M 40 0 L 40 10 M 50 0 L 50 10 M 60 0 L 60 10 M 70 0 L 70 10",
        "filled": false,
        "iconLayers": [
            {
                "condition": "3==0",
                "style": "stroke=#ff0000, fill=solid",
                "path": "M 25 -85 L 55 -85 L 55 -75 L 25 -75 Z M 25 -25 L 55 -25 L 55 -15 L 25 -15 Z M 15 -80 L 25 -80 L 25 -50 L 15 -50 Z M 55 -80 L 65 -80 L 65 -50 L 55 -50 Z M 15 -50 L 25 -50 L 25 -20 L 15 -20 Z M 55 -50 L 65 -50 L 65 -20 L 55 -20 Z"
            },
            {
                "condition": "3==1",
                "style": "stroke=#ff0000, fill=solid",
                "path": "M 55 -80 L 65 -80 L 65 -50 L 55 -50 Z M 55 -50 L 65 -50 L 65 -20 L 55 -20 Z"
            },
            {
                "condition": "3==2",
                "style": "stroke=#fa0000, fill=solid",
                "path": "M 25 -85 L 55 -85 L 55 -75 L 25 -75 Z M 25 -25 L 55 -25 L 55 -15 L 25 -15 Z M 25 -55 L 55 -55 L 55 -45 L 25 -45 Z M 55 -80 L 65 -80 L 65 -50 L 55 -50 Z M 15 -50 L 25 -50 L 25 -20 L 15 -20 Z"
            },
            {
                "condition": "3==3",
                "style": "stroke=#ff0000, fill=solid",
                "path": "M 25 -85 L 55 -85 L 55 -75 L 25 -75 Z M 25 -25 L 55 -25 L 55 -15 L 25 -15 Z M 25 -55 L 55 -55 L 55 -45 L 25 -45 Z M 55 -80 L 65 -80 L 65 -50 L 55 -50 Z M 55 -50 L 65 -50 L 65 -20 L 55 -20 Z"
            },
            {
                "condition": "3==4",
                "style": "stroke=#ff0000, fill=solid",
                "path": "M 25 -55 L 55 -55 L 55 -45 L 25 -45 Z M 15 -80 L 25 -80 L 25 -50 L 15 -50 Z M 55 -80 L 65 -80 L 65 -50 L 55 -50 Z M 55 -50 L 65 -50 L 65 -20 L 55 -20 Z"
            },
            {
                "condition": "3==5",
                "style": "stroke=#f50000, fill=solid",
                "path": "M 25 -85 L 55 -85 L 55 -75 L 25 -75 Z M 25 -25 L 55 -25 L 55 -15 L 25 -15 Z M 25 -55 L 55 -55 L 55 -45 L 25 -45 Z M 15 -80 L 25 -80 L 25 -50 L 15 -50 Z M 55 -50 L 65 -50 L 65 -20 L 55 -20 Z"
            },
            {
                "condition": "3==6",
                "style": "stroke=#fa0000, fill=solid",
                "path": "M 25 -85 L 55 -85 L 55 -75 L 25 -75 Z M 25 -25 L 55 -25 L 55 -15 L 25 -15 Z M 25 -55 L 55 -55 L 55 -45 L 25 -45 Z M 15 -80 L 25 -80 L 25 -50 L 15 -50 Z M 15 -50 L 25 -50 L 25 -20 L 15 -20 Z M 55 -50 L 65 -50 L 65 -20 L 55 -20 Z"
            },
            {
                "condition": "3==7",
                "style": "stroke=#fa0000, fill=solid",
                "path": "M 25 -85 L 55 -85 L 55 -75 L 25 -75 Z M 55 -80 L 65 -80 L 65 -50 L 55 -50 Z M 55 -50 L 65 -50 L 65 -20 L 55 -20 Z"
            },
            {
                "condition": "3==8",
                "style": "stroke=#ff0000, fill=solid",
                "path": "M 25 -85 L 55 -85 L 55 -75 L 25 -75 Z M 25 -25 L 55 -25 L 55 -15 L 25 -15 Z M 25 -55 L 55 -55 L 55 -45 L 25 -45 Z M 15 -80 L 25 -80 L 25 -50 L 15 -50 Z M 55 -80 L 65 -80 L 65 -50 L 55 -50 Z M 15 -50 L 25 -50 L 25 -20 L 15 -20 Z M 55 -50 L 65 -50 L 65 -20 L 55 -20 Z"
            },
            {
                "condition": "3==9",
                "style": "stroke=#fa0000, fill=solid",
                "path": "M 25 -85 L 55 -85 L 55 -75 L 25 -75 Z M 25 -25 L 55 -25 L 55 -15 L 25 -15 Z M 25 -55 L 55 -55 L 55 -45 L 25 -45 Z M 15 -80 L 25 -80 L 25 -50 L 15 -50 Z M 55 -80 L 65 -80 L 65 -50 L 55 -50 Z M 55 -50 L 65 -50 L 65 -20 L 55 -20 Z"
            },
            {
                "condition": "3==0",
                "style": "stroke=#bababa, fill=solid",
                "path": "M 25 -55 L 55 -55 L 55 -45 L 25 -45 Z"
            },
            {
                "condition": "3==1",
                "style": "stroke=#bababa, fill=solid",
                "path": "M 25 -85 L 55 -85 L 55 -75 L 25 -75 Z M 25 -25 L 55 -25 L 55 -15 L 25 -15 Z M 25 -55 L 55 -55 L 55 -45 L 25 -45 Z M 15 -80 L 25 -80 L 25 -50 L 15 -50 Z M 15 -50 L 25 -50 L 25 -20 L 15 -20 Z"
            },
            {
                "condition": "3==2",
                "style": "stroke=#bababa, fill=solid",
                "path": "M 15 -80 L 25 -80 L 25 -50 L 15 -50 Z M 55 -50 L 65 -50 L 65 -20 L 55 -20 Z"
            },
            {
                "condition": "3==3",
                "style": "stroke=#bababa, fill=solid",
                "path": "M 15 -80 L 25 -80 L 25 -50 L 15 -50 Z M 15 -50 L 25 -50 L 25 -20 L 15 -20 Z"
            },
            {
                "condition": "3==4",
                "style": "stroke=#bababa, fill=solid",
                "path": "M 25 -85 L 55 -85 L 55 -75 L 25 -75 Z M 25 -25 L 55 -25 L 55 -15 L 25 -15 Z M 15 -50 L 25 -50 L 25 -20 L 15 -20 Z"
            },
            {
                "condition": "3==5",
                "style": "stroke=#bababa, fill=solid",
                "path": "M 55 -80 L 65 -80 L 65 -50 L 55 -50 Z M 15 -50 L 25 -50 L 25 -20 L 15 -20 Z"
            },
            {
                "condition": "3==6",
                "style": "stroke=#bababa, fill=solid",
                "path": "M 55 -80 L 65 -80 L 65 -50 L 55 -50 Z"
            },
            {
                "condition": "3==7",
                "style": "stroke=#bababa, fill=solid",
                "path": "M 25 -25 L 55 -25 L 55 -15 L 25 -15 Z M 25 -55 L 55 -55 L 55 -45 L 25 -45 Z M 15 -80 L 25 -80 L 25 -50 L 15 -50 Z M 15 -50 L 25 -50 L 25 -20 L 15 -20 Z"
            },
            {
                "condition": "3==9",
                "style": "stroke=#bababa, fill=solid",
                "path": "M 15 -50 L 25 -50 L 25 -20 L 15 -20 Z"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "displayed number",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 10.0,
                "y": 10.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 20.0,
                "y": 10.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "pin3",
                "x": 30.0,
                "y": 10.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "pin4",
                "x": 40.0,
                "y": 10.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "pin5",
                "x": 50.0,
                "y": 10.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "pin6",
                "x": 60.0,
                "y": 10.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "pin7",
                "x": 70.0,
                "y": 10.0,
                "label": "",
                "dir": "R"
            }
        ]
    },
    "fulladder": {
        "name": "fulladder",
        "displayName": "FULL ADDER (one digit numbers)",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "x": 49.0,
            "y": 12.0,
            "dir": "R"
        },
        "flippable": false,
        "previewArgs": {
            "3": "0",
            "6": "right"
        },
        "argDefs": [
            {
                "idx": 3,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            },
            {
                "idx": 6,
                "type": "select",
                "label": "arrow direction",
                "defVal": "right",
                "options": "right, left"
            }
        ],
        "iconBase": "M 0 0 L 80 0 L 80 -80 L 0 -80 Z M 60 -100 L 60 -80 M 20 -100 L 20 -80 M -20 -40 L 0 -40 M 80 -40 L 100 -40 M 40 0 L 40 20 M 20 -70 L 20 -70 /*TEXT:10,normal,B*/ M 60 -70 L 60 -70 /*TEXT:10,normal,A*/ M 40 -10 L 40 -10 /*TEXT:10,normal,S*/",
        "filled": false,
        "iconLayers": [
            {
                "condition": "6==right",
                "style": "",
                "path": "M 10 -40 L 10 -40 /*TEXT:10,normal,Ci*/ M 70 -40 L 70 -40 /*TEXT:10,normal,Co*/"
            },
            {
                "condition": "6==left",
                "style": "",
                "path": "M 10 -40 L 10 -40 /*TEXT:10,normal,Co*/ M 70 -40 L 70 -40 /*TEXT:10,normal,Ci*/"
            },
            {
                "condition": "6==right",
                "style": "rounded=true",
                "path": "M 92.75 -37.75 L 97.25 -40.25 L 92.75 -42.75 L 96.75 -40.25 M 17.50 -85 L 20 -80.50 L 22.50 -85 L 20 -81 M 57.50 -85.50 L 60 -81 L 62.50 -85.50 L 60 -81.50 M 37.50 12.50 L 40 17 L 42.50 12.50 L 40 16.50 M -6.75 -37.75 L -2.25 -40.25 L -6.75 -42.75 L -2.75 -40.25"
            },
            {
                "condition": "6==left",
                "style": "rounded=true",
                "path": "M 87.25 -37.75 L 82.75 -40.25 L 87.25 -42.75 L 83.25 -40.25 M 17.50 -85 L 20 -80.50 L 22.50 -85 L 20 -81 M 57.50 -85.50 L 60 -81 L 62.50 -85.50 L 60 -81.50 M 37.50 12.50 L 40 17 L 42.50 12.50 L 40 16.50 M -12.25 -37.75 L -16.75 -40.25 L -12.25 -42.75 L -16.25 -40.25"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            },
            {
                "name": "right/left",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin4",
                "x": -20.0,
                "y": -40.0,
                "label": "ci",
                "dir": "R"
            },
            {
                "id": "pin5",
                "x": 100.0,
                "y": -40.0,
                "label": "co",
                "dir": "R"
            },
            {
                "id": "pin4",
                "x": -20.0,
                "y": -40.0,
                "label": "co",
                "dir": "R"
            },
            {
                "id": "pin5",
                "x": 100.0,
                "y": -40.0,
                "label": "ci",
                "dir": "R"
            },
            {
                "id": "pin1",
                "x": 60.0,
                "y": -100.0,
                "label": "a",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 20.0,
                "y": -100.0,
                "label": "b",
                "dir": "R"
            },
            {
                "id": "pin3",
                "x": 40.0,
                "y": 20.0,
                "label": "s",
                "dir": "R"
            }
        ]
    },
    "fullsubtractor": {
        "name": "fullsubtractor",
        "displayName": "FULL SUBTRACTOR (one digit numbers)",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "x": 49.0,
            "y": 12.0,
            "dir": "R"
        },
        "flippable": false,
        "previewArgs": {
            "3": "0",
            "6": "right"
        },
        "argDefs": [
            {
                "idx": 3,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            },
            {
                "idx": 6,
                "type": "select",
                "label": "arrow direction",
                "defVal": "right",
                "options": "right, left"
            }
        ],
        "iconBase": "M 0 0 L 80 0 L 80 -80 L 0 -80 Z M 60 -100 L 60 -80 M 20 -100 L 20 -80 M -20 -40 L 0 -40 M 80 -40 L 100 -40 M 40 0 L 40 20 M 20 -70 L 20 -70 /*TEXT:10,normal,B*/ M 60 -70 L 60 -70 /*TEXT:10,normal,A*/ M 40 -10 L 40 -10 /*TEXT:10,normal,S*/",
        "filled": false,
        "iconLayers": [
            {
                "condition": "6==right",
                "style": "",
                "path": "M 10 -40 L 10 -40 /*TEXT:10,normal,Ci*/ M 70 -40 L 70 -40 /*TEXT:10,normal,Co*/"
            },
            {
                "condition": "6==left",
                "style": "",
                "path": "M 10 -40 L 10 -40 /*TEXT:10,normal,Co*/ M 70 -40 L 70 -40 /*TEXT:10,normal,Ci*/"
            },
            {
                "condition": "6==right",
                "style": "rounded=true",
                "path": "M 92.75 -37.75 L 97.25 -40.25 L 92.75 -42.75 L 96.75 -40.25 M 17.50 -85 L 20 -80.50 L 22.50 -85 L 20 -81 M 57.50 -85.50 L 60 -81 L 62.50 -85.50 L 60 -81.50 M 37.50 12.50 L 40 17 L 42.50 12.50 L 40 16.50 M -6.75 -37.75 L -2.25 -40.25 L -6.75 -42.75 L -2.75 -40.25"
            },
            {
                "condition": "6==left",
                "style": "rounded=true",
                "path": "M 87.25 -37.75 L 82.75 -40.25 L 87.25 -42.75 L 83.25 -40.25 M 17.50 -85 L 20 -80.50 L 22.50 -85 L 20 -81 M 57.50 -85.50 L 60 -81 L 62.50 -85.50 L 60 -81.50 M 37.50 12.50 L 40 17 L 42.50 12.50 L 40 16.50 M -12.25 -37.75 L -16.75 -40.25 L -12.25 -42.75 L -16.25 -40.25"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            },
            {
                "name": "right/left",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin4",
                "x": -20.0,
                "y": -40.0,
                "label": "bi",
                "dir": "R"
            },
            {
                "id": "pin5",
                "x": 100.0,
                "y": -40.0,
                "label": "bo",
                "dir": "R"
            },
            {
                "id": "pin4",
                "x": -20.0,
                "y": -40.0,
                "label": "bo",
                "dir": "R"
            },
            {
                "id": "pin5",
                "x": 100.0,
                "y": -40.0,
                "label": "bi",
                "dir": "R"
            },
            {
                "id": "pin1",
                "x": 60.0,
                "y": -100.0,
                "label": "A",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 20.0,
                "y": -100.0,
                "label": "B",
                "dir": "R"
            },
            {
                "id": "pin3",
                "x": 40.0,
                "y": 20.0,
                "label": "d",
                "dir": "R"
            }
        ]
    },
    "dipic": {
        "name": "dipic",
        "displayName": "DIP INTEGRATED CIRCUIT",
        "argsCount": 7,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "previewArgs": {
            "4": "14",
            "5": "7404"
        },
        "argDefs": [
            {
                "idx": 3,
                "type": "rotation",
                "label": "Rotation",
                "defVal": "0"
            },
            {
                "idx": 4,
                "type": "text",
                "label": "Number of Pins",
                "defVal": "14"
            },
            {
                "idx": 5,
                "type": "text",
                "label": "IC Code",
                "defVal": "7404"
            }
        ],
        "shapeGenerator": "\nlet n = parseInt(args[4]);\nif (isNaN(n) || n < 4) n = 14;\nlet pinsPerSide = Math.ceil(n / 2);\nlet w = 1 + pinsPerSide;\nlet tikz = new TikZBuilder();\n\n// Body\ntikz.rect(1, 1, 1 + w, 5);\n\n// Notch (Orientation Mark left side)\ntikz.path += `M ${tikz.pt(1, 3.75)} A ${0.75*10} ${0.75*10} 0 0 1 ${tikz.pt(1, 2.25)} Z `;\n\n// Pins\nfor(let i=1; i<=pinsPerSide; i++) {\nlet px = 1 + i;\ntikz.draw(px, 0).to(px, 1);\ntikz.pin('pin1.' + i, px, 0, 'B', i.toString());\n\nlet topPinNum = (n + 1) - i;\nif (topPinNum > pinsPerSide) {\ntikz.draw(px, 5).to(px, 6);\ntikz.pin('pin2.' + i, px, 6, 'T', topPinNum.toString());\n}\n}\n\n// Labels\nlet code = args[5] || \"\";\nlet name = args[2] || \"\";\nlet centerX = 1 + (w / 2);\nif (name) {\ntikz.text(centerX, 3, name, 12, 'bold');\ntikz.text(centerX, 2, code, 10, 'normal');\n} else {\ntikz.text(centerX, 3, code, 12, 'bold');\n}\n\nreturn tikz.export();",
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "number of pins",
                "optional": false
            },
            {
                "name": "code",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": []
    },
    "connectordot": {
        "name": "connectordot",
        "displayName": "Connector Dot",
        "argsCount": 1,
        "enabled": "true",
        "argNames": [
            {
                "name": "position",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            }
        ]
    },
    "freetext": {
        "name": "freetext",
        "displayName": "Free Text",
        "argsCount": 6,
        "enabled": "true",
        "icon": "M -10 -10 L 10 -10 M 0 -10 L 0 10",
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "text",
                "optional": false
            },
            {
                "name": "rotation",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": []
    },
    "resistorcds": {
        "name": "resistorcds",
        "displayName": "Resistor - Virtuoso",
        "argsCount": 7,
        "enabled": "true",
        "category": "Virtuoso",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "x": 40.0,
            "y": 7.0,
            "dir": "B"
        },
        "flippable": false,
        "previewArgs": {
            "4": "fixed"
        },
        "spiceTemplate": "R_{NAME} {pin1} {pin2} {VALUE}",
        "argDefs": [
            {
                "idx": 3,
                "type": "select",
                "label": "horizontal/vertical",
                "defVal": "horizontal",
                "options": "horizontal, vertical, none"
            },
            {
                "idx": 4,
                "type": "select",
                "label": "fixed/variable",
                "defVal": "fixed",
                "options": "fixed,variable"
            },
            {
                "idx": 5,
                "type": "rotflip",
                "label": "Rotation & Flip",
                "defVal": "0,none"
            }
        ],
        "iconBase": "M 10 0 L 15 -10 M 15 -10 L 25 10 M 25 10 L 35 -10 M 35 -10 L 45 10 M 50 0 L 45 9.5",
        "iconBaseStyle": "stroke-width=2.8, rounded=true",
        "filled": false,
        "iconLayers": [
            {
                "condition": "4==variable",
                "style": "stroke-width=2.3, rounded=true",
                "path": "M 33.33 -21.32 L 27.41 -17.44 L 33.33 -21.32 L 34.47 -14.13 M 13.50 16.50 L 32.50 -19.50"
            },
            {
                "condition": "1~=",
                "style": "rounded=true",
                "path": "M 0 0 L 8.50 0 M 60 0 L 50 0 M 0 0 L 10 -0.20 M 60 0 L 50 0.40 M 60 0 L 50 -0.40 M 60 0 L 50 0.40 M 0 0 L 10 0.40"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "horizontal/vertical/empty",
                "optional": false
            },
            {
                "name": "fixed/variable",
                "optional": false
            },
            {
                "name": "rotation,flip(h, v, hv, or none)",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 60.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            }
        ]
    },
    "inductorcds": {
        "name": "inductorcds",
        "displayName": "Inductor - Virtuoso",
        "argsCount": 7,
        "enabled": "true",
        "category": "Virtuoso",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "x": 40.0,
            "y": 0.0,
            "dir": "B"
        },
        "flippable": false,
        "spiceTemplate": "L_{NAME} {pin1} {pin2} {VALUE}",
        "previewArgs": {
            "4": "fixed"
        },
        "argDefs": [
            {
                "idx": 3,
                "type": "select",
                "label": "horizontal/vertical",
                "defVal": "horizontal",
                "options": "horizontal, vertical, none"
            },
            {
                "idx": 4,
                "type": "select",
                "label": "fixed/variable",
                "defVal": "fixed",
                "options": "fixed, variable"
            },
            {
                "idx": 5,
                "type": "rotflip",
                "label": "Rotation & Flip",
                "defVal": "0,none"
            }
        ],
        "iconBase": "M 0 0 L 10 0 A 4.5 4.5 0 0 1 23.5 0 A 4.5 4.5 0 0 1 37 0 A 4.5 4.5 0 0 1 50 0 L 60 0",
        "iconBaseStyle": "stroke-width=2.7",
        "filled": false,
        "iconLayers": [
            {
                "condition": "4==variable",
                "style": "stroke-width=2.3, rounded=true",
                "path": "M 25 10 L 53 -19 M 53 -19 L 46 -18 L 53 -19 L 51 -12"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "horizontal/vertical/empty",
                "optional": false
            },
            {
                "name": "fixed/variable",
                "optional": false
            },
            {
                "name": "rotation,flip(h, v, hv, or none)",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 60.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            }
        ]
    },
    "capacitorcds": {
        "name": "capacitorcds",
        "displayName": "Capacitor - Virtuoso",
        "argsCount": 7,
        "enabled": "true",
        "category": "Virtuoso",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "B"
        },
        "flippable": false,
        "spiceTemplate": "C_{NAME} {pin1} {pin2} {VALUE}",
        "previewArgs": {
            "3": "fixed",
            "4": "none"
        },
        "argDefs": [
            {
                "idx": 3,
                "type": "select",
                "label": "horizontal/vertical",
                "defVal": "horizontal",
                "options": "horizontal, vertical, none"
            },
            {
                "idx": 3,
                "type": "select",
                "label": "fixed/variable",
                "defVal": "fixed",
                "options": "fixed, variable"
            },
            {
                "idx": 4,
                "type": "select",
                "label": "sign",
                "defVal": "none",
                "options": "plus, minus, none"
            },
            {
                "idx": 5,
                "type": "rotflip",
                "label": "Rotation & Flip",
                "defVal": "0,none"
            }
        ],
        "iconBase": "M 0 0 L 16 0 M 24 0 L 40 0 M 0 0 L -10 0 M 40 0 L 50 0",
        "filled": false,
        "iconLayers": [
            {
                "condition": "3~=variable",
                "style": "stroke-width=1.3, rounded=true",
                "path": "M 27.770000000000003 -15.34 L 34.84 -15.34 L 34.84 -8.27 L 34.84 -15.34 M 35 -15 L 8 8.5"
            },
            {
                "condition": "4==plus",
                "style": "stroke-width=0.9",
                "path": "M 12 -12 L 12 -8 M 10 -10 L 14 -10"
            },
            {
                "condition": "4==minus",
                "style": "stroke-width=0.9",
                "path": "M 10 -10 L 14 -10"
            },
            {
                "condition": "1~=",
                "style": "stroke-width=2.9",
                "path": "M 16 -15 L 16 15 M 24 -15 L 24 15"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "horizontal/vertical/empty-fixed/variable",
                "optional": false
            },
            {
                "name": "plus/minus/none",
                "optional": false
            },
            {
                "name": "rotation,flip(h, v, hv, or none)",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": -10.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 50.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            }
        ]
    },
    "mostransistorcds": {
        "name": "mostransistorcds",
        "displayName": "MOS Transistor - Virtuoso",
        "argsCount": 7,
        "enabled": "true",
        "category": "Virtuoso",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "x": -10.0,
            "y": -25.0,
            "dir": "L"
        },
        "flippable": true,
        "previewArgs": {
            "3": "n",
            "4": "case, arrow"
        },
        "spiceTemplate": "M_{NAME} {D} {G} {S} 0 {MODEL} W={W} L={L}",
        "argDefs": [
            {
                "idx": 3,
                "type": "select",
                "label": "n/p",
                "defVal": "n",
                "options": "n,p"
            },
            {
                "idx": 4,
                "type": "flags",
                "label": "terminal names / case",
                "defVal": "",
                "options": "terminals, case"
            },
            {
                "idx": 4,
                "type": "select",
                "label": "dot/arrow notation",
                "defVal": "arrow",
                "options": "dot, arrow"
            },
            {
                "idx": 5,
                "type": "rotflip",
                "label": "Rotation & Flip",
                "defVal": "0,none"
            }
        ],
        "iconBase": "M -2 -20 L -2 20 M -30 0 L -18 0 M 10 -30 L 10 -15 L -2 -15 M -2 15 L 10 15 L 10 30",
        "filled": false,
        "iconLayers": [
            {
                "condition": "1~=",
                "style": "stroke-width=3.3",
                "path": "M -10 -15 L -10 15"
            },
            {
                "condition": "3==n",
                "style": "",
                "path": "M -18 0 L -10 0"
            },
            {
                "condition": "3==n && 4~=arrow",
                "style": "rounded=true",
                "path": "M 10 15 L 6 12 L 10 15 L 6 18"
            },
            {
                "condition": "3==p && 4~=arrow",
                "style": "rounded=true",
                "path": "M -2 15 L 2 12 L -2 15 L 2 18"
            },
            {
                "condition": "3==p && 4~=arrow",
                "style": "",
                "path": "M -18 0 L -10 0"
            },
            {
                "condition": "3==p && 4~=dot",
                "style": "",
                "path": "M -15 0 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M -12 0 L -10 0"
            },
            {
                "condition": "4~=case",
                "style": "",
                "path": "M 0 0 m -25 0 a 25 25 0 1 0 50 0 a 25 25 0 1 0 -50 0"
            },
            {
                "condition": "4~=terminals",
                "style": "",
                "path": "M -31 6 L -31 6 /*TEXT:10,normal,G*/ M 15 -30 L 15 -30 /*TEXT:10,normal,D*/ M 15.50 27 L 15.50 27 /*TEXT:10,normal,S*/"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "n/p",
                "optional": false
            },
            {
                "name": "terminals, case, dot, arrow",
                "optional": false
            },
            {
                "name": "rotation,flip(h, v, hv, or none)",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": -30.0,
                "y": -0.0,
                "label": "gate",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 10.0,
                "y": -30.0,
                "label": "drain",
                "dir": "R"
            },
            {
                "id": "pin3",
                "x": 10.0,
                "y": 30.0,
                "label": "source",
                "dir": "R"
            }
        ]
    },
    "testprobe": {
        "name": "testprobe",
        "displayName": "Test Probe",
        "argsCount": 5,
        "enabled": "true",
        "category": "Simulation/Solvers",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "auto": true,
            "dir": "T"
        },
        "flippable": false,
        "spiceTemplate": "I_PROBE_{NAME} {pin1} 0 DC 0",
        "previewArgs": {
            "3": "0,none"
        },
        "argDefs": [
            {
                "idx": 3,
                "type": "rotflip",
                "label": "Rotation & Flip",
                "defVal": "0,none"
            }
        ],
        "iconBase": "M 0 -15 L 0 0",
        "iconBaseStyle": "stroke=#0924f1",
        "filled": false,
        "iconLayers": [
            {
                "condition": "1~=",
                "style": "stroke=#0421fb, fill=solid, rounded=true",
                "path": "M 0 -38.50 L -12 -26.50 L 0 -14.50 L 12 -26.50 Z"
            },
            {
                "condition": "1~=",
                "style": "stroke=#ffffff",
                "path": "M -5 -30 L 5 -30 M 0 -20 L 0 -30"
            }
        ],
        "argNames": [
            {
                "name": "position",
                "optional": false
            },
            {
                "name": "name",
                "optional": false
            },
            {
                "name": "rotation,flip(h, v, hv, or none)",
                "optional": false
            },
            {
                "name": "grid",
                "optional": false
            },
            {
                "name": "show (0,0)",
                "optional": false
            }
        ],
        "pins": [
            {
                "id": "pin1",
                "x": 0.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            }
        ]
    }
};