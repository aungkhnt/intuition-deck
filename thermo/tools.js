// GENERATED from tools.json by scripts/sync-data.mjs. Do not edit by hand.
// index.html loads this only when opened from disk (file://), where fetch() is blocked.
window.WORKBENCH_DATA = {
  "topics": [
    {
      "id": 1,
      "slug": "foundations",
      "title": "State, Work & the P–V / T–S Plane",
      "short": "Foundations",
      "summary": "Every cycle lives on two planes: the area a loop encloses on P–V is the net work, the area under its T–S curve is the heat. Build the p–V–T picture here before reading any loop.",
      "equation": "PV = nRT  ·  W_{net} = ∮P dV  ·  Q_{rev} = ∫T dS"
    },
    {
      "id": 2,
      "slug": "carnot",
      "title": "Carnot Cycle",
      "summary": "Two isotherms closed by two adiabats: the most efficient any engine can be between the same hot and cold reservoirs, and the yardstick every real cycle is measured against.",
      "equation": "η_{Carnot} = 1 − T_{c}/T_{h}"
    },
    {
      "id": 3,
      "slug": "otto",
      "title": "Otto Cycle",
      "summary": "The idealized gasoline engine: adiabatic compression, a constant-volume burn, an adiabatic power stroke, and constant-volume exhaust. Efficiency rides entirely on the compression ratio.",
      "equation": "η_{Otto} = 1 − r^{1−γ}  ·  r = V_{1}/V_{2}"
    },
    {
      "id": 4,
      "slug": "diesel",
      "title": "Diesel Cycle",
      "summary": "Compression-ignition: heat is added at constant pressure over a cutoff ratio rather than all at once, so how long the burn runs sets the penalty against Otto at the same compression ratio.",
      "equation": "η_{Diesel} = 1 − r^{1−γ} (r_{c}^{γ} − 1) / (γ (r_{c} − 1))"
    },
    {
      "id": 5,
      "slug": "brayton",
      "title": "Brayton Cycle (Gas Turbines & Jets)",
      "short": "Brayton Cycle",
      "summary": "The gas-turbine and jet-engine cycle: continuous compression, constant-pressure combustion, then expansion through a turbine and nozzle. Efficiency is set by the pressure ratio.",
      "equation": "η_{Brayton} = 1 − r_{p}^{(1−γ)/γ}  ·  r_{p} = p_{2}/p_{1}"
    },
    {
      "id": 6,
      "slug": "rankine",
      "title": "Rankine Cycle (Steam Power)",
      "short": "Rankine Cycle",
      "summary": "The steam power plant: a working fluid boiled, expanded through a turbine, condensed, and pumped back — traced around the saturation dome, where phase change does the heavy lifting.",
      "equation": "η_{Rankine} = w_{net}/q_{in} = 1 − q_{out}/q_{in}"
    },
    {
      "id": 7,
      "slug": "stirling",
      "title": "Stirling Cycle",
      "summary": "Two isotherms closed by two constant-volume legs, with a regenerator that stores heat between strokes and lifts the ideal efficiency all the way up to Carnot's.",
      "equation": "η_{Stirling} = 1 − T_{c}/T_{h}  (ideal, with regeneration)"
    }
  ],
  "tools": [
    {
      "id": "phet-gas-properties",
      "name": "PhET: Gas Properties",
      "source": "PhET Interactive Simulations, CU Boulder",
      "url": "https://phet.colorado.edu/sims/html/gas-properties/latest/gas-properties_en.html",
      "embed_url": "https://phet.colorado.edu/sims/html/gas-properties/latest/gas-properties_en.html",
      "can_embed": true,
      "license": "CC BY 4.0",
      "topics": [
        1
      ],
      "my_note": "Not a cycle sim, but the foundation every cycle rests on. Pump particles into the box and watch pressure, volume and temperature move together (PV = nRT). Set Hold Constant to Temperature and shrink the width to see pressure rise as an isotherm; hold Volume instead and add heat to climb an isochor. The particle speeds are the point: temperature is just their mean kinetic energy, so 'adding heat' and 'speeding up molecules' are the same move. Build this p–V–T intuition before reading any loop.",
      "controls": "Screens: Ideal / Explore / Energy · Pump (heavy and light particles) · Hold Constant: nothing / volume / temperature / pressure · container width (volume) · Heat / Cool bucket · width and collision tools, particle-speed histograms, center of mass",
      "recommended_first": true
    },
    {
      "id": "mechsimulator-cycles",
      "name": "MechSimulator: Thermodynamic Cycles",
      "source": "MechSimulator",
      "url": "https://www.mechsimulator.com/tools/thermodynamics",
      "can_embed": false,
      "embed_note": "Link only: proprietary tool.",
      "license": "Proprietary",
      "topics": [
        2,
        3,
        4,
        5
      ],
      "my_note": "The cleanest single view of the air-standard cycles. Pick Carnot, Otto, Diesel or Brayton and an animated piston drives a point around synced P–V and T–S diagrams while the efficiency updates live. Raise Otto's compression ratio and watch both the loop area and η grow; switch to Diesel at the same ratio and see why spreading the heat addition out at constant pressure costs efficiency. Keep reading the same leg on both planes at once — an adiabat is vertical on T–S, an isotherm is horizontal — until the two pictures fuse into one.",
      "controls": "Cycle selector: Carnot / Otto / Diesel / Brayton · synced P–V and T–S diagrams · animated piston-cylinder · cycle parameters (compression ratio, pressure ratio, reservoir temperatures) · live efficiency readout · play / pause / step",
      "recommended_first": true,
      "todo": "Confirm the exact tool URL and the parameter sliders each cycle exposes."
    },
    {
      "id": "mechsimulator-rankine",
      "name": "MechSimulator: Rankine Cycle",
      "source": "MechSimulator",
      "url": "https://www.mechsimulator.com/",
      "can_embed": false,
      "embed_note": "Link only: proprietary tool.",
      "license": "Proprietary",
      "topics": [
        6
      ],
      "my_note": "MechSimulator's steam-cycle tool: the Rankine loop drawn around the saturation dome next to an animated plant schematic — boiler, turbine, condenser, pump. Follow the working fluid from subcooled liquid, up across the dome into superheat, down through the turbine, and back. Watch where the turbine expansion dips under the dome into wet steam; add superheat and the exit stays drier, which is the practical reason real plants superheat at all.",
      "controls": "Rankine loop on P–V / T–S over the saturation dome · animated plant schematic (boiler, turbine, condenser, pump) · boiler pressure and superheat, condenser pressure · efficiency and quality readouts",
      "todo": "Find and link the exact Rankine / steam-cycle tool URL on mechsimulator.com."
    },
    {
      "id": "simulations4all-cycles",
      "name": "simulations4all: Thermodynamic Cycles",
      "source": "simulations4all",
      "url": "https://simulations4all.com/",
      "can_embed": false,
      "embed_note": "Link only: see the site's terms.",
      "license": "See site",
      "topics": [
        2,
        3,
        4,
        5,
        6,
        7
      ],
      "my_note": "A separate, polished page for each cycle — Carnot, Otto, Diesel, Brayton, Rankine, Stirling — every one on synced P–V and T–S diagrams with the efficiency worked out. Because each cycle is its own sim, this is the place to compare: open two in two tabs and run Otto against Diesel at the same compression ratio, or Brayton against Rankine as the two workhorses of power generation, and watch how differently they fill the T–S plane.",
      "controls": "Separate simulations per cycle (Carnot, Otto, Diesel, Brayton, Rankine, Stirling) · synced P–V and T–S diagrams · per-cycle parameter sliders · efficiency readout",
      "recommended_first": true,
      "todo": "Capture the exact per-cycle deep-link URLs from simulations4all.com."
    },
    {
      "id": "nasa-enginesim",
      "name": "NASA Glenn: EngineSim",
      "source": "NASA Glenn Research Center — Beginner's Guide to Propulsion",
      "url": "https://www.grc.nasa.gov/www/k-12/airplane/ngnsim.html",
      "can_embed": false,
      "embed_note": "Link only: NASA Glenn serves it from its own site, and older builds run as a downloadable app rather than in the page.",
      "license": "Public domain (U.S. Government work)",
      "topics": [
        5
      ],
      "my_note": "The Brayton cycle as an actual jet engine. In Design mode, set flight Mach and altitude, the compressor pressure ratio and the turbine inlet temperature, then read thrust and fuel flow; in Test mode, push the throttle and watch the operating point move. It pins the abstract cycle to hardware: the compressor pressure ratio is exactly the r_p in η = 1 − r_p^((1−γ)/γ), and turbine inlet temperature is the materials limit that caps how far you can push it.",
      "controls": "Modes: Design / Test · flight Mach and altitude · engine type (turbojet, turbofan) · compressor pressure ratio, turbine inlet temperature, bypass ratio · thrust, fuel flow and efficiency outputs",
      "todo": "Confirm the current EngineSim URL and whether it runs in-browser today or needs the downloadable version."
    },
    {
      "id": "nasa-nozzle",
      "name": "NASA Glenn: Isentropic Nozzle Flow",
      "source": "NASA Glenn Research Center — Beginner's Guide",
      "url": "https://www.grc.nasa.gov/www/k-12/airplane/nozzle.html",
      "can_embed": false,
      "embed_note": "Link only: NASA Glenn serves it from its own site.",
      "license": "Public domain (U.S. Government work)",
      "topics": [
        5
      ],
      "my_note": "Where a Brayton engine turns leftover pressure into thrust. Set the chamber conditions and the nozzle area ratio and watch the flow accelerate through the throat to supersonic, with Mach number, pressure and temperature traced along the nozzle. Over- and under-expansion show up as the exit pressure failing to match ambient — the same isentropic relations that close the expansion leg of the cycle, now sized into real thrust and specific impulse.",
      "controls": "Chamber pressure and temperature · nozzle area ratio (throat to exit) · plots of Mach number, pressure and temperature along the nozzle · thrust and specific-impulse outputs",
      "todo": "Confirm the current nozzle-sim URL and its in-browser vs. downloadable status."
    },
    {
      "id": "openlyceum-carnot",
      "name": "OpenLyceum: Carnot Heat Engine",
      "source": "OpenLyceum",
      "url": "https://openlyceum.github.io/CarnotHeatEngine/",
      "embed_url": "https://openlyceum.github.io/CarnotHeatEngine/",
      "can_embed": true,
      "license": "AGPL-3.0",
      "topics": [
        2
      ],
      "my_note": "An open-source, PhET-style Carnot sim built with SceneryStack. On Intro, dock the hot and cold reservoirs and step the piston through the four legs while the P–V diagram draws itself. On the Efficiency Lab, turn on the T–S diagram — the Carnot loop is a perfect rectangle there — and use Measure mode to compute η = 1 − T_c/T_h yourself before it's revealed. The Reversed Cycle runs the same engine backward as a refrigerator, showing COP instead of efficiency: the cleanest way to see that a heat engine and a heat pump are one machine run two directions.",
      "controls": "Screens: Intro / Efficiency Lab / Reversed Cycle · piston-cylinder with docking reservoirs and an insulating sleeve · live P–V diagram · toggleable T–S diagram · energy-flow bars · Measure mode (hides efficiency until you compute it) · stage stepper",
      "recommended_first": true,
      "todo": "Confirm the GitHub Pages demo embeds cleanly; if the live build is down, the card falls back to a link."
    },
    {
      "id": "aether-x",
      "name": "AETHER-X: Gas Turbine Engine Simulator",
      "source": "Kaizar Merchant (open source)",
      "url": "https://github.com/kaizarmerchantt-git/gas-turbine-engine-simulator",
      "can_embed": false,
      "embed_note": "Link only: a React + FastAPI app you run locally — it needs its Python backend, so there's no hosted demo to embed.",
      "license": "No license stated",
      "topics": [
        5
      ],
      "my_note": "For going deeper than EngineSim. A 0-D gas-turbine cycle simulator — turbojet and turbofan, with off-design matching and T–s diagrams — whose thermochemistry runs in Python (Cantera) behind a React front end. There's no hosted demo: clone it, start the FastAPI backend, and open the front end. Worth the setup if you want the Brayton cycle with real property tables instead of constant-c_p air. (The repo ships no license, so treat the code as all-rights-reserved unless the author adds one.)",
      "controls": "Runs locally: Python / FastAPI backend (Cantera thermochemistry) + a React front end · turbojet / turbofan, off-design matching, mission analysis · T–s diagrams, thrust and fuel-consumption metrics",
      "todo": "Re-check for a hosted demo or an added license."
    },
    {
      "id": "tespy",
      "name": "TESPy: Thermal Engineering Systems in Python",
      "source": "Francesco Witte / oemof",
      "url": "https://tespy.readthedocs.io/",
      "can_embed": false,
      "embed_note": "Link only: a Python library, not a browser sim — this links its documentation.",
      "license": "MIT",
      "topics": [
        6
      ],
      "my_note": "When a drawn loop isn't enough and you want real numbers. TESPy models thermal plants from components — turbines, pumps, condensers, heat exchangers — and solves the full mass and energy balance, including off-design behavior and exergy analysis. The Rankine and organic-Rankine tutorials are the natural next step after the diagram sims: the same cycle, now with actual fluid properties and component efficiencies you set, and a verified answer to check your hand calc against.",
      "controls": "Python library (pip / conda install tespy) · build a network from components · design and off-design simulation · exergy analysis · optimization API · docs and tutorials at tespy.readthedocs.io"
    }
  ]
};
