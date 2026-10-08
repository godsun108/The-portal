#!/usr/bin/env python3
"""Import pinned CC0 MakeHuman base OBJ into a truthful, static glTF 2 GLB.

The base is not an EIDOLON identity, fitted garment or rig. This stage validates
reproducible polygonal human topology, UVs, and provenance, without implying
photorealism. Fetch is performed in the dedicated GitHub Actions workflow.
"""
import hashlib
import json
from pathlib import Path
import struct
import sys
import numpy as np

SOURCE_REPO = "makehumancommunity/makehuman"
SOURCE_COMMIT = "a8bc2d54ff0ac92e78ff71431b1023eda42bf482"
SOURCE_PATH = "makehuman/data/3dobjs/base.obj"
LICENSE = "CC0-1.0 (MakeHuman bundled core assets)"
OUT = Path("eidolon-human-base/assets")

def parse_obj(path):
    verts=[]; tex=[]; normals=[]; triangle_faces=[]; groups={}
    group="default"
    for line in path.read_text(errors="replace").splitlines():
        s=line.strip()
        if not s or s.startswith("#"):continue
        fields=s.split(); kind=fields[0]
        if kind=="v" and len(fields)>=4:verts.append(tuple(float(x) for x in fields[1:4]))
        elif kind=="vt" and len(fields)>=3:tex.append(tuple(float(x) for x in fields[1:3]))
        elif kind=="vn" and len(fields)>=4:normals.append(tuple(float(x) for x in fields[1:4]))
        elif kind in ("g","o"):
            group="_".join(fields[1:]) or "unnamed"
        elif kind=="f":
            corners=fields[1:]
            if len(corners)<3:continue
            def index(raw,length):
                if not raw:return None
                n=int(raw)
                return n-1 if n>0 else length+n
            parsed=[]
            for corner in corners:
                items=corner.split("/")
                vi=index(items[0],len(verts))
                ti=index(items[1],len(tex)) if len(items)>1 else None
                ni=index(items[2],len(normals)) if len(items)>2 else None
                if vi is None or vi<0 or vi>=len(verts):raise ValueError("Invalid OBJ vertex reference")
                if ti is not None and (ti<0 or ti>=len(tex)):raise ValueError("Invalid OBJ UV reference")
                if ni is not None and (ni<0 or ni>=len(normals)):raise ValueError("Invalid OBJ normal reference")
                parsed.append((vi,ti,ni))
            # OBJ polygon fans; suitable for bundled quad base, not all arbitrary n-gons.
            for j in range(1,len(parsed)-1):
                triangle_faces.append((parsed[0],parsed[j],parsed[j+1]))
                groups[group]=groups.get(group,0)+1
    if len(verts)<4 or not triangle_faces:raise ValueError("OBJ missing mesh data")
    return (np.asarray(verts,dtype=np.float32),np.asarray(tex,dtype=np.float32).reshape(-1,2),
            np.asarray(normals,dtype=np.float32).reshape(-1,3),triangle_faces,groups)

