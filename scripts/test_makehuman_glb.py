#!/usr/bin/env python3
"""Independent packaged GLB QA gate; does not imply cinematic readiness."""
import json
from pathlib import Path
import struct
import numpy as np

BASE=Path("eidolon-human-base/assets")
def decode(path):
    b=path.read_bytes()
    assert len(b)>=28
    magic,version,size=struct.unpack_from("<4sII",b,0)
    assert (magic,version,size)==(b"glTF",2,len(b))
    length,typ=struct.unpack_from("<I4s",b,12)
    assert typ==b"JSON"
    gltf=json.loads(b[20:20+length])
    offset=20+length
    n,typ=struct.unpack_from("<I4s",b,offset)
    assert typ==b"BIN\\x00".replace(b"\\x00",b"\x00")
    binchunk=memoryview(b)[offset+8:offset+8+n]
    assert len(binchunk)==n
    return gltf,binchunk

def accessor(g,chunk,index):
    a=g["accessors"][index];view=g["bufferViews"][a["bufferView"]]
    dtype={5126:np.float32,5123:np.uint16,5125:np.uint32}[a["componentType"]]
    comps={"SCALAR":1,"VEC2":2,"VEC3":3,"VEC4":4,"MAT4":16}[a["type"]]
    at=view.get("byteOffset",0)+a.get("byteOffset",0)
    array=np.frombuffer(chunk,dtype=dtype,count=a["count"]*comps,offset=at)
    return array.reshape(-1,comps)

def main():
    sm=json.loads((BASE/"manifest.json").read_text())
    rm=json.loads((BASE/"rig-manifest.json").read_text())
    g,b=decode(BASE/"makehuman-native-rig.glb")
    assert len(g["skins"])==1
    assert len(g["skins"][0]["joints"])==rm["joint_count"]==163
    assert len(g["nodes"])==164
    primitive=g["meshes"][0]["primitives"][0]
    attrs=primitive["attributes"]
    for k in ["POSITION","NORMAL","TEXCOORD_0","JOINTS_0","WEIGHTS_0"]:assert k in attrs
    positions=accessor(g,b,attrs["POSITION"])
    normals=accessor(g,b,attrs["NORMAL"])
    joints=accessor(g,b,attrs["JOINTS_0"])
    weights=accessor(g,b,attrs["WEIGHTS_0"])
    indices=accessor(g,b,primitive["indices"])
    inverse=accessor(g,b,g["skins"][0]["inverseBindMatrices"])
    assert len(positions)==rm["vertices"]==sm["exported_vertices"]
    assert len(indices)==rm["triangles"]*3==sm["triangles"]*3
    assert len(inverse)==163
    assert np.all(np.isfinite(positions)) and np.all(np.isfinite(normals))
    assert int(joints.max())<163
    assert np.all(np.isfinite(weights)) and np.all(weights>=0)
    assert np.max(np.abs(weights.sum(axis=1)-1))<1e-5
    assert sm["body_nonmanifold_edges"]==0 and sm["body_boundary_edges"]==0
    assert sm["body_degenerate_faces"]==0
    assert rm["unweighted_vertices_fallback"]==0
    assert len(g.get("animations",[]))==0
    report={"result":"PASS: packaged glTF 2 anatomical topology and native weights","triangles":rm["triangles"],
            "unique_uv_vertices":rm["vertices"],"bones":163,"body_manifold":True,
            "skinning_weights_normalized":True,"animations":0,"photoreal":False}
    (BASE/"qa-report.json").write_text(json.dumps(report,indent=2)+"\n")
    print(json.dumps(report,indent=2))
if __name__=="__main__":main()
