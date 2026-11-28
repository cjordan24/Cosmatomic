"""
Voyager Ventures — decimated human organs from BodyParts3D (Blender 4.x, headless).   Phase 12, Gate 12.1

    /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup \
        --python scripts/blender/build_body.py -- <obj_dir> <organs.json> <out.glb> <out_meta.json>

Source: BodyParts3D (Database Center for Life Science, Japan), version 4.0, “partof” OBJ set
(https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/partof_BP3D_4.0_obj_99.zip).
Licence (since 2025-02-27): Creative Commons Attribution 4.0 International — “BodyParts3D, © The Database Center for
Life Science licensed under CC Attribution 4.0 International”. Decimation is a derivative work allowed by CC BY.

For each organ (an FMA concept), every element OBJ listed for it in partof_element_parts.txt is imported, the parts
are joined, the mesh is decimated (collapse) to a triangle budget, converted from millimetres to metres, and
exported as one node named after the organ. The organ's bounding box before decimation (mm) is written to the
metadata file so sizes shown in the app come from the full-resolution data, not the decimated mesh.
"""
import json
import os
import sys

import bpy

argv = sys.argv[sys.argv.index('--') + 1:]
obj_dir, organs_path, out_glb, out_meta = argv[:4]
organs = json.load(open(organs_path))
BUDGET = {  # triangles after decimation
    'skeleton': 60000, 'brain': 16000, 'liver': 8000, 'heart': 12000, 'right-lung': 8000, 'left-lung': 7000,
    'small-intestine': 8000, 'large-intestine': 8000, 'right-kidney': 2500, 'left-kidney': 2500, 'stomach': 3000,
}

bpy.ops.wm.read_factory_settings(use_empty=True)
meta = {}
for organ, files in organs.items():
    before = set(bpy.data.objects)
    for f in files:
        p = os.path.join(obj_dir, f + '.obj')
        if os.path.exists(p):
            bpy.ops.wm.obj_import(filepath=p, forward_axis='Y', up_axis='Z')
    parts = [o for o in bpy.data.objects if o not in before and o.type == 'MESH']
    if not parts:
        raise SystemExit(f'no parts for {organ}')
    bpy.ops.object.select_all(action='DESELECT')
    for o in parts:
        o.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    if len(parts) > 1:
        bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active
    ob.name = organ
    ob.data.name = organ
    # full-resolution bounds (mm, in the file's own axes after import)
    xs = [v.co for v in ob.data.vertices]
    lo = [min(c[i] for c in xs) for i in range(3)]
    hi = [max(c[i] for c in xs) for i in range(3)]
    tris_before = sum(len(p.vertices) - 2 for p in ob.data.polygons)
    target = BUDGET.get(organ, 5000)
    if tris_before > target:
        mod = ob.modifiers.new('dec', 'DECIMATE')
        mod.ratio = target / tris_before
        bpy.ops.object.modifier_apply(modifier='dec')
    tris_after = sum(len(p.vertices) - 2 for p in ob.data.polygons)
    ob.scale = (0.001, 0.001, 0.001)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    meta[organ] = {'parts': len(parts), 'files': len(files), 'trianglesFull': tris_before, 'trianglesDecimated': tris_after,
                   'boundsMm': {'min': lo, 'max': hi}, 'extentMm': [hi[i] - lo[i] for i in range(3)]}
    print(organ, len(parts), tris_before, '->', tris_after)

bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=out_glb, export_format='GLB', use_selection=True, export_materials='NONE',
                          export_normals=True, export_texcoords=False, export_yup=True)
json.dump(meta, open(out_meta, 'w'), indent=1)
print('wrote', out_glb)
