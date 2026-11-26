"""
Voyager Ventures — procedural Voyager spacecraft model (Blender 4.x, headless).

    /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup \
        --python scripts/blender/build_voyager.py -- <project_root>

ILLUSTRATIVE MODEL built from published dimensions (NASA/JPL Voyager mission
fact sheets / "Voyager Spacecraft" description). It is not engineering CAD;
part placement is approximate. Units: metres (1 Blender unit = 1 m).

Frame: +Z = high-gain-antenna boresight (points at Earth in flight).
glTF export converts Blender +Z-up to glTF +Y-up, so in three.js the HGA
boresight is +Y.

Published dimensions used:
  high-gain antenna diameter        3.66 m
  bus: 10-sided, across flats       1.78 m, height 0.47 m
  magnetometer boom                 13 m (magnetometers at ~6 m and tip)
  RTGs (MHW-RTG), 3 in tandem       ~0.40 m diameter x 0.51 m each, finned
  science boom (to scan platform)   ~2.3 m
  plasma-wave / radio antennas      2 x 10 m whips, ~90 deg apart
  Golden Record                     0.305 m (12 in) gold-plated disc on the bus
"""
import math
import os
import sys

import bmesh
import bpy
from mathutils import Euler, Matrix, Vector

ROOT = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else os.getcwd()
BLEND_OUT = os.path.join(ROOT, "assets", "blender", "voyager.blend")
GLB_OUT = os.path.join(ROOT, "public", "models", "voyager.glb")
RENDER_OUT = os.path.join(ROOT, "screenshots", "phase-01", "19-blender-voyager-render.png")

# --------------------------------------------------------------------------- scene reset
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"
scene.unit_settings.scale_length = 1.0
root = bpy.data.objects.new("Voyager", None)
scene.collection.objects.link(root)


def material(name, color, metallic=0.0, roughness=0.5, emissive=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if emissive:
        bsdf.inputs["Emission Color"].default_value = (*emissive, 1.0)
        bsdf.inputs["Emission Strength"].default_value = 1.0
    return m


M_WHITE = material("HGA_white_paint", (0.86, 0.86, 0.84), 0.0, 0.55)
M_MLI = material("Bus_black_MLI", (0.05, 0.05, 0.055), 0.2, 0.6)
M_GOLD = material("Gold_foil", (0.83, 0.62, 0.22), 1.0, 0.28)
M_ALU = material("Aluminium", (0.62, 0.63, 0.66), 0.9, 0.35)
M_DARK = material("Dark_metal", (0.16, 0.16, 0.17), 0.7, 0.45)
M_BOOM = material("Boom_fibreglass", (0.75, 0.72, 0.62), 0.0, 0.6)
M_LENS = material("Optics_black", (0.01, 0.01, 0.015), 0.0, 0.15)


def link(obj, mat=None, parent=root):
    scene.collection.objects.link(obj)
    obj.parent = parent
    if mat is not None:
        obj.data.materials.append(mat)
    return obj


def mesh_obj(name, bm, mat, parent=root):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    return link(bpy.data.objects.new(name, me), mat, parent)


def cylinder(name, radius, depth, mat, segments=24, loc=(0, 0, 0), rot=(0, 0, 0), parent=root):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=segments, radius1=radius, radius2=radius, depth=depth)
    o = mesh_obj(name, bm, mat, parent)
    o.location = loc
    o.rotation_euler = Euler(rot)
    return o


def box(name, size, mat, loc=(0, 0, 0), rot=(0, 0, 0), parent=root):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector(size), verts=bm.verts)
    o = mesh_obj(name, bm, mat, parent)
    o.location = loc
    o.rotation_euler = Euler(rot)
    return o


def rod(name, start, end, radius, mat, segments=10, parent=root):
    """Thin cylinder between two points."""
    a, b = Vector(start), Vector(end)
    d = b - a
    o = cylinder(name, radius, d.length, mat, segments, parent=parent)
    o.location = (a + b) / 2
    o.rotation_euler = d.to_track_quat("Z", "Y").to_euler()
    return o


