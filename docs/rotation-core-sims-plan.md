# Rotation & Orbits — core original sims (build plan)

Build order and specs TBD. These mirror the wave-sim build pattern (vanilla JS + Canvas, ~100–250 lines each, predict-before-reveal wrapper).

Six irreducible-core sims. Each teaches one idea the curated external tools in [`/rotation/`](../rotation/) only *show* — the originals exist to let a student **predict first, then check**, or **reproduce a target** by hand, and every one is validated against a specific existing sim so "my numbers match theirs" is a concrete pass/fail.

Nothing here is built yet. This document is the spec backlog, not an implementation.

---

## 1. Two bugs on a platform

- **Concept:** Rigid-body rotation. Two points on one turntable share a single ω and α, but linear speed v = ωr and centripetal acceleration a_c = ω²r scale with radius. (§1 Rotational Kinematics.)
- **Hook (predict-before-reveal):** Place two bugs at different radii, set ω, and ask the student to predict the ratio of their speeds and of their centripetal accelerations *before* the vectors are drawn. Reveal the velocity and a_c arrows and the numeric ratios.
- **Validate against:** PhET *Ladybug Revolution* — same configuration should give the same v(r) and a_c(r).

## 2. Torque wrench / door

- **Concept:** Torque as τ = rF sin φ — the lever arm, not just the force, sets the turning. (§2 Torque & Moment of Inertia.)
- **Hook (active reproduction):** A draggable force arrow on a wrench or door, with a live lever-arm overlay (the perpendicular distance from the axis to the line of action). Give the student a target torque and let them hit it by choosing where and at what angle to push; the overlay shows why pushing along the handle does nothing.
- **Validate against:** PhET *Torque* — read τ off both for the same force, radius and angle.

## 3. Incline race

- **Concept:** Rolling energy split. Objects with different β = I/mR² accelerate at a = g sinθ/(1 + β), independent of mass and radius. (§3 Rolling Motion.)
- **Hook (predict-before-reveal):** Let the student pick a line-up (hoop, disk, sphere, sliding block) and predict the finishing order before release. Reveal the race plus energy bar charts splitting each object's energy into translational and rotational; integrate a = g sinθ/(1 + β) for the trajectories.
- **Validate against:** oPhysics *Rolling Motion (incline race)* (r2) and *Rolling vs. Sliding* (r3) — same order, same arrival times.

## 4. Slip-to-roll

- **Concept:** Kinetic friction converts sliding into rolling. A ball launched spinning or sliding is torqued by friction until v = Rω, then rolls freely; energy is lost to friction along the way. (§3 Rolling Motion.)
- **Hook (predict-before-reveal):** Set an initial v and ω (including pure slide or pure spin) and predict the final rolling speed before running. Plot v and Rω converging to the lock point, plus the energy dissipated by friction.
- **Validate against:** oPhysics *Rotation, Sliding, Rolling & Friction* (r1) — same transition time and final speed.

## 5. Skater / turntable — L conservation

- **Concept:** With no external torque, L = Iω is conserved, but K_rot = ½Iω² is **not** — pulling mass in takes work. (§4 Angular Momentum.)
- **Hook (predict-before-reveal):** The student changes I (arms in/out, or sliding masses) and predicts what happens to ω and to K_rot. Reveal that ω rises to hold L fixed while K_rot jumps — then surface the work done against the centripetal direction as the energy source, so "energy isn't conserved" becomes "I did work," not a paradox.
- **Validate against:** PhET *Torque* (Angular Momentum tab) — same L before/after, same ω response to a change in I.

## 6. Kepler + effective potential (capstone)

- **Concept:** Orbits from an inverse-square force, read two ways at once: the orbit in the plane, and a bead sliding on the effective-potential curve U_eff(r) = L²/2mr² − GMm/r between its turning points. Ties rotation (angular momentum) to orbits in a single view. (§5 Orbits & Gravitation.)
- **Hook (predict-before-reveal):** Drag the initial velocity vector and predict the orbit's shape (bound ellipse vs. unbound) and where r_min/r_max land. Reveal the orbit, the equal-area sweeps, and a bead oscillating between the turning points on the U_eff(r) curve — all three synced in time, so the student sees perihelion speed-up, the area law, and the radial turning points as one phenomenon.
- **Validate against:** PhET *Kepler's Laws* — same ellipse, same swept-area equality, same period for a given semi-major axis.

---

### Build notes

- **Stack:** vanilla JS + Canvas, no framework or dependency (same as the wave sims), ~100–250 lines each.
- **Wrapper:** the shared predict-before-reveal pattern — state a prediction, run, then reveal the measured result and whether the prediction held.
- **Home:** each lands in `rotation/sims/<name>/index.html` with relative asset paths, and flips from a build-plan entry to a live card in `rotation/tools.json` (`"kind": "original"`, `"status": "live"`) when done — the same lifecycle the wave deck uses.
- **Capstone first or last?** #6 depends on the angular-momentum intuition from #5 and the orbit intuition the curated PhET sims already give, so it's the natural finale.
