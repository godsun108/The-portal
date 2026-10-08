#!/usr/bin/env python3
"""Rebuild the Stage128/164 canonical procedural actor and export glTF 2.0 GLB.

Research geometry ONLY: 12,240 vertices / 24,454 triangles. It is not a
photorealistic human, Luna likeness, or validated skeletal actor.
Reference: godsun108/virtual-human-engine src/vhe/eidolon_stage128.py,
eidolon_stage164.py and eidolon_stage165.py.
"""
from pathlib import Path
import hashlib
import json
import struct
import numpy as np
from skimage.measure import marching_cubes

OUT = Path("eidolon-canonical/assets")
EXPECTED_VERTICES = 12240
EXPECTED_TRIANGLES = 24454

def volume():
    xx = np.linspace(-.38, .38, 76)
    yy = np.linspace(-.19, .19, 38)
    zz = np.linspace(-.08, 1., 108)
    x, y, z = np.meshgrid(xx, yy, zz, indexing="ij")
    def sphere(cx, cy, cz, radius):
        return np.sqrt((x-cx)**2+(y-cy)**2+(z-cz)**2)-radius
    def capsule(a, b, radius):
        ax, ay, az = a
        bx, by, bz = b
        dx, dy, dz = bx-ax, by-ay, bz-az
        length_sq = dx*dx+dy*dy+dz*dz
        t = np.clip(((x-ax)*dx+(y-ay)*dy+(z-az)*dz)/length_sq, 0, 1)
        return np.sqrt((x-ax-t*dx)**2+(y-ay-t*dy)**2+(z-az-t*dz)**2)-radius
    parts = [
        sphere(0, 0, .93, .075),
        sphere(0, 0, .70, .135),
        sphere(0, 0, .52, .115),
        capsule((0, 0, .84), (0, 0, .56), .070),
    ]
    for side in (-1, 1):
        parts += [
            capsule((side*.145, 0, .745), (side*.235, 0, .60), .043),
            capsule((side*.235, 0, .60), (side*.285, 0, .43), .032),
            sphere(side*.295, 0, .405, .038),
            capsule((side*.070, 0, .485), (side*.090, 0, .275), .057),
            capsule((side*.090, 0, .275), (side*.075, 0, .065), .040),
            sphere(side*.075, -.035, .035, .045),
        ]
    return np.minimum.reduce(parts), (xx, yy, zz)

def build():
    field, (xx, yy, zz) = volume()
    vertices, faces, normals, _ = marching_cubes(
        field, level=0, spacing=(xx[1]-xx[0], yy[1]-yy[0], zz[1]-zz[0])
    )
    if (len(vertices), len(faces)) != (EXPECTED_VERTICES, EXPECTED_TRIANGLES):
        raise RuntimeError(f"Canonical topology mismatch: {len(vertices)} vertices / {len(faces)} triangles")

    # Stage128 uses x=left/right, y=depth, z=height. Rotate into glTF Y-up.
    positions = np.column_stack((
        vertices[:,0]+xx[0], vertices[:,2]+zz[0], -(vertices[:,1]+yy[0])
    )).astype("<f4")
    directions = np.column_stack((
        normals[:,0], normals[:,2], -normals[:,1]
    )).astype("<f4")
    norm_lengths = np.linalg.norm(directions, axis=1, keepdims=True)
    directions /= np.maximum(norm_lengths, 1e-12)
    indices = faces.astype("<u2").reshape(-1)

    buffer = bytearray()
    views = []
    def add_bytes(value, target):
        while len(buffer) % 4:
            buffer.append(0)
        offset = len(buffer)
        data = value.tobytes()
        buffer.extend(data)
        views.append({
            "buffer": 0, "byteOffset": offset,
            "byteLength": len(data), "target": target
        })
        return len(views)-1

    p_view=add_bytes(positions, 34962)
    n_view=add_bytes(directions, 34962)
    i_view=add_bytes(indices, 34963)
    accessors=[
        {"bufferView":p_view,"componentType":5126,"count":len(positions),
         "type":"VEC3","min":positions.min(axis=0).tolist(),
         "max":positions.max(axis=0).tolist()},
        {"bufferView":n_view,"componentType":5126,"count":len(directions),"type":"VEC3"},
        {"bufferView":i_view,"componentType":5123,"count":len(indices),"type":"SCALAR"},
    ]
    gltf={
        "asset":{"version":"2.0","generator":"EIDOLON Stage128/164 canonical bridge"},
        "scene":0,"scenes":[{"nodes":[0]}],
        "nodes":[{"name":"EIDOLON_Human_v1_Canonical_Static","mesh":0}],
        "meshes":[{"name":"canonical_stage164_24454_triangles",
                   "primitives":[{"attributes":{"POSITION":0,"NORMAL":1},
                                  "indices":2,"material":0}]}],
        "materials":[{"name":"diagnostic_warm_clay",
                      "pbrMetallicRoughness":{"baseColorFactor":[.67,.47,.38,1],
                                             "metallicFactor":0,"roughnessFactor":.86},
                      "doubleSided":True}],
        "buffers":[{"byteLength":len(buffer)}],
        "bufferViews":views,"accessors":accessors,
        "extras":{"research_only":True,"rigged":False,"animated":False,
                  "stage":164,"expectedVertices":12240,"expectedTriangles":24454}
    }
    document=json.dumps(gltf,separators=(",",":"),allow_nan=False).encode("utf-8")
    document+=b" " * ((-len(document)) % 4)
    while len(buffer)%4:
        buffer.append(0)
    glb=(
        struct.pack("<4sII",b"glTF",2,12+8+len(document)+8+len(buffer))
        + struct.pack("<I4s",len(document),b"JSON")+document
        + struct.pack("<I4s",len(buffer),b"BIN\x00")+bytes(buffer)
    )
    OUT.mkdir(parents=True,exist_ok=True)
    filename=OUT/"eidolon-human-v1-canonical.glb"
    filename.write_bytes(glb)
    manifest={
        "name":"EIDOLON Human v1",
        "stage":164,"vertex_count":len(positions),
        "triangle_count":len(faces),
        "glb_bytes":len(glb),
        "glb_sha256":hashlib.sha256(glb).hexdigest(),
        "positions_sha256":hashlib.sha256(positions.tobytes()).hexdigest(),
        "source":"VHE Stage128 signed-distance field + Stage164 extraction recipe",
        "is_skinned":False,
        "embedded_animations":0,
        "research_only":True
    }
    (OUT/"manifest.json").write_text(json.dumps(manifest,indent=2)+"\n")
    # Read back GLB header/chunks to catch packing bugs.
    magic,version,total=struct.unpack_from("<4sII",glb)
    assert (magic,version,total)==(b"glTF",2,len(glb))
    chunk_len,chunk_type=struct.unpack_from("<I4s",glb,12)
    assert chunk_type==b"JSON"
    decoded=json.loads(glb[20:20+chunk_len])
    assert decoded["accessors"][0]["count"]==12240
    assert decoded["accessors"][2]["count"]==24454*3
    print(json.dumps(manifest,indent=2))

if __name__=="__main__":
    build()