# --------------------------------------------------------------------------- bus (decagon)
BUS_H = 0.47
R_FLATS = 1.78 / 2
R_CIRC = R_FLATS / math.cos(math.pi / 10)
bm = bmesh.new()
bmesh.ops.create_cone(bm, cap_ends=True, segments=10, radius1=R_CIRC, radius2=R_CIRC, depth=BUS_H)
bus = mesh_obj("Bus_decagon", bm, M_MLI)
bus.data.polygons.foreach_set("use_smooth", [False] * len(bus.data.polygons))
cylinder("Bus_top_gold_band", R_CIRC * 1.005, 0.06, M_GOLD, 10, loc=(0, 0, BUS_H / 2 - 0.03))
# propellant tank under the bus (hydrazine sphere, ~0.71 m)
bm = bmesh.new()
bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=12, radius=0.36)
tank = mesh_obj("Hydrazine_tank", bm, M_ALU)
tank.location = (0, 0, -BUS_H / 2 - 0.18)

# Golden Record on one bus face (12-inch gold-plated copper disc + aluminium cover)
face_angle = math.radians(18)  # centre of a flat
rec_pos = Vector((math.cos(face_angle) * (R_FLATS + 0.012), math.sin(face_angle) * (R_FLATS + 0.012), 0.0))
rec = cylinder("Golden_Record", 0.305 / 2, 0.012, M_GOLD, 48, loc=rec_pos, rot=(0, math.pi / 2, face_angle))

# --------------------------------------------------------------------------- high-gain antenna (parabolic)
D = 3.66
DEPTH = 0.55
F = D * D / (16 * DEPTH)  # focal length of the paraboloid z = r^2 / 4F
Z0 = BUS_H / 2 + 0.08
bm = bmesh.new()
rings, segs = 14, 64
verts = []
for i in range(rings + 1):
    r = (D / 2) * i / rings
    z = Z0 + r * r / (4 * F)
    row = []
    for j in range(segs):
        if i == 0:
            row = [bm.verts.new((0, 0, Z0))] * segs
            break
        a = 2 * math.pi * j / segs
        row.append(bm.verts.new((r * math.cos(a), r * math.sin(a), z)))
    verts.append(row)
for i in range(rings):
    for j in range(segs):
        a, b = verts[i][j], verts[i][(j + 1) % segs]
        c, d = verts[i + 1][(j + 1) % segs], verts[i + 1][j]
        if i == 0:
            bm.faces.new((a, c, d)) if a is not None else None
        else:
            bm.faces.new((a, b, c, d))
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
dish = mesh_obj("HGA_dish", bm, M_WHITE)
mod = dish.modifiers.new("thickness", "SOLIDIFY")
mod.thickness = 0.025
cylinder("HGA_rim", D / 2 + 0.01, 0.03, M_WHITE, 64, loc=(0, 0, Z0 + DEPTH))
# Cassegrain subreflector supported by a tripod, with the low-gain antenna on top
SUB_Z = Z0 + F * 0.92
cylinder("HGA_subreflector", 0.24, 0.05, M_WHITE, 32, loc=(0, 0, SUB_Z))
for k in range(3):
    a = 2 * math.pi * k / 3
    rim = (math.cos(a) * D * 0.42, math.sin(a) * D * 0.42, Z0 + (D * 0.42) ** 2 / (4 * F))
    rod(f"HGA_strut_{k}", rim, (0, 0, SUB_Z - 0.02), 0.012, M_ALU)
bm = bmesh.new()
bmesh.ops.create_cone(bm, cap_ends=True, segments=24, radius1=0.09, radius2=0.0, depth=0.18)
lga = mesh_obj("Low_gain_antenna", bm, M_WHITE)
lga.location = (0, 0, SUB_Z + 0.12)
cylinder("HGA_feed", 0.07, 0.45, M_DARK, 16, loc=(0, 0, Z0 + 0.22))

# --------------------------------------------------------------------------- booms (in the bus plane)
def dir_xy(deg):
    return Vector((math.cos(math.radians(deg)), math.sin(math.radians(deg)), 0))


