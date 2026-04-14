const JL_DATABASE = {
    "mechanicalswitch": {
        "name": "mechanicalswitch",
        "argsCount": 7,
        "enabled": "true",
        "icon": "M 0 0 L 10 0 M 30 0 L 40 0 M 10 0 L 28 -12",
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
                "label": ""
            },
            {
                "id": "pin2",
                "x": 40.0,
                "y": -0.0,
                "label": ""
            }
        ]
    },
    "mechanicalswitchthreeport": {
        "name": "mechanicalswitchthreeport",
        "argsCount": 6,
        "enabled": "true",
        "icon": "M 0 0 L 10 0 M 0 -20 L 10 -20 M 30 -10 L 40 -10 L 40 0 M 10 -20 L 28 -12",
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
                "label": ""
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -20.0,
                "label": ""
            },
            {
                "id": "pin3",
                "x": 40.0,
                "y": -0.0,
                "label": ""
            }
        ]
    },
    "controlledswitch": {
        "name": "controlledswitch",
        "argsCount": 7,
        "enabled": "true",
        "icon": "M 0 0 L 10 0 M 30 0 L 40 0 M 10 0 L 28 -12 M 15 -20 L 25 -20 M 20 -20 L 20 -5",
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
                "label": ""
            },
            {
                "id": "pin2",
                "x": 40.0,
                "y": -0.0,
                "label": ""
            }
        ]
    },
    "controlledswitchbox": {
        "name": "controlledswitchbox",
        "argsCount": 7,
        "enabled": "true",
        "icon": "M 10 5 L 30 5 L 30 -15 L 10 -15 Z M 0 0 L 10 0 M 30 0 L 40 0 M 15 -20 L 25 -20 M 20 -20 L 20 -15 M 30 0 L 12 -12",
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
                "name": "control value (0/1/other) [place '*' at  end for inverted value",
                "optional": false
            },
            {
                "name": "type (n/p)",
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
                "label": ""
            },
            {
                "id": "pin2",
                "x": 40.0,
                "y": -0.0,
                "label": ""
            }
        ]
    },
    "groundterminal": {
        "name": "groundterminal",
        "argsCount": 5,
        "enabled": "true",
        "icon": "M 0 0 L 0 15 M -15 15 L 15 15 M -10 22 L 10 22 M -5 29 L 5 29",
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
                "label": ""
            }
        ]
    },
    "voltagesource": {
        "name": "voltagesource",
        "argsCount": 7,
        "enabled": "true",
        "icon": "M -30 0 L -20 0 M 20 0 L 30 0 M 0 0 m -20 0 a 20 20 0 1 0 40 0 a 20 20 0 1 0 -40 0 M -12 0 L -4 0 M -8 -4 L -8 4 M 4 0 L 12 0",
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
                "name": "none/controlled",
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
                "label": ""
            },
            {
                "id": "pin2",
                "x": 30.0,
                "y": -0.0,
                "label": ""
            }
        ]
    },
    "currentsource": {
        "name": "currentsource",
        "argsCount": 7,
        "enabled": "true",
        "icon": "M -30 0 L -20 0 M 20 0 L 30 0 M 0 0 m -20 0 a 20 20 0 1 0 40 0 a 20 20 0 1 0 -40 0 M -10 0 L 10 0 M 10 0 L 3 -5 M 10 0 L 3 5",
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
                "name": "none/controlled",
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
                "label": ""
            },
            {
                "id": "pin2",
                "x": 30.0,
                "y": -0.0,
                "label": ""
            }
        ]
    },
    "lamp": {
        "name": "lamp",
        "argsCount": 6,
        "enabled": "true",
        "icon": "M 0 0 m -15 0 a 15 15 0 1 0 30 0 a 15 15 0 1 0 -30 0 M -10 -10 L 10 10 M -10 10 L 10 -10 M -20 20 L -20 0 L -15 0 M 20 20 L 20 0 L 15 0",
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
                "label": ""
            },
            {
                "id": "pin2",
                "x": 20.0,
                "y": 20.0,
                "label": ""
            }
        ]
    },
    "functiongenerator": {
        "name": "functiongenerator",
        "argsCount": 7,
        "enabled": "true",
        "icon": "M 0 0 m -20 0 a 20 20 0 1 0 40 0 a 20 20 0 1 0 -40 0 M -30 0 L -20 0 M 20 0 L 30 0 M -15 0 Q -7.5 -20 0 0 Q 7.5 20 15 0",
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
                "label": ""
            },
            {
                "id": "pin2",
                "x": 30.0,
                "y": -0.0,
                "label": ""
            }
        ]
    },
    "multimeter": {
        "name": "multimeter",
        "argsCount": 7,
        "enabled": "true",
        "icon": "M 0 0 m -20 0 a 20 20 0 1 0 40 0 a 20 20 0 1 0 -40 0 M -30 0 L -20 0 M 20 0 L 30 0 M -16 -3 A 17 17 0 0 1 16 -3 M 0 10 L 0 -10",
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
                "label": ""
            },
            {
                "id": "pin2",
                "x": 30.0,
                "y": -0.0,
                "label": ""
            }
        ]
    },
    "resistor": {
        "name": "resistor",
        "argsCount": 7,
        "enabled": "true",
        "icon": "M 0 0 L 10 0 L 15 -10 L 25 10 L 35 -10 L 45 10 L 55 -10 L 65 10 L 70 0 L 80 0",
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
                "label": ""
            },
            {
                "id": "pin2",
                "x": 80.0,
                "y": -0.0,
                "label": ""
            }
        ]
    },
    "inductor": {
        "name": "inductor",
        "argsCount": 7,
        "enabled": "true",
        "icon": "M 0 0 L 10 0 A 7.5 7.5 0 0 1 25 0 A 7.5 7.5 0 0 1 40 0 A 7.5 7.5 0 0 1 55 0 A 7.5 7.5 0 0 1 70 0 L 80 0",
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
                "label": ""
            },
            {
                "id": "pin2",
                "x": 80.0,
                "y": -0.0,
                "label": ""
            }
        ]
    },
    "capacitor": {
        "name": "capacitor",
        "argsCount": 7,
        "enabled": "true",
        "icon": "M 0 0 L 16 0 M 16 -15 L 16 15 M 24 -15 L 24 15 M 24 0 L 40 0",
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
                "label": ""
            },
            {
                "id": "pin2",
                "x": 40.0,
                "y": -0.0,
                "label": ""
            }
        ]
    },
    "dcvoltagesource": {
        "name": "dcvoltagesource",
        "argsCount": 7,
        "enabled": "true",
        "icon": "M 0 0 L 16 0 M 16 -15 L 16 15 M 24 -7 L 24 7 M 24 0 L 40 0",
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
                "label": ""
            },
            {
                "id": "pin2",
                "x": 40.0,
                "y": -0.0,
                "label": ""
            }
        ]
    },
    "dcbattery": {
        "name": "dcbattery",
        "argsCount": 7,
        "enabled": "true",
        "icon": "M -30 0 L -10 0 M -10 -15 L -10 15 M 0 -7 L 0 7 M 0 0 L 10 0 M 10 -15 L 10 15 M 20 -7 L 20 7 M 20 0 L 40 0",
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
                "label": ""
            },
            {
                "id": "pin2",
                "x": 40.0,
                "y": -0.0,
                "label": ""
            }
        ]
    },
    "bipolartransistor": {
        "name": "bipolartransistor",
        "argsCount": 7,
        "enabled": "true",
        "icon": "M -40 0 L -10 0 M -10 -15 L -10 15 M -10 -5 L 10 -25 L 10 -40 M -10 5 L 10 25 L 10 40 M 10 25 L 4 25 L 8 18 Z M 0 0 m -25 0 a 25 25 0 1 0 50 0 a 25 25 0 1 0 -50 0",
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
                "label": "base"
            },
            {
                "id": "pin2",
                "x": 10.0,
                "y": -40.0,
                "label": "collector"
            },
            {
                "id": "pin3",
                "x": 10.0,
                "y": 40.0,
                "label": "emitter"
            }
        ]
    },
    "mostransistor": {
        "name": "mostransistor",
        "argsCount": 7,
        "enabled": "true",
        "variantArg": 3,
        "icons": {
            "n": "M -40 0 L -10 0 M -10 -15 L -10 15 M -2 -20 L -2 20 M -2 0  M -2 -15 L 10 -15 L 10 -40 M -2 15 L 10 15 L 10 40 M 0 0 m -25 0 a 25 25 0 1 0 50 0 a 25 25 0 1 0 -50 0 M 10 15 L 6 12 M 10 15 L 6 18",
            "p": "M -40 0 L -10 0 M -10 -15 L -10 15 M -2 -20 L -2 20 M -2 0 M -2 -15 L 10 -15 L 10 -40 M -2 15 L 10 15 L 10 40 M 0 0 m -25 0 a 25 25 0 1 0 50 0 a 25 25 0 1 0 -50 0 M -2 15 L 2 12 M -2 15 L 2 18"
        },
        "icon": "M -40 0 L -10 0 M -10 -15 L -10 15 M -2 -20 L -2 20 M -2 0  M -2 -15 L 10 -15 L 10 -40 M -2 15 L 10 15 L 10 40 M 0 0 m -25 0 a 25 25 0 1 0 50 0 a 25 25 0 1 0 -50 0 M 10 15 L 6 12 M 10 15 L 6 18",
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
                "label": "gate"
            },
            {
                "id": "pin2",
                "x": 10.0,
                "y": -40.0,
                "label": "drain"
            },
            {
                "id": "pin3",
                "x": 10.0,
                "y": 40.0,
                "label": "source"
            }
        ]
    },
    "passgate": {
        "name": "passgate",
        "argsCount": 6,
        "enabled": "true",
        "icon": "M -20 -20 L 20 -20 L 20 20 L -20 20 Z M -40 0 L -20 0 M 20 0 L 40 0 M -20 -30 L 20 -30 M -20 30 L 20 30 M 0 -34 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0 M 0 -38 L 0 -50 M 0 30 L 0 50",
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
                "label": ""
            },
            {
                "id": "pin2",
                "x": 40.0,
                "y": -0.0,
                "label": ""
            }
        ]
    },
    "opamplifier": {
        "name": "opamplifier",
        "argsCount": 7,
        "enabled": "true",
        "icon": "M 0 -20 L 20 -20 M 0 20 L 20 20 M 100 0 L 120 0 M 20 -40 L 20 40 L 100 0 Z M 25 -20 L 35 -20 M 30 -25 L 30 -15 M 25 20 L 35 20",
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
                "label": "non-inverting input"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": 20.0,
                "label": "inverting input"
            },
            {
                "id": "pin3",
                "x": 120.0,
                "y": -0.0,
                "label": "output"
            }
        ]
    },
    "diode": {
        "name": "diode",
        "argsCount": 6,
        "enabled": "true",
        "icon": "M 0 0 L 15 0 M 15 -15 L 15 15 L 35 0 Z M 35 -15 L 35 15 M 35 0 L 50 0",
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
                "label": "anode"
            },
            {
                "id": "pin2",
                "x": 50.0,
                "y": -0.0,
                "label": "cathode"
            }
        ]
    },
    "zenerdiode": {
        "name": "zenerdiode",
        "argsCount": 6,
        "enabled": "true",
        "icon": "M 0 0 L 15 0 M 15 -15 L 15 15 L 35 0 Z M 30 -15 L 35 -15 L 35 15 L 40 15 M 35 0 L 50 0",
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
                "label": "anode"
            },
            {
                "id": "pin2",
                "x": 50.0,
                "y": -0.0,
                "label": "cathode"
            }
        ]
    },
    "leddiode": {
        "name": "leddiode",
        "argsCount": 6,
        "enabled": "true",
        "icon": "M 0 0 L 15 0 M 15 -15 L 15 15 L 35 0 Z M 35 -15 L 35 15 M 35 0 L 50 0 M 10 -20 L 20 -30 M 15 -30 L 20 -30 L 20 -25 M 15 -20 L 25 -30 M 20 -30 L 25 -30 L 25 -25",
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
                "label": "anode"
            },
            {
                "id": "pin2",
                "x": 50.0,
                "y": -0.0,
                "label": "cathode"
            }
        ]
    },
    "photodiode": {
        "name": "photodiode",
        "argsCount": 6,
        "enabled": "true",
        "icon": "M 0 0 L 15 0 M 15 -15 L 15 15 L 35 0 Z M 35 -15 L 35 15 M 35 0 L 50 0 M 20 -30 L 10 -20 M 10 -25 L 10 -20 L 15 -20 M 25 -30 L 15 -20 M 15 -25 L 15 -20 L 20 -20",
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
                "label": "anode"
            },
            {
                "id": "pin2",
                "x": 50.0,
                "y": -0.0,
                "label": "cathode"
            }
        ]
    },
    "supplyterminal": {
        "name": "supplyterminal",
        "argsCount": 5,
        "enabled": "true",
        "icon": "M 0 10 L 0 0 M -15 0 L 15 0",
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
                "label": ""
            }
        ]
    },
    "ioport": {
        "name": "ioport",
        "argsCount": 6,
        "enabled": "true",
        "icon": "M 0 0 L 5 0 M 11 0 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0",
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
                "label": ""
            },
            {
                "id": "pin1",
                "x": 10.0,
                "y": -0.0,
                "label": ""
            },
            {
                "id": "pin1",
                "x": 0.0,
                "y": -0.0,
                "label": ""
            },
            {
                "id": "pin1",
                "x": 0.0,
                "y": -10.0,
                "label": ""
            }
        ]
    },
    "andthree": {
        "name": "andthree",
        "argsCount": 6,
        "enabled": "true",
        "scales": [
            1,
            2,
            4
        ],
        "icon": "M 0 -30 L 16 -30 M 0 -20 L 16 -20 M 0 -10 L 16 -10 M 16 -40 L 40 -40 C 55 -40 60 -20 60 -20 C 60 -20 55 0 40 0 L 16 0 Z M 60 -20 L 70 -20",
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
                "label": "input-1"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -20.0,
                "label": "input-2"
            },
            {
                "id": "pin3",
                "x": 0.0,
                "y": -10.0,
                "label": "input-3"
            },
            {
                "id": "pin4",
                "x": 70.0,
                "y": -20.0,
                "label": "output"
            }
        ]
    },
    "nandthree": {
        "name": "nandthree",
        "argsCount": 6,
        "enabled": "true",
        "icon": "M 0 -30 L 16 -30 M 0 -20 L 16 -20 M 0 -10 L 16 -10 M 16 -40 L 35 -40 C 45 -40 55 -20 55 -20 C 55 -20 45 0 35 0 L 16 0 Z M 59 -20 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0 M 63 -20 L 70 -20",
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
                "label": "input-1"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -20.0,
                "label": "input-2"
            },
            {
                "id": "pin3",
                "x": 0.0,
                "y": -10.0,
                "label": "input-3"
            },
            {
                "id": "pin4",
                "x": 70.0,
                "y": -20.0,
                "label": "output"
            }
        ]
    },
    "andtwo": {
        "name": "andtwo",
        "argsCount": 6,
        "enabled": "true",
        "icon": "M 0 -30 L 16 -30 M 0 -10 L 16 -10 M 16 -40 L 40 -40 C 55 -40 60 -20 60 -20 C 60 -20 55 0 40 0 L 16 0 Z M 60 -20 L 70 -20",
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
                "label": "input-1"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -10.0,
                "label": "input-3"
            },
            {
                "id": "pin3",
                "x": 70.0,
                "y": -20.0,
                "label": "output"
            }
        ]
    },
    "nandtwo": {
        "name": "nandtwo",
        "argsCount": 6,
        "enabled": "true",
        "icon": "M 0 -30 L 16 -30 M 0 -10 L 16 -10 M 16 -40 L 35 -40 C 45 -40 55 -20 55 -20 C 55 -20 45 0 35 0 L 16 0 Z M 59 -20 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0 M 63 -20 L 70 -20",
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
                "label": "input-1"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -10.0,
                "label": "input-3"
            },
            {
                "id": "pin3",
                "x": 70.0,
                "y": -20.0,
                "label": "output"
            }
        ]
    },
    "orthree": {
        "name": "orthree",
        "argsCount": 6,
        "enabled": "true",
        "icon": "M 0 -30 L 16 -30 M 0 -20 L 18 -20 M 0 -10 L 16 -10 M 10 -40 Q 25 -20 10 0 C 35 0 50 -10 60 -20 C 50 -30 35 -40 10 -40 Z M 60 -20 L 70 -20",
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
                "label": "input-1"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -20.0,
                "label": "input-2"
            },
            {
                "id": "pin3",
                "x": 0.0,
                "y": -10.0,
                "label": "input-3"
            },
            {
                "id": "pin4",
                "x": 70.0,
                "y": -20.0,
                "label": "output"
            }
        ]
    },
    "northree": {
        "name": "northree",
        "argsCount": 6,
        "enabled": "true",
        "icon": "M 0 -30 L 16 -30 M 0 -20 L 18 -20 M 0 -10 L 16 -10 M 10 -40 Q 25 -20 10 0 C 35 0 45 -10 50 -20 C 45 -30 35 -40 10 -40 Z M 55 -20 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 M 60 -20 L 70 -20",
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
                "label": "input-1"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -20.0,
                "label": "input-2"
            },
            {
                "id": "pin3",
                "x": 0.0,
                "y": -10.0,
                "label": "input-3"
            },
            {
                "id": "pin4",
                "x": 70.0,
                "y": -20.0,
                "label": "output"
            }
        ]
    },
    "ortwo": {
        "name": "ortwo",
        "argsCount": 6,
        "enabled": "true",
        "icon": "M 0 -30 L 16 -30 M 0 -10 L 16 -10 M 10 -40 Q 25 -20 10 0 C 35 0 50 -10 60 -20 C 50 -30 35 -40 10 -40 Z M 60 -20 L 70 -20",
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
                "label": "input-1"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -10.0,
                "label": "input-3"
            },
            {
                "id": "pin3",
                "x": 70.0,
                "y": -20.0,
                "label": "output"
            }
        ]
    },
    "nortwo": {
        "name": "nortwo",
        "argsCount": 6,
        "enabled": "true",
        "icon": "M 0 -30 L 16 -30 M 0 -10 L 16 -10 M 10 -40 Q 25 -20 10 0 C 35 0 45 -10 50 -20 C 45 -30 35 -40 10 -40 Z M 55 -20 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 M 60 -20 L 70 -20",
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
                "label": "input-1"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -10.0,
                "label": "input-3"
            },
            {
                "id": "pin3",
                "x": 70.0,
                "y": -20.0,
                "label": "output"
            }
        ]
    },
    "xortwo": {
        "name": "xortwo",
        "argsCount": 6,
        "enabled": "true",
        "icon": "M 0 -30 L 13 -30 M 0 -10 L 13 -10 M 5 -40 Q 20 -20 5 0 M 15 -40 Q 30 -20 15 0 C 40 0 50 -10 60 -20 C 50 -30 40 -40 15 -40 Z M 60 -20 L 70 -20",
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
                "label": "input-1"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -10.0,
                "label": "input-3"
            },
            {
                "id": "pin3",
                "x": 70.0,
                "y": -20.0,
                "label": "output"
            }
        ]
    },
    "xnortwo": {
        "name": "xnortwo",
        "argsCount": 6,
        "enabled": "true",
        "icon": "M 0 -30 L 13 -30 M 0 -10 L 13 -10 M 5 -40 Q 20 -20 5 0 M 15 -40 Q 30 -20 15 0 C 40 0 45 -10 50 -20 C 45 -30 40 -40 15 -40 Z M 55 -20 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 M 60 -20 L 70 -20",
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
                "label": "input-1"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -10.0,
                "label": "input-3"
            },
            {
                "id": "pin3",
                "x": 70.0,
                "y": -20.0,
                "label": "output"
            }
        ]
    },
    "inverter": {
        "name": "inverter",
        "argsCount": 6,
        "enabled": "true",
        "icon": "M 0 -20 L 15 -20 M 15 0 L 15 -40 L 35 -20 Z M 39 -20 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0 M 43 -20 L 50 -20",
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
                "label": "input"
            },
            {
                "id": "pin2",
                "x": 50.0,
                "y": -20.0,
                "label": "output"
            }
        ]
    },
    "invertersmall": {
        "name": "invertersmall",
        "argsCount": 6,
        "enabled": "true",
        "icon": "M 0 -10 L 10 -10 M 10 -20 L 10 0 L 30 -10 Z M 34 -10 m -4 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 34 -10 L 40 -10",
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
                "label": "input"
            },
            {
                "id": "pin2",
                "x": 40.0,
                "y": -10.0,
                "label": "output"
            }
        ]
    },
    "buffer": {
        "name": "buffer",
        "argsCount": 6,
        "enabled": "true",
        "icon": "M 0 -20 L 15 -20 M 15 0 L 15 -40 L 40 -20 Z M 40 -20 L 50 -20",
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
                "label": "input"
            },
            {
                "id": "pin2",
                "x": 50.0,
                "y": -20.0,
                "label": "output"
            }
        ]
    },
    "jkflipflop": {
        "name": "jkflipflop",
        "argsCount": 7,
        "enabled": "true",
        "icon": "M 10 0 L 60 0 L 60 -100 L 10 -100 Z M 0 -80 L 10 -80 M 0 -20 L 10 -20 M 0 -50 L 10 -50 M 10 -45 L 15 -50 L 10 -55 M 60 -80 L 70 -80 M 60 -20 L 70 -20 M 35 0 L 35 10",
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
                "label": "clr"
            },
            {
                "id": "pin4",
                "x": 35.0,
                "y": 10.0,
                "label": "clr"
            },
            {
                "id": "pin1",
                "x": 0.0,
                "y": -80.0,
                "label": "J"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -50.0,
                "label": "CLK"
            },
            {
                "id": "pin3",
                "x": 0.0,
                "y": -20.0,
                "label": "K"
            },
            {
                "id": "pin5",
                "x": 70.0,
                "y": -80.0,
                "label": "Q"
            },
            {
                "id": "pin6",
                "x": 70.0,
                "y": -20.0,
                "label": "Qn"
            }
        ]
    },
    "srlatch": {
        "name": "srlatch",
        "argsCount": 6,
        "enabled": "true",
        "icon": "M 10 0 L 60 0 L 60 -100 L 10 -100 Z M 0 -80 L 10 -80 M 0 -20 L 10 -20 M 0 -50 L 10 -50 M 60 -80 L 70 -80 M 60 -20 L 70 -20",
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
                "label": "E"
            },
            {
                "id": "pin1",
                "x": 0.0,
                "y": -80.0,
                "label": "S"
            },
            {
                "id": "pin3",
                "x": 0.0,
                "y": -20.0,
                "label": "R"
            },
            {
                "id": "pin4",
                "x": 70.0,
                "y": -80.0,
                "label": "Q"
            },
            {
                "id": "pin5",
                "x": 70.0,
                "y": -20.0,
                "label": "Qn"
            }
        ]
    },
    "srflipflop": {
        "name": "srflipflop",
        "argsCount": 7,
        "enabled": "true",
        "icon": "M 10 0 L 60 0 L 60 -100 L 10 -100 Z M 0 -80 L 10 -80 M 0 -20 L 10 -20 M 0 -50 L 10 -50 M 10 -45 L 15 -50 L 10 -55 M 60 -80 L 70 -80 M 60 -20 L 70 -20 M 35 0 L 35 10",
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
                "label": "clr"
            },
            {
                "id": "pin4",
                "x": 35.0,
                "y": 10.0,
                "label": "clr"
            },
            {
                "id": "pin1",
                "x": 0.0,
                "y": -80.0,
                "label": "S"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -50.0,
                "label": "CLK"
            },
            {
                "id": "pin3",
                "x": 0.0,
                "y": -20.0,
                "label": "R"
            },
            {
                "id": "pin5",
                "x": 70.0,
                "y": -80.0,
                "label": "Q"
            },
            {
                "id": "pin6",
                "x": 70.0,
                "y": -20.0,
                "label": "Qn"
            }
        ]
    },
    "dflipflop": {
        "name": "dflipflop",
        "argsCount": 7,
        "enabled": "true",
        "icon": "M 10 0 L 60 0 L 60 -100 L 10 -100 Z M 0 -80 L 10 -80 M 0 -20 L 10 -20 M 10 -15 L 15 -20 L 10 -25 M 60 -80 L 70 -80 M 60 -20 L 70 -20 M 35 0 L 35 10",
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
                "label": "clr"
            },
            {
                "id": "pin3",
                "x": 35.0,
                "y": 10.0,
                "label": "clr"
            },
            {
                "id": "pin1",
                "x": 0.0,
                "y": -80.0,
                "label": "D"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -20.0,
                "label": "CLK"
            },
            {
                "id": "pin4",
                "x": 70.0,
                "y": -80.0,
                "label": "Q"
            },
            {
                "id": "pin5",
                "x": 70.0,
                "y": -20.0,
                "label": "Qn"
            }
        ]
    },
    "dlatch": {
        "name": "dlatch",
        "argsCount": 6,
        "enabled": "true",
        "icon": "M 10 0 L 60 0 L 60 -70 L 10 -70 Z M 0 -50 L 10 -50 M 0 -20 L 10 -20 M 60 -50 L 70 -50 M 60 -20 L 70 -20",
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
                "label": "E"
            },
            {
                "id": "pin1",
                "x": 0.0,
                "y": -50.0,
                "label": "D"
            },
            {
                "id": "pin3",
                "x": 70.0,
                "y": -50.0,
                "label": "Q"
            },
            {
                "id": "pin4",
                "x": 70.0,
                "y": -20.0,
                "label": "Qn"
            }
        ]
    },
    "tflipflop": {
        "name": "tflipflop",
        "argsCount": 7,
        "enabled": "true",
        "icon": "M 10 0 L 60 0 L 60 -100 L 10 -100 Z M 0 -80 L 10 -80 M 0 -20 L 10 -20 M 10 -15 L 15 -20 L 10 -25 M 60 -80 L 70 -80 M 60 -20 L 70 -20 M 35 0 L 35 10",
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
                "label": "clr"
            },
            {
                "id": "pin3",
                "x": 35.0,
                "y": 10.0,
                "label": "clr"
            },
            {
                "id": "pin1",
                "x": 0.0,
                "y": -80.0,
                "label": "T"
            },
            {
                "id": "pin2",
                "x": 0.0,
                "y": -20.0,
                "label": "CLK"
            },
            {
                "id": "pin4",
                "x": 70.0,
                "y": -80.0,
                "label": "Q"
            },
            {
                "id": "pin5",
                "x": 70.0,
                "y": -20.0,
                "label": "Qn"
            }
        ]
    },
    "sevensegmentdisplay": {
        "name": "sevensegmentdisplay",
        "argsCount": 6,
        "enabled": "true",
        "icon": "M 0 0 L 80 0 L 80 -100 L 0 -100 Z M 25 -85 L 55 -85 L 55 -75 L 25 -75 Z M 25 -25 L 55 -25 L 55 -15 L 25 -15 Z M 25 -55 L 55 -55 L 55 -45 L 25 -45 Z M 15 -80 L 25 -80 L 25 -50 L 15 -50 Z M 55 -80 L 65 -80 L 65 -50 L 55 -50 Z M 15 -50 L 25 -50 L 25 -20 L 15 -20 Z M 55 -50 L 65 -50 L 65 -20 L 55 -20 Z M 10 0 L 10 10 M 20 0 L 20 10 M 30 0 L 30 10 M 40 0 L 40 10 M 50 0 L 50 10 M 60 0 L 60 10 M 70 0 L 70 10",
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
                "label": ""
            },
            {
                "id": "pin2",
                "x": 20.0,
                "y": 10.0,
                "label": ""
            },
            {
                "id": "pin3",
                "x": 30.0,
                "y": 10.0,
                "label": ""
            },
            {
                "id": "pin4",
                "x": 40.0,
                "y": 10.0,
                "label": ""
            },
            {
                "id": "pin5",
                "x": 50.0,
                "y": 10.0,
                "label": ""
            },
            {
                "id": "pin6",
                "x": 60.0,
                "y": 10.0,
                "label": ""
            },
            {
                "id": "pin7",
                "x": 70.0,
                "y": 10.0,
                "label": ""
            }
        ]
    },
    "fulladder": {
        "name": "fulladder",
        "argsCount": 6,
        "enabled": "true",
        "icon": "M 0 0 L 80 0 L 80 -80 L 0 -80 Z M 60 -100 L 60 -80 M 20 -100 L 20 -80 M -20 -40 L 0 -40 M 80 -40 L 100 -40 M 40 0 L 40 20",
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
                "label": "ci"
            },
            {
                "id": "pin5",
                "x": 100.0,
                "y": -40.0,
                "label": "co"
            },
            {
                "id": "pin4",
                "x": -20.0,
                "y": -40.0,
                "label": "co"
            },
            {
                "id": "pin5",
                "x": 100.0,
                "y": -40.0,
                "label": "ci"
            },
            {
                "id": "pin1",
                "x": 60.0,
                "y": -100.0,
                "label": "a"
            },
            {
                "id": "pin2",
                "x": 20.0,
                "y": -100.0,
                "label": "b"
            },
            {
                "id": "pin3",
                "x": 40.0,
                "y": 20.0,
                "label": "s"
            }
        ]
    },
    "fullsubtractor": {
        "name": "fullsubtractor",
        "argsCount": 6,
        "enabled": "true",
        "icon": "M 0 0 L 80 0 L 80 -80 L 0 -80 Z M 60 -100 L 60 -80 M 20 -100 L 20 -80 M -20 -40 L 0 -40 M 80 -40 L 100 -40 M 40 0 L 40 20",
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
                "label": "bi"
            },
            {
                "id": "pin5",
                "x": 100.0,
                "y": -40.0,
                "label": "bo"
            },
            {
                "id": "pin4",
                "x": -20.0,
                "y": -40.0,
                "label": "bo"
            },
            {
                "id": "pin5",
                "x": 100.0,
                "y": -40.0,
                "label": "bi"
            },
            {
                "id": "pin1",
                "x": 60.0,
                "y": -100.0,
                "label": "A"
            },
            {
                "id": "pin2",
                "x": 20.0,
                "y": -100.0,
                "label": "B"
            },
            {
                "id": "pin3",
                "x": 40.0,
                "y": 20.0,
                "label": "d"
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
                "label": ""
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