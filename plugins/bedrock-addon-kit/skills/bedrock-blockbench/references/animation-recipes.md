# Animation principles and recipes

Source: condensed from ArtsByKev's 36-video Blockbench playlist, checked against vanilla Bedrock 1.26.52 files and export tests in web Blockbench 5.2.1 (2026-09-27). Evidence tags: [vr] checked in vanilla files; [bb] checked by a Blockbench export test; [pack] shipped in a working add-on; (derived) worked out from verified rules; (unverified) nobody confirmed it. Citations like (b4 #16 [3:20]) point at the original video notes (batch, video, timestamp). `ns` = your namespace.

## 4. Animation

### 4.1 Principles
Units and keys
- Degrees, px, seconds; one tick = 0.05 s.
- Blockbench snaps keys to 1/24 s: keys at 0.3 and 0.4 exported as 0.2917 and 0.4167 [bb]. Write animation JSON directly from script; don't round-trip it through Blockbench.

Loops
- A keyframed loop's last key equals its first, placed at animation_length. Paste the 0 s keys at the end BEFORE animating the middle (b4 #15 [1:18]; b2 #22 [14:11]).
- A Molang loop is seamless when its period divides the length. With q.life_time there is no seam at all.

Hiding the loop
- A long loop with one event (a 9 s idle with one glance at 6-9 s, b5 #28 [12:15]).
- Coprime periods per appendage: 3.0 / 3.7 / 4.3 / 5.1 s (b6 #35 [12:47]).
- A look-around period that doesn't divide the breath (11 s against 3.5 s).

Follow-through: the same curve arrives LATER down a chain (b4 #29 [4:36]).
- Accessories lag 0.25-0.5 s at small amplitude (b2 #22 [16:56]).
- Wing mid segment 0.2 s behind the root in a 1.5-2 s flap; the tip only slightly after the mid (b4 #30 [8:07], [9:09]).
- Chains: 40-60 degrees of phase per segment at 8-15 degrees each (rotations add up).

Easing
- A sine eases for free.
- Braking: an extra linear key 0.1-0.2 s inside each extreme, covering only a small distance (b4 #30 [3:02]).
- Catmull-Rom exports as {"post":[...],"lerp_mode":"catmullrom"} [bb]. No vanilla or shipped-pack file uses it, so test one in game first.

Contact poses (b4 #16 [1:22], [2:44])
- Two contact poses, L/2 apart. The body is lowest just after contact and highest at passing, so it bobs at twice the step rate.
- Bob = leg_length x (1 - cos(swing)), about 1 px for a 12-14 px leg (b4 #23 [6:05]).
- The thigh swings between the two contact angles; the knee carries the in-betweens (b4 #16 [6:28]).

Other principles
- Anticipation before big moves (b2 #22 [17:50]).
- Overshoot +5-10 %, then about -4 %, then settle (b4 #29 [7:40]).
- Asymmetric force: the downstroke takes 1/3 of the cycle (b4 #30 [10:11]); attacks accelerate INTO contact.
- Counter-rotation: the head holds its gaze against the body (b2 #22 [16:15]; b6 #8 [10:32]).
- Squash and stretch (b4 #29 [8:46], [12:28]): keep volume (sx*sy*sz = 1), pivot on the contact face; soft parts only, never armour, bone, teeth or claws; landings: magnetic, pudding, or edge impact.
- Speed: small mobs read fast because the legs are fast, not the body. Shorter legs keep pace with a shorter stance and earlier lift, not a smaller swing (b5 #31 [34:03]).

### 4.2 Molang and playback
Functions
- Trig takes degrees: math.sin(q.anim_time*360/L).
- In vanilla [vr]: math.mod, math.clamp, math.abs, math.lerp, math.floor, ternary, and `this` (the incoming value; vanilla writes "... - this"). No user functions.
- Multi-statement bone expressions (t.x=...; return ...;) appear nowhere in vanilla or shipped-pack (unverified). Prefer single expressions.

Stride [vr]
- tcos0 = cos(q.modified_distance_moved*38.17) * q.modified_move_speed * 57.3.
- quadruped.walk = cos(q.anim_time*38.17)*80 with "anim_time_update":"query.modified_distance_moved".

Walk weight, not a boolean
- Vanilla cow: {"walk":"query.modified_move_speed"} [vr]. Shipped pack: {"walk":"math.clamp(q.modified_move_speed * 2.5, 0, 1)"} [pack].
- Raw speed is tiny for slow walkers, so clamp and scale it. Don't also multiply the amplitudes by speed (that counts it twice).

Distance-driven loops
- Vanilla and all 36 shipped-pack mobs use Molang with a raw-distance anim_time_update.
- A distance-driven KEYFRAMED loop is used nowhere, and whether it wraps is unverified. Use Molang for locomotion, or the incrementing update "q.anim_time + q.delta_time * math.clamp(q.modified_move_speed * s, 0, 1.5)".

Loop modes: "loop":"hold_on_last_frame" for one-shots [pack: 69 uses]; "loop": true for cycles.

### 4.3 Recipes (file values; L = loop length in s; side = +1 for left bones, -1 for right)

R-IDLE (Molang; L 3-4 s, heavy 4-5, small nervous 1.5-2; b4 R1; b2 #22)
```
body scale [1, "1 + math.sin(q.life_time*360/3.5)*0.015", 1]   (only if legs are NOT under body; else breathe on chest)
chest rot X "-1.5 + math.sin(q.life_time*360/3.5)*1.5"
head rot X "1.5 - math.sin(q.life_time*360/3.5 - 40)*2"        (counter-rotates, 40 degrees late)
head rot Y "math.sin(q.life_time*360/11)*6"                     (look-around)
left_arm rot Z "-2 - math.sin(q.life_time*360/3.5 - 60)*2"; right_arm "2 + ..."
tail_<i> rot Y "math.sin(q.life_time*90 - i*50)*6"
```
Optional glance as a 9 s keyframed loop: at 6.0 s turn the head Y to +/-25 in 0.15-0.35 s, overshoot about 10 %, settle at +/-22.5, hold 0.8 s, back by 9.0.

R-BIPED-WALK (distance-driven Molang, preferred; hip-roll sign fixed)
```
p = q.modified_distance_moved*38.17;  m = math.clamp(q.modified_move_speed*s,0,1) only if not already speed-weighted
left_leg X "(-math.cos(p)*27.5 - 2.5)"   right_leg X "(math.cos(p)*27.5 - 2.5)"
right_knee X "math.max(0, math.sin(p+60))*45"   left_knee X "math.max(0, math.sin(p+240))*45"
left_arm X "math.cos(p)*20"   right_arm X "-math.cos(p)*20"
hip pos Y "math.cos(p*2+45)*0.75 - 0.25"   hip rot Y "math.cos(p)*5"   hip rot Z "-math.sin(p)*1"
head rot X "2 + math.cos(p*2-72)*2"
scripts.animate {"walk":"math.clamp(q.modified_move_speed*2.5,0,1)"}
```
Keyframed version, L = 1.0, driven by the incrementing update:
- left_leg X 0:-S .5:+S 1:-S (S 25-30); right_leg the opposite.
- right_knee X 0:K/2 .15:K .5:0 .65:0 1:K/2 (K 40-50); left_knee shifted 0.5.
- left_foot X 0:+S/2 .3:0 .45:-S .5:-S/2 .75:0 1:+S/2.
- hip pos Y 0:-B/2 .2:-B .35:+B/2 .5:-B/2 .7:-B .85:+B/2 1:-B/2.
- hip rot 0:[0,5,0] .2:[0,2,-1] .5:[0,-5,0] .7:[0,-2,1] 1:[0,5,0].
- head rot 0:0 .1:[N,0,1] .25:0 .5:0 .6:[N,0,-1] .75:0 1:0 (N 2-5).
Heavy walkers: 2-bone IK every 0.05 s over the stance (unverified): k = 180 - acos((T^2+S^2-d^2)/(2TS)); a = atan2(x,h) - acos((T^2+d^2-S^2)/(2Td)); foot = -(a+k).
Hip-yaw sign: the video's panel +5 converts to file -5, but anatomy says file +5. The recipe keeps +5.

R-QUAD-WALK (Molang; lower-leg signs and footfall order corrected)
```
p = q.modified_distance_moved*38.17 (x0.7 long legs);  m as above
walk (four-beat LH->LF->RH->RF): delay d = LH 0, LF 90, RH 180, RF 270
trot (diagonal pairs = vanilla leg0 with leg3): LF & RH 0, RF & LH 180
<leg> X "math.sin(p - d)*S*m"                                 S 25-35 (+ = leg back)
<front_low> X "math.clamp(math.sin(p - d - 90)*K, 0, K)*m"    carpus: hoof folds BACK during the swing
<hind_low>  X "math.clamp(math.sin(p - d + 90)*K, -K, 0)*m"   hock: hoof folds FORWARD
body rot Z "math.sin(p*2)*1.5*m"   body pos Y "math.cos(p*2)*0.5*m"
head rot X "-math.cos(p*2+40)*2*m"   tail_<i> rot Y "math.sin(p - i*50)*8*m"
```
Batch 4 had these wrong: its front and hind clamps were swapped, and its +phase reversed the footfall order. (This corrected version supersedes formulas in the original batch notes.)

R-SPIDER-WALK (6-8 legs; b5 #31)
- Bones: <s>_<p>_leg (hip), _leg_a (knee), _leg_b (ankle), optional _leg_tip, with p in front / front_mid / back_mid / back. core has NO keys (no bob, roll or pitch). Also back (abdomen) and <s>_fang. Legs point out along +/-X; segments below the hip rotate on Z only.
```
L = 1.0; loop true; anim_time_update "q.anim_time + q.delta_time * math.clamp(q.modified_move_speed*s, 0, 1.5)"
groups: PH 0 = L1, L3, R2, R4    PH 0.5 = L2, L4, R1, R3
SF: front/back 0.6, mids 0.45;  S: front/back 36, mids 12;  H: 15 (mids 10)
F = "math.mod(q.anim_time + PH, 1)"
left hip Y "F < SF ? S*(0.5 - F/SF) : S*((F - SF)/(1 - SF) - 0.5)"
left hip Z "F < SF ? 0 : -H*math.sin((F - SF)/(1 - SF)*180)"
left knee Z "F < SF ? K0 + (K1-K0)*F/SF : K1 + (K0-K1)*(F-SF)/(1-SF)"   front K0 15, K1 70; back K0 60, K1 20
left tip Z about +20 over rest while planted
right_* = left formulas with the right leg's own PH, Y and Z negated
back rot 0:[0,-5,0] .15:[2.5,-3,0] .5:[0,5,0] .65:[2.5,3,0] 1:[0,-5,0]
<s>_fang X 0->8->0 once per cycle, offset 0.25
```
- Write F out in full at each use. A planted tip travels about 2r*sin(S/2) per stance; match the travel per cycle.
- Vanilla spider: L/R pairs with a 90-degree wave, an abs() lift, and Y at twice the frequency.
- Signs [bb]: +Y sweeps a +X leg forward, -Z lifts it, +Z folds its knee down.

R-WING-FLAP (L 1.0-1.5; keyframes)
```
t_top = 2L/3 (slow upstroke 0->t_top, fast downstroke)
right_wing Z: 0:D (t_top-0.2):0.83U t_top:U (L-0.1):0.85D L:D     D -70 (hanging), U +60
right_wing_mid Z: same shape, amplitude F (15-20), every key +0.2 s (wrap)
right_wing_outer Z: same shape, amplitude F, keys +0.1 and +0.3 s
left_* = right_* with Z negated
torso pos Y 0:+Y t_top:-Y L:+Y   torso rot X 0:-3 t_top:+2 L:-3
back rot X 0:-6 .25:0 t_top:+2 (L-0.2):-4 L:-6
```
- Verified [bb]: +Z raises a right (-X) wing, -Z a left one (batch 4's opposite claim was wrong).
- Molang form: f = math.mod(q.anim_time, L)/L; w = f<0.667 ? -math.cos(f/0.667*180) : math.cos((f-0.667)/0.333*180). Wing Z = w*A + offset, re-evaluated at f - delay/L per segment.
- Bird: 130-150 degrees total.

R-GLIDE (L = 3.0; Molang; corrected)
```
torso pos X "math.sin(q.anim_time*120)*3"
torso pos Y "-math.cos(q.anim_time*240)*0.75"     high at the pan extremes
torso rot Z "-math.sin(q.anim_time*120)*6"        bank into the turn
torso rot Y "-math.cos(q.anim_time*120)*8"        face the travel direction
<s>_wing_mid Z "math.sin(q.anim_time*120 - 40)*4*-side"
tail_<i> X "math.sin(q.anim_time*120 - 60 - i*30)*3"
controller: glide while airborne and not climbing, flap otherwise; blend_transition 0.3
```
(Supersedes the batch-note glide formula.)

R-ATTACK (one-shot 0.4-0.6 s, hold_on_last_frame)
```
right_arm rot 0:[0,0,0] .15:[-150,10,0] .25:[-40,-15,0] .3:[-30,-18,0] .38:[-42,-14,0] .5:[0,0,0]
chest rot 0:0 .15:[0,15,0] .25:[4,-20,0] .5:0;   head rot 0:0 .15:[0,-8,0] .25:[0,12,0] .5:0
root pos .25:[0,-0.5,-1] (weight forward) .5:[0,0,0]
bite: jaw X 0->38 at .12, hold to .2, closed by .3; 42 at .14 for the snap; head pos Z -2.5 at .18; neck X +8
heavy slam: two equal keys 0.05 s apart at contact + R-IMPACT
trigger: controller state on q.is_delayed_attacking or variable.attack_time > 0 (unverified for custom mobs); time BP damage to the contact key
```

R-IMPACT (one-shot)
```
pudding (pivot on floor, L .4): scale 0:[1,1,1] .08:[1.3,.6,1.3] .2:[.9,1.25,.9] .3:[1.05,.92,1.05] .4:[1,1,1]; pos .2:[0,2,0] .3:0
magnetic (L .3): root pos Y 0:0 .06:-1.5 .3:0; head X +4 at .1
overshoot to T: 0:start .6L:1.09T .75L:.96T .85L:1.01T L:T
squash pair: [1.2,.8,1.2]->[.9,1.2,.9]->[1,1,1] in 0.1 s steps (b5 #33 [5:49])
edge impact: tilt Z 8-12 + X 2-3 on the leading edge, then the opposite edge at 1/2, 1/4, 0, 0.1-0.15 s apart
```

R-CHAIN (tails, tentacles, antennae)
```
seg_i X "math.sin(q.anim_time*360/L - i*d)*A_i"
seg_i Z "math.cos(q.anim_time*360/L - i*d)*A_i*0.5"
d 40-60; A_i 8-15; L 2-3 s idle, 0.8 s agitated. Muscle pull: use R-WING-FLAP's asymmetric w.
```

R-BOSS-IDLE (Molang)
```
tentacle_<j>_<k> X "math.sin(q.life_time*360/P_j - k*45)*A_k", Z = cos(...)*A_k*0.5   P_j 3.0, 3.7, 4.3, 5.1...; A_k = 6+0.5k
neck_<i>_<k> X "math.sin(q.life_time*360/Q_i - k*30)*4"   Q_i 4.1, 4.7, 5.3
head_<i> rot [ -(sum of neck X)*0.7, "math.sin(q.life_time*360/9 + i*70)*20", 0 ]
eye_<i> Y "math.sin(q.life_time*360/2.3 + i*110)*10"
ring Y "q.life_time*30"   plate_<m> X "math.sin(q.life_time*240 + m*90)*5"   body pos Y "math.sin(q.life_time*360/4)*1"
attack: a one-shot on ONE tentacle, blended by a controller (0.2)
```

R-MOUNT-DRIVE (board, cart, sled)
```
scripts.initialize ["v.steering = 0; v.last_yaw = q.body_y_rotation;"]
pre_animation: v.yaw_delta = q.body_y_rotation - v.last_yaw; wrap to +/-180;
               v.steering = math.lerp(v.steering, math.clamp(v.yaw_delta*12, -45, 45), 0.2); v.last_yaw = q.body_y_rotation;
wheel_* X "q.modified_distance_moved*917"   truck_front Y "v.steering/3"   truck_back Y "-v.steering/3"
body Z "-v.steering/5"   body pos Y "math.sin(q.modified_distance_moved*120)*0.1*math.clamp(q.modified_move_speed*4,0,1)"
```
The signs assume yaw grows when turning right (unverified). Check with Variable Placeholders v.steering=30 (b6 #36 [7:09]).