# RTG boom → three finned MHW-RTGs in tandem
RTG_DIR = dir_xy(200)
rtg_root = RTG_DIR * R_FLATS
rod("RTG_boom", rtg_root, rtg_root + RTG_DIR * 2.6, 0.025, M_ALU)
for k in range(3):
    c = rtg_root + RTG_DIR * (0.9 + 0.58 * k) + Vector((0, 0, -0.05))
    rot = RTG_DIR.to_track_quat("Z", "Y").to_euler()
    can = cylinder(f"RTG_{k + 1}", 0.2, 0.51, M_DARK, 24)
    can.location = c
    can.rotation_euler = rot
    for f in range(6):
        fa = 2 * math.pi * f / 6
        fin = box(f"RTG_{k + 1}_fin_{f}", (0.1, 0.01, 0.46), M_DARK, parent=can)
        fin.location = (math.cos(fa) * 0.24, math.sin(fa) * 0.24, 0)
        fin.rotation_euler = (0, 0, fa)

# Science boom → scan platform with cameras and spectrometers
SCI_DIR = dir_xy(20)
sci_root = SCI_DIR * R_FLATS
sci_tip = sci_root + SCI_DIR * 2.3 + Vector((0, 0, 0.1))
rod("Science_boom", sci_root, sci_tip, 0.035, M_ALU)
plat = box("Scan_platform", (0.55, 0.45, 0.32), M_MLI, loc=sci_tip + Vector((0, 0, 0.25)))
box("Scan_platform_gold", (0.56, 0.46, 0.05), M_GOLD, loc=sci_tip + Vector((0, 0, 0.42)))
# ISS narrow-angle (long) and wide-angle cameras, IRIS telescope (large), UVS, PPS
cylinder("ISS_narrow_angle_camera", 0.09, 0.95, M_WHITE, 20, loc=sci_tip + Vector((0.12, -0.1, 0.62)), rot=(0, 0, 0))
cylinder("ISS_narrow_angle_lens", 0.07, 0.02, M_LENS, 20, loc=sci_tip + Vector((0.12, -0.1, 1.10)))
cylinder("ISS_wide_angle_camera", 0.07, 0.55, M_WHITE, 20, loc=sci_tip + Vector((-0.1, -0.12, 0.55)))
cylinder("IRIS_telescope", 0.25, 0.45, M_GOLD, 32, loc=sci_tip + Vector((-0.05, 0.22, 0.62)))
cylinder("IRIS_aperture", 0.22, 0.02, M_LENS, 32, loc=sci_tip + Vector((-0.05, 0.22, 0.85)))
box("UVS_spectrometer", (0.18, 0.12, 0.4), M_DARK, loc=sci_tip + Vector((0.22, 0.12, 0.55)))
# boom-mounted fields & particles instruments (CRS, LECP)
box("CRS_cosmic_ray", (0.3, 0.25, 0.25), M_GOLD, loc=sci_root + SCI_DIR * 1.1 + Vector((0, 0, 0.2)))
cylinder("LECP_low_energy_charged_particles", 0.12, 0.3, M_ALU, 20, loc=sci_root + SCI_DIR * 1.7 + Vector((0, 0, 0.2)))

# Magnetometer boom — 13 m Astromast lattice (three longerons + rings), sensors at 6 m and tip
MAG_DIR = dir_xy(110)
mag_root = MAG_DIR * R_FLATS + Vector((0, 0, 0.1))
perp1 = MAG_DIR.cross(Vector((0, 0, 1))).normalized()
perp2 = MAG_DIR.cross(perp1).normalized()
L = 13.0
for k in range(3):
    a = 2 * math.pi * k / 3
    off = (perp1 * math.cos(a) + perp2 * math.sin(a)) * 0.08
    rod(f"MAG_longeron_{k}", mag_root + off, mag_root + MAG_DIR * L + off * 0.4, 0.006, M_BOOM, 6)
for s in range(1, 27):
    c = mag_root + MAG_DIR * (L * s / 27)
    ring = cylinder(f"MAG_batten_{s}", 0.08 * (1 - 0.6 * s / 27), 0.008, M_BOOM, 12)
    ring.location = c
    ring.rotation_euler = MAG_DIR.to_track_quat("Z", "Y").to_euler()