def build(source):
    raw=source.read_bytes()
    verts,uvs,normal_source,faces,groups=parse_obj(source)
    unique={}; positions=[]; texcoords=[]; source_normals=[]; indices=[]
    for face in faces:
        for corner in face:
            if corner not in unique:
                unique[corner]=len(positions)
                positions.append(verts[corner[0]])
                texcoords.append(uvs[corner[1]] if corner[1] is not None else [0.,0.])
                source_normals.append(normal_source[corner[2]] if corner[2] is not None else [0.,0.,0.])
            indices.append(unique[corner])
    pos=np.asarray(positions,dtype=np.float32)
    uv=np.asarray(texcoords,dtype="<f4")
    if not np.all(np.isfinite(pos)):raise ValueError("Nonfinite vertices")
    # OBJ coordinates are preserved: adaptive normalization for viewer, not destructive scaling.
    n=np.asarray(source_normals,dtype=np.float32)
    fidx=np.asarray(indices,dtype=np.uint32).reshape(-1,3)
    if not len(normal_source) or np.count_nonzero(n)==0:
        n[:]=0
        tri=pos[fidx]
        vectors=np.cross(tri[:,1]-tri[:,0],tri[:,2]-tri[:,0])
        np.add.at(n,fidx.reshape(-1),np.repeat(vectors,3,axis=0))
    norms=np.linalg.norm(n,axis=1,keepdims=True)
    n=n/np.maximum(norms,1e-12)
    idx=fidx.reshape(-1)
    index_type=5123 if len(pos)<65536 else 5125
    idx=idx.astype("<u2" if index_type==5123 else "<u4")
    bbox_min=pos.min(axis=0);bbox_max=pos.max(axis=0)
    out=bytearray();views=[];accessors=[]
    def add(arr,typ,comp,target=None,bounds=False):
        while len(out)%4:out.append(0)
        binary=arr.tobytes();start=len(out);out.extend(binary)
        view={"buffer":0,"byteOffset":start,"byteLength":len(binary)}
        if target:view["target"]=target
        views.append(view)
        accessor={"bufferView":len(views)-1,"componentType":comp,"count":len(arr),"type":typ}
        if bounds:
            accessor["min"]=arr.min(axis=0).tolist()
            accessor["max"]=arr.max(axis=0).tolist()
        accessors.append(accessor)
        return len(accessors)-1
    pa=add(pos.astype("<f4"),"VEC3",5126,34962,True)
    na=add(n.astype("<f4"),"VEC3",5126,34962)
    ta=add(uv,"VEC2",5126,34962)
    ia=add(idx,"SCALAR",index_type,34963)
    while len(out)%4:out.append(0)
    scene={
        "asset":{"version":"2.0","generator":"EIDOLON licensed anatomical base importer v1"},
        "scenes":[{"nodes":[0]}],"scene":0,
        "nodes":[{"mesh":0,"name":"MakeHuman_CC0_Anatomical_Base_Unrigged"}],
        "meshes":[{"name":"MakeHuman_Base_Reference","primitives":[{"attributes":{"POSITION":pa,"NORMAL":na,"TEXCOORD_0":ta},"indices":ia,"material":0}]}],
        "materials":[{"name":"Neutral_Body_Test_Only","doubleSided":True,"pbrMetallicRoughness":{"baseColorFactor":[0.66,0.48,0.41,1],"metallicFactor":0,"roughnessFactor":0.84}}],
        "accessors":accessors,"bufferViews":views,"buffers":[{"byteLength":len(out)}],
        "extras":{"source":SOURCE_REPO,"sourceCommit":SOURCE_COMMIT,"sourcePath":SOURCE_PATH,"license":LICENSE,"rigged":False,"photoreal":False}
    }
    doc=json.dumps(scene,separators=(",",":"),allow_nan=False).encode()
    doc+=b" "*((-len(doc))%4)
    glb=struct.pack("<4sII",b"glTF",2,12+8+len(doc)+8+len(out))
    glb+=struct.pack("<I4s",len(doc),b"JSON")+doc+struct.pack("<I4s",len(out),b"BIN\x00")+out
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"makehuman-base-static.glb").write_bytes(glb)
    manifest={
        "source_repository":SOURCE_REPO,"source_commit":SOURCE_COMMIT,
        "source_path":SOURCE_PATH,"source_license":LICENSE,
        "source_sha256":hashlib.sha256(raw).hexdigest(),"asset_sha256":hashlib.sha256(glb).hexdigest(),
        "original_vertices":len(verts),"exported_vertices":len(pos),"triangles":len(fidx),
        "uv_entries":len(uvs),"groups":groups,
        "bbox_min":bbox_min.tolist(),"bbox_max":bbox_max.tolist(),
        "bytes":len(glb),"rigged":False,"animations":0,"photoreal":False,
        "certified":"importer-structure-only","asset_status":"research-reference"
    }
    (OUT/"manifest.json").write_text(json.dumps(manifest,indent=2)+"\n")
    assert struct.unpack_from("<4sII",glb)==(b"glTF",2,len(glb))
    assert len(fidx)>1000, "Not a proper anatomical source mesh"
    assert len(uvs)>100, "Missing source UVs"
    print(json.dumps(manifest,indent=2))
if __name__=="__main__":
    if len(sys.argv)!=2:raise SystemExit("Usage: build_makehuman_base.py path/to/base.obj")
    build(Path(sys.argv[1]))
