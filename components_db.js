const JL_DATABASE = {
    "mechanicalswitch": {
        "name": "mechanicalswitch",
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
        "argDefs": [
            {
                "idx": 3,
                "type": "select",
                "label": "state1/state2",
                "defVal": "state1",
                "options": "state1, state2"
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
                "label": "control_terminal",
                "defVal": ""
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
                "y": -15.0,
                "label": "",
                "dir": "T"
            }
        ]
    },
    "controlledswitchbox": {
        "name": "controlledswitchbox",
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
            "4": "n"
        },
        "argDefs": [
            {
                "idx": 4,
                "type": "select",
                "label": "control value",
                "defVal": "n",
                "options": "n,p"
            },
            {
                "idx": 4,
                "type": "select",
                "label": "n/p",
                "defVal": "",
                "options": ""
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
            "y": 15.0,
            "dir": "B"
        },
        "flippable": false,
        "previewArgs": {
            "4": "standard"
        },
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
            "y": 15.0,
            "dir": "B"
        },
        "flippable": false,
        "previewArgs": {
            "4": "standard"
        },
        "iconBase": "M -30 0 L -20 0  M 20 0 L 30 0  M -10 0 L 10 0  M 10 0 L 3 -5 L 10 0 L 3 5",
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
            "x": 0.0,
            "y": 10.0,
            "dir": "B"
        },
        "flippable": false,
        "previewArgs": {
            "4": "on"
        },
        "iconBase": "M -15 -5 a 15 15 0 1 0 30 6 a 15 15 0 1 0 -30 -6   M -20 20 L -20 9 L -12 9 L -7 -6 L -10 -6 L -6 5 L -8 5 L -2 -6 L -4 -6 L 0 5 L -2 5 L 4 -6 L 2 -6 L 6 5 L 4 5 L 9 -6 L 7 -6 L 12 9   M 20 20 L 20 8 L 11.5 8 L 20.5 8",
        "filled": false,
        "iconLayers": [
            {
                "condition": "4==on",
                "style": "stroke-width=2.5",
                "path": "M 17 0 L 22 0    M -17 0 L -22 0    M 15 -13 L 20 -19    M 0 -20 L 0 -24    M -14.5 -13 L -19.5 -19"
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
            "x": 0.0,
            "y": 15.0,
            "dir": "B"
        },
        "flippable": false,
        "previewArgs": {
            "4": "sine"
        },
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
    "multimeter": {
        "name": "multimeter",
        "argsCount": 7,
        "enabled": "true",
        "category": "Basic Components",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "x": 0.0,
            "y": 15.0,
            "dir": "B"
        },
        "flippable": false,
        "iconBase": "M 0 0 m -20 0 a 20 20 0 1 0 40 0 a 20 20 0 1 0 -40 0   M -30 0 L -20 0   M 20 0 L 30 0",
        "filled": false,
        "iconLayers": [
            {
                "condition": "1~=",
                "style": "stroke-width=2.5",
                "path": "M -16 -3 A 17 17 0 0 1 16 -3"
            },
            {
                "condition": "1~=",
                "style": "stroke-width=2.5",
                "path": "M 0 10 L 0 -10"
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
        "previewArgs": {
            "4": "fixed"
        },
        "iconBase": "M 10 0 L 15 -10 L 25 10 L 35 -10 L 45 10 L 55 -10 L 65 10 L 70 0",
        "iconBaseStyle": "stroke-width=2.8",
        "filled": false,
        "iconLayers": [
            {
                "condition": "4==variable",
                "style": "stroke-width=2.3, rounded=true",
                "path": "M 48.33 -21.32 L 42.41 -17.44 L 48.33 -21.32 L 49.47 -14.13           M 28.5 16.5 L 47.5 -19.5"
            },
            {
                "condition": "1~=",
                "style": "",
                "path": "M 0 0 L 11.5 0 M 80 0 L 68.5 0"
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
        "previewArgs": {
            "4": "fixed"
        },
        "iconBase": "M 0 0 L 10 0 A 7.5 7.5 0 0 1 25 0 A 7.5 7.5 0 0 1 40 0 A 7.5 7.5 0 0 1 55 0 A 7.5 7.5 0 0 1 70 0 L 80 0",
        "iconBaseStyle": "stroke-width=2.7",
        "filled": false,
        "iconLayers": [
            {
                "condition": "4==variable",
                "style": "stroke-width=2.3, rounded=true",
                "path": "M 25 10 L 53 -19    M 53 -19 L 46 -18 L 53 -19 L 51 -12"
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
        "argsCount": 7,
        "enabled": "true",
        "category": "Passives",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "x": 20.0,
            "y": 7.0,
            "dir": "B"
        },
        "flippable": false,
        "previewArgs": {
            "3": "fixed",
            "4": "none"
        },
        "iconBase": "M 0 0 L 16 0  M 24 0 L 40 0",
        "filled": false,
        "iconLayers": [
            {
                "condition": "3~=variable",
                "style": "stroke-width=1.3, rounded=true",
                "path": "M 27.770000000000003 -15.34 L 34.84 -15.34 L 34.84 -8.27 L 34.84 -15.34      M 35 -15 L 8 8.5"
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
                "path": "M 16 -15 L 16 15  M 24 -15 L 24 15"
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
            "y": 5.0,
            "dir": "B"
        },
        "flippable": false,
        "iconBase": "M 0 0 L 16 0  M 16 -15 L 16 15  M 24 0 L 40 0",
        "filled": false,
        "iconLayers": [
            {
                "condition": "3~=variable",
                "style": "rounded=true",
                "path": "M 8.5 13 L 28.5 -11  M 30 -12 L 24 -11 L 30 -12 L 28 -6"
            },
            {
                "condition": "4==plus",
                "style": "stroke-width=1.1, rounded=true",
                "path": "M 12 -12 L 12 -8 M 10 -10 L 14 -10"
            },
            {
                "condition": "1~=",
                "style": "stroke-width=2.8",
                "path": "M 24 -7 L 24 7"
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
        "argsCount": 7,
        "enabled": "true",
        "category": "Sources",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "x": 0.5,
            "y": 7.0,
            "dir": "B"
        },
        "flippable": false,
        "iconBase": "M -30 0 L -10 0 M -10 -15 L -10 15 M 0 -7 L 0 7 M 0 0 L 10 0 M 10 -15 L 10 15 M 20 -7 L 20 7 M 20 0 L 40 0",
        "filled": false,
        "iconLayers": [
            {
                "condition": "3~=variable",
                "style": "stroke-width=1.6, rounded=true",
                "path": "M 20 -17 L 14 -16 L 20 -17 L 18 -11 M 19.5 -16.5 L -17 14"
            },
            {
                "condition": "4==plus",
                "style": "stroke-width=0.8",
                "path": "M -14 -12 L -14 -8 M -16 -10 L -12 -10"
            },
            {
                "condition": "1~=",
                "style": "stroke-width=3.2, rounded=true",
                "path": "M 0 -7 L 0 7       M 20 -7 L 20 7"
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
        "argsCount": 7,
        "enabled": "true",
        "category": "Active Components",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "x": -16.0,
            "y": -10.0,
            "dir": "L"
        },
        "flippable": false,
        "previewArgs": {
            "3": "n",
            "4": "case"
        },
        "iconBase": "M -40 0 L -10 0     M -10 -5 L 10 -25 L 10 -40     M -10 5 L 10 25 L 10 40     M -10 -5 L 10 -25 L 10 -40     M -10 5 L 10 25 L 10 40",
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
        "previewArgs": {
            "3": "n",
            "4": "case-arrow"
        },
        "argDefs": [
            {
                "idx": 3,
                "type": "select",
                "label": "nMOS/pMOS",
                "defVal": "n",
                "options": "n,p"
            },
            {
                "idx": 4,
                "type": "flags",
                "label": "",
                "defVal": "case-arrow",
                "options": "terminals, case, dot, arrow"
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
                "condition": "3==p",
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
                "name": "terminals-case-dot-arrow",
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
                "label": "gate",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 10.0,
                "y": -40.0,
                "label": "drain",
                "dir": "R"
            },
            {
                "id": "pin3",
                "x": 10.0,
                "y": 40.0,
                "label": "source",
                "dir": "R"
            }
        ]
    },
    "passgate": {
        "name": "passgate",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "x": -15.0,
            "y": -25.0,
            "dir": "L"
        },
        "flippable": false,
        "previewArgs": {
            "3": "normal"
        },
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
            }
        ]
    },
    "opamplifier": {
        "name": "opamplifier",
        "argsCount": 7,
        "enabled": "true",
        "category": "Active Components",
        "scales": [
            1,
            2,
            4
        ],
        "labelAnchor": {
            "x": 110.0,
            "y": 20.0,
            "dir": "R"
        },
        "flippable": false,
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
                "label": "non-inverting input",
                "dir": "R"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": 20.0,
                "label": "inverting input",
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
                "label": "",
                "dir": "R"
            },
            {
                "id": "-$4",
                "x": 60.0,
                "y": 50.0,
                "label": "",
                "dir": "R"
            }
        ]
    },
    "diode": {
        "name": "diode",
        "argsCount": 6,
        "enabled": "true",
        "category": "Diodes",
        "icon": "M 0 0 L 15 0 M 15 -15 L 15 15 L 35 0 Z M 35 -15 L 35 15 M 35 0 L 50 0",
        "flippable": false,
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
        "argsCount": 6,
        "enabled": "true",
        "category": "Diodes",
        "icon": "M 0 0 L 15 0 M 15 -15 L 15 15 L 35 0 Z M 30 -15 L 35 -15 L 35 15 L 40 15 M 35 0 L 50 0",
        "flippable": false,
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
        "argsCount": 6,
        "enabled": "true",
        "category": "Diodes",
        "icon": "M 0 0 L 15 0 M 15 -15 L 15 15 L 35 0 Z M 35 -15 L 35 15 M 35 0 L 50 0 M 10 -20 L 20 -30 M 15 -30 L 20 -30 L 20 -25 M 15 -20 L 25 -30 M 20 -30 L 25 -30 L 25 -25",
        "flippable": false,
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
        "argsCount": 6,
        "enabled": "true",
        "category": "Diodes",
        "icon": "M 0 0 L 15 0 M 15 -15 L 15 15 L 35 0 Z M 35 -15 L 35 15 M 35 0 L 50 0 M 20 -30 L 10 -20 M 10 -25 L 10 -20 L 15 -20 M 25 -30 L 15 -20 M 15 -25 L 15 -20 L 20 -20",
        "flippable": false,
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
        "argsCount": 5,
        "enabled": "true",
        "category": "Terminals",
        "icon": "M 0 10 L 0 0 M -15 0 L 15 0",
        "flippable": false,
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
        "argsCount": 6,
        "enabled": "true",
        "category": "Terminals",
        "icon": "M 0 0 L 5 0 M 11 0 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0",
        "flippable": false,
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
                "id": "pin1",
                "x": 0.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "pin1",
                "x": 10.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "pin1",
                "x": 0.0,
                "y": -0.0,
                "label": "",
                "dir": "R"
            },
            {
                "id": "pin1",
                "x": 0.0,
                "y": -10.0,
                "label": "",
                "dir": "R"
            }
        ]
    },
    "andthree": {
        "name": "andthree",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "scales": [
            1,
            2,
            4
        ],
        "icon": "M 0 -30 L 16 -30 M 0 -20 L 16 -20 M 0 -10 L 16 -10 M 16 -40 L 40 -40 C 55 -40 60 -20 60 -20 C 60 -20 55 0 40 0 L 16 0 Z M 60 -20 L 70 -20",
        "flippable": false,
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
    "nandthree": {
        "name": "nandthree",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "icon": "M 0 -30 L 16 -30 M 0 -20 L 16 -20 M 0 -10 L 16 -10 M 16 -40 L 35 -40 C 45 -40 55 -20 55 -20 C 55 -20 45 0 35 0 L 16 0 Z M 59 -20 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0 M 63 -20 L 70 -20",
        "flippable": false,
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
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "icon": "M 0 -30 L 16 -30 M 0 -10 L 16 -10 M 16 -40 L 40 -40 C 55 -40 60 -20 60 -20 C 60 -20 55 0 40 0 L 16 0 Z M 60 -20 L 70 -20",
        "flippable": false,
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
    "nandtwo": {
        "name": "nandtwo",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "icon": "M 0 -30 L 16 -30 M 0 -10 L 16 -10 M 16 -40 L 35 -40 C 45 -40 55 -20 55 -20 C 55 -20 45 0 35 0 L 16 0 Z M 59 -20 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0 M 63 -20 L 70 -20",
        "flippable": false,
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
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "icon": "M 0 -30 L 16 -30 M 0 -20 L 18 -20 M 0 -10 L 16 -10 M 10 -40 Q 25 -20 10 0 C 35 0 50 -10 60 -20 C 50 -30 35 -40 10 -40 Z M 60 -20 L 70 -20",
        "flippable": false,
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
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "icon": "M 0 -30 L 16 -30 M 0 -20 L 18 -20 M 0 -10 L 16 -10 M 10 -40 Q 25 -20 10 0 C 35 0 45 -10 50 -20 C 45 -30 35 -40 10 -40 Z M 55 -20 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 M 60 -20 L 70 -20",
        "flippable": false,
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
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "icon": "M 0 -30 L 16 -30 M 0 -10 L 16 -10 M 10 -40 Q 25 -20 10 0 C 35 0 50 -10 60 -20 C 50 -30 35 -40 10 -40 Z M 60 -20 L 70 -20",
        "flippable": false,
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
    "nortwo": {
        "name": "nortwo",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "icon": "M 0 -30 L 16 -30 M 0 -10 L 16 -10 M 10 -40 Q 25 -20 10 0 C 35 0 45 -10 50 -20 C 45 -30 35 -40 10 -40 Z M 55 -20 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 M 60 -20 L 70 -20",
        "flippable": false,
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
    "xortwo": {
        "name": "xortwo",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "icon": "M 0 -30 L 13 -30 M 0 -10 L 13 -10 M 5 -40 Q 20 -20 5 0 M 15 -40 Q 30 -20 15 0 C 40 0 50 -10 60 -20 C 50 -30 40 -40 15 -40 Z M 60 -20 L 70 -20",
        "flippable": false,
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
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "icon": "M 0 -30 L 13 -30 M 0 -10 L 13 -10 M 5 -40 Q 20 -20 5 0 M 15 -40 Q 30 -20 15 0 C 40 0 45 -10 50 -20 C 45 -30 40 -40 15 -40 Z M 55 -20 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 M 60 -20 L 70 -20",
        "flippable": false,
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
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "icon": "M 0 -20 L 15 -20 M 15 0 L 15 -40 L 35 -20 Z M 39 -20 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0 M 43 -20 L 50 -20",
        "flippable": false,
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
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "icon": "M 0 -10 L 10 -10 M 10 -20 L 10 0 L 30 -10 Z M 34 -10 m -4 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 34 -10 L 40 -10",
        "flippable": false,
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
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "icon": "M 0 -20 L 15 -20 M 15 0 L 15 -40 L 40 -20 Z M 40 -20 L 50 -20",
        "flippable": false,
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
        "argsCount": 7,
        "enabled": "true",
        "category": "Digital/Logic",
        "icon": "M 10 0 L 60 0 L 60 -100 L 10 -100 Z M 0 -80 L 10 -80 M 0 -20 L 10 -20 M 0 -50 L 10 -50 M 10 -45 L 15 -50 L 10 -55 M 60 -80 L 70 -80 M 60 -20 L 70 -20 M 35 0 L 35 10",
        "flippable": false,
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
                "dir": "R"
            },
            {
                "id": "pin4",
                "x": 35.0,
                "y": 10.0,
                "label": "clr",
                "dir": "R"
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
            }
        ]
    },
    "srlatch": {
        "name": "srlatch",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "icon": "M 10 0 L 60 0 L 60 -100 L 10 -100 Z M 0 -80 L 10 -80 M 0 -20 L 10 -20 M 0 -50 L 10 -50 M 60 -80 L 70 -80 M 60 -20 L 70 -20",
        "flippable": false,
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
                "dir": "R"
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
        "argsCount": 7,
        "enabled": "true",
        "category": "Digital/Logic",
        "icon": "M 10 0 L 60 0 L 60 -100 L 10 -100 Z M 0 -80 L 10 -80 M 0 -20 L 10 -20 M 0 -50 L 10 -50 M 10 -45 L 15 -50 L 10 -55 M 60 -80 L 70 -80 M 60 -20 L 70 -20 M 35 0 L 35 10",
        "flippable": false,
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
                "dir": "R"
            },
            {
                "id": "pin4",
                "x": 35.0,
                "y": 10.0,
                "label": "clr",
                "dir": "R"
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
            }
        ]
    },
    "dflipflop": {
        "name": "dflipflop",
        "argsCount": 7,
        "enabled": "true",
        "category": "Digital/Logic",
        "icon": "M 10 0 L 60 0 L 60 -100 L 10 -100 Z M 0 -80 L 10 -80 M 0 -20 L 10 -20 M 10 -15 L 15 -20 L 10 -25 M 60 -80 L 70 -80 M 60 -20 L 70 -20 M 35 0 L 35 10",
        "flippable": false,
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
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "icon": "M 10 0 L 60 0 L 60 -70 L 10 -70 Z M 0 -50 L 10 -50 M 0 -20 L 10 -20 M 60 -50 L 70 -50 M 60 -20 L 70 -20",
        "flippable": false,
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
                "y": -20.0,
                "label": "E",
                "dir": "R"
            },
            {
                "id": "pin1",
                "x": 0.0,
                "y": -50.0,
                "label": "D",
                "dir": "R"
            },
            {
                "id": "pin3",
                "x": 70.0,
                "y": -50.0,
                "label": "Q",
                "dir": "R"
            },
            {
                "id": "pin4",
                "x": 70.0,
                "y": -20.0,
                "label": "Qn",
                "dir": "R"
            }
        ]
    },
    "tflipflop": {
        "name": "tflipflop",
        "argsCount": 7,
        "enabled": "true",
        "category": "Digital/Logic",
        "icon": "M 10 0 L 60 0 L 60 -100 L 10 -100 Z M 0 -80 L 10 -80 M 0 -20 L 10 -20 M 10 -15 L 15 -20 L 10 -25 M 60 -80 L 70 -80 M 60 -20 L 70 -20 M 35 0 L 35 10",
        "flippable": false,
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
    "sevensegmentdisplay": {
        "name": "sevensegmentdisplay",
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "icon": "M 0 0 L 80 0 L 80 -100 L 0 -100 Z M 25 -85 L 55 -85 L 55 -75 L 25 -75 Z M 25 -25 L 55 -25 L 55 -15 L 25 -15 Z M 25 -55 L 55 -55 L 55 -45 L 25 -45 Z M 15 -80 L 25 -80 L 25 -50 L 15 -50 Z M 55 -80 L 65 -80 L 65 -50 L 55 -50 Z M 15 -50 L 25 -50 L 25 -20 L 15 -20 Z M 55 -50 L 65 -50 L 65 -20 L 55 -20 Z M 10 0 L 10 10 M 20 0 L 20 10 M 30 0 L 30 10 M 40 0 L 40 10 M 50 0 L 50 10 M 60 0 L 60 10 M 70 0 L 70 10",
        "flippable": false,
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
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "icon": "M 0 0 L 80 0 L 80 -80 L 0 -80 Z M 60 -100 L 60 -80 M 20 -100 L 20 -80 M -20 -40 L 0 -40 M 80 -40 L 100 -40 M 40 0 L 40 20",
        "flippable": false,
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
        "argsCount": 6,
        "enabled": "true",
        "category": "Digital/Logic",
        "icon": "M 0 0 L 80 0 L 80 -80 L 0 -80 Z M 60 -100 L 60 -80 M 20 -100 L 20 -80 M -20 -40 L 0 -40 M 80 -40 L 100 -40 M 40 0 L 40 20",
        "flippable": false,
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
    "connectordot": {
        "name": "connectordot",
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
    }
};