box("Magnetometer_inboard", (0.12, 0.12, 0.12), M_DARK, loc=mag_root + MAG_DIR * 6.0)
box("Magnetometer_outboard", (0.14, 0.14, 0.14), M_DARK, loc=mag_root + MAG_DIR * L)

# Plasma-wave / planetary-radio-astronomy antennas: two 10 m whips ~90 deg apart
for k, deg in enumerate((290, 340)):
    d = dir_xy(deg) + Vector((0, 0, -0.35))
    d.normalize()
    start = dir_xy(deg) * R_FLATS + Vector((0, 0, -0.1))
    rod(f"PWS_PRA_antenna_{k + 1}", start, start + d * 10.0, 0.008, M_ALU, 6)

# Thruster clusters / attitude sensors (small details)
for k in range(4):
    a = math.radians(45 + 90 * k)
    box(f"Thruster_cluster_{k}", (0.1, 0.1, 0.08), M_ALU, loc=(math.cos(a) * 0.7, math.sin(a) * 0.7, -BUS_H / 2 - 0.05))
cylinder("Sun_sensor", 0.05, 0.12, M_DARK, 12, loc=(0, 0.9, Z0 + DEPTH + 0.08))

# --------------------------------------------------------------------------- save, export
os.makedirs(os.path.dirname(BLEND_OUT), exist_ok=True)
os.makedirs(os.path.dirname(GLB_OUT), exist_ok=True)
for o in scene.objects:
    o.select_set(True)
bpy.ops.object.select_all(action="SELECT")
bpy.context.view_layer.objects.active = root
bpy.ops.export_scene.gltf(
    filepath=GLB_OUT,
    export_format="GLB",
    export_apply=True,  # bake the solidify modifier
    export_yup=True,
    export_extras=True,
    export_cameras=False,
    export_lights=False,
)
root["voyager_ventures"] = "Illustrative model from published NASA/JPL dimensions; +Z (glTF +Y) = HGA boresight."

# --------------------------------------------------------------------------- preview render
cam_data = bpy.data.cameras.new("PreviewCam")
cam_data.lens = 40
cam = bpy.data.objects.new("PreviewCam", cam_data)
scene.collection.objects.link(cam)
cam.location = (6.5, -13.5, 7.0)
cam.rotation_euler = (Vector((0.6, 1.8, -0.6)) - cam.location).to_track_quat("-Z", "Y").to_euler()
fill = bpy.data.objects.new("Fill", bpy.data.lights.new("Fill", "SUN"))
fill.data.energy = 0.8
fill.data.color = (0.55, 0.65, 1.0)
fill.rotation_euler = (math.radians(-60), 0, math.radians(-140))
scene.collection.objects.link(fill)
scene.camera = cam
sun = bpy.data.objects.new("Sun", bpy.data.lights.new("Sun", "SUN"))
sun.data.energy = 4.5
sun.rotation_euler = (math.radians(50), math.radians(10), math.radians(35))
scene.collection.objects.link(sun)
world = bpy.data.worlds.new("Space")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.004, 0.006, 0.015, 1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.6
scene.world = world
scene.render.resolution_x, scene.render.resolution_y = 1600, 1000
scene.render.film_transparent = False
scene.view_settings.view_transform = "AgX" if "AgX" in [i.identifier for i in scene.view_settings.bl_rna.properties["view_transform"].enum_items] else "Filmic"
try:
    scene.render.engine = "BLENDER_EEVEE_NEXT"
except TypeError:
    scene.render.engine = "BLENDER_EEVEE"
scene.render.filepath = RENDER_OUT
os.makedirs(os.path.dirname(RENDER_OUT), exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)
try:
    bpy.ops.render.render(write_still=True)
    print("RENDER_OK", RENDER_OUT)
except Exception as exc:  # GPU-less environments
    print("RENDER_EEVEE_FAILED", exc)
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 48
    bpy.ops.render.render(write_still=True)
    print("RENDER_OK_CYCLES", RENDER_OUT)

tris = sum(len(o.data.polygons) for o in scene.objects if o.type == "MESH")
print(f"VOYAGER_OK objects={len(scene.objects)} faces={tris} glb={GLB_OUT} blend={BLEND_OUT}")
