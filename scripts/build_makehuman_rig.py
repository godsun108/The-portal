#!/usr/bin/env python3
"""MakeHuman CC0 reference rig → real GLB with 163 native bones and source weights.

Research export only: default source body + default.mhskel + default_weights.mhw,
all pinned to the SAME MakeHuman upstream commit. No cinematic or motion
certification. Animation intentionally omitted until independent rig QA passes.
"""
import hashlib
import json
from pathlib import Path
import struct
import sys
import numpy as np
from build_makehuman_base import parse_obj, SOURCE_COMMIT, SOURCE_REPO, OUT

def run(obj_path, skeleton_path, weights_path):
    orig, uvsrc, nsrc, faces, groups=parse_obj(obj_path)
    rig=json.loads(skeleton_path.read_text())
    weightfile=json.loads(weights_path.read_text())
    bones=rig["bones"]
    names=list(bones)
    assert len(names)>=100, "Not the real upstream skeleton"
    ids={name:i for i,name in enumerate(names)}
    joint_positions={}
    for name,b in bones.items():
        indices=rig["joints"][b["head"]]
        assert indices and max(indices)<len(orig)
        joint_positions[name]=np.mean(orig[indices],axis=0).astype(np.float32)
    # Verify acyclic parent graph before generating glTF nodes.
    def ancestry(name):
        path=set()
        while name:
            if name in path:raise RuntimeError("Cyclic skeleton parent graph")
            path.add(name);name=bones[name]["parent"]
            if name and name not in bones:raise RuntimeError("Missing skeleton parent")
    for name in names:ancestry(name)
    # Source weights are attached to ORIGINAL OBJ vertices, before UV seams split.
    influences=[[] for _ in range(len(orig))]
    missing_bones=set()
    for name,pairs in weightfile["weights"].items():
        if name not in ids:
            missing_bones.add(name);continue
        for index,weight in pairs:
            if not (0<=index<len(orig)):raise ValueError("Invalid source weight vertex")
            if weight>0:influences[index].append((ids[name],float(weight)))
    assert len(missing_bones)<5, "Too many missing native joint names"
    unique={};positions=[];uv=[];normals=[];source_indices=[];triangles=[]
    for face in faces:
        corners=[]
        for vi,ti,ni in face:
            k=(vi,ti,ni)
            if k not in unique:
                unique[k]=len(positions)
                source_indices.append(vi)
                positions.append(orig[vi])
                uv.append(uvsrc[ti] if ti is not None else [0,0])
                normals.append(nsrc[ni] if ni is not None else [0,0,0])
            corners.append(unique[k])
        triangles.extend(corners)
    pos=np.asarray(positions,dtype="<f4")
    uv=np.asarray(uv,dtype="<f4")
    norm=np.asarray(normals,dtype="<f4")
    triangles=np.asarray(triangles,dtype="<u2" if len(pos)<65536 else "<u4")
    if np.count_nonzero(norm)==0:
        t=pos[triangles.reshape(-1,3)]
        n=np.cross(t[:,1]-t[:,0],t[:,2]-t[:,0])
        np.add.at(norm,triangles,np.repeat(n,3,axis=0))
    norm/=np.maximum(np.linalg.norm(norm,axis=1,keepdims=True),1e-12)
    skel_positions=np.stack([joint_positions[name] for name in names])
    joint_ids=np.zeros((len(pos),4),dtype="<u2")
    skin_weights=np.zeros((len(pos),4),dtype="<f4")
    uncovered=0
    for i,source_index in enumerate(source_indices):
        candidates=influences[source_index]
        if not candidates:
            uncovered+=1
            nearest=int(np.argmin(np.sum((skel_positions-orig[source_index])**2,axis=1)))
            candidates=[(nearest,1.0)]
        best=sorted(candidates,key=lambda x:x[1],reverse=True)[:4]
        total=sum(value for _,value in best)
        if total<=0:raise ValueError("Invalid skin weights")
        for j,(joint,weight) in enumerate(best):
            joint_ids[i,j]=joint
            skin_weights[i,j]=weight/total
    if uncovered>len(pos)*.1:raise ValueError("Too many uncovered body vertices")
    assert np.allclose(skin_weights.sum(axis=1),1,atol=2e-5)
    assert int(joint_ids.max())<len(names)
    # glTF matrix storage: 16 floats per inverse joint bind matrix, column-major.
    inverses=np.tile(np.eye(4,dtype=np.float32),(len(names),1,1))
    inverses[:,:3,3]=-skel_positions
    inverse_array=np.stack([m.T.reshape(16) for m in inverses]).astype("<f4")
    packed=bytearray();views=[];accessors=[]
    def add(data,typ,comp,target=None,bounds=False):
        while len(packed)%4:packed.append(0)
        at=len(packed);binary=data.tobytes();packed.extend(binary)
        view={"buffer":0,"byteOffset":at,"byteLength":len(binary)}
        if target:view["target"]=target
        views.append(view)
        a={"bufferView":len(views)-1,"componentType":comp,"count":len(data),"type":typ}
        if bounds:a["min"]=data.min(axis=0).tolist();a["max"]=data.max(axis=0).tolist()
        accessors.append(a)
        return len(accessors)-1
    pa=add(pos,"VEC3",5126,34962,True)
    na=add(norm,"VEC3",5126,34962)
    ua=add(uv,"VEC2",5126,34962)
    ja=add(joint_ids,"VEC4",5123,34962)
    wa=add(skin_weights,"VEC4",5126,34962)
    ia=add(triangles,"SCALAR",5123 if triangles.dtype.itemsize==2 else 5125,34963)
    ib=add(inverse_array,"MAT4",5126)
    # Node 0 mesh; joint nodes 1..N
    nodes=[{"name":"MakeHuman_CC0_Default_Skinned_Reference","mesh":0,"skin":0}]
    roots=[]
    for name in names:
        parent=bones[name]["parent"]
        offset=joint_positions[name]-(joint_positions[parent] if parent else np.zeros(3,dtype=np.float32))
        nodes.append({"name":name,"translation":[float(a) for a in offset]})
        if parent is None:roots.append(ids[name]+1)
    for name in names:
        child=[ids[k]+1 for k in names if bones[k]["parent"]==name]
        if child:nodes[ids[name]+1]["children"]=child
    assert roots
    scene={
        "asset":{"version":"2.0","generator":"EIDOLON pinned native MakeHuman skeleton converter"},
        "scene":0,"scenes":[{"nodes":[0]+roots}],
        "nodes":nodes,"skins":[{"name":"MakeHuman_CC0_Default_Rig","inverseBindMatrices":ib,
                 "joints":list(range(1,len(names)+1)),"skeleton":roots[0]}],
        "meshes":[{"name":"MakeHuman_Anatomical_Body_Original_Weights","primitives":[{
            "attributes":{"POSITION":pa,"NORMAL":na,"TEXCOORD_0":ua,"JOINTS_0":ja,"WEIGHTS_0":wa},
            "indices":ia,"material":0}]}],
        "materials":[{"name":"Neutral_Skin_Test","doubleSided":True,
            "pbrMetallicRoughness":{"baseColorFactor":[.7,.51,.43,1],"roughnessFactor":.82,"metallicFactor":0}}],
        "buffers":[],"bufferViews":views,"accessors":accessors,
        "extras":{"nativeMakeHumanRig":True,"sourceCommit":SOURCE_COMMIT,
             "rigReadyForMotionQA":False,"photoreal":False,"license":"CC0 core MakeHuman assets"}
    }
    while len(packed)%4:packed.append(0)
    scene["buffers"]=[{"byteLength":len(packed)}]
    doc=json.dumps(scene,separators=(",",":"),allow_nan=False).encode()
    doc+=b" "*((-len(doc))%4)
    data=struct.pack("<4sII",b"glTF",2,12+8+len(doc)+8+len(packed))
    data+=struct.pack("<I4s",len(doc),b"JSON")+doc
    data+=struct.pack("<I4s",len(packed),b"BIN\x00")+packed
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"makehuman-native-rig.glb").write_bytes(data)
    info={
        "source_repo":SOURCE_REPO,"source_commit":SOURCE_COMMIT,"license":"CC0-1.0",
        "sources_sha256":{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in (obj_path,skeleton_path,weights_path)},
        "glb_sha256":hashlib.sha256(data).hexdigest(),"bytes":len(data),
        "vertices":len(pos),"triangles":len(triangles)//3,
        "joint_count":len(names),"joint_names":names,
        "unweighted_vertices_fallback":uncovered,
        "skin_weight_max_error":float(np.max(np.abs(skin_weights.sum(axis=1)-1))),
        "animations":0,"rigged":True,"photoreal":False,
        "stage166_approved":False,"source_mesh_groups":"body_only"
    }
    (OUT/"rig-manifest.json").write_text(json.dumps(info,indent=2)+"\n")
    assert struct.unpack_from("<4sII",data)==(b"glTF",2,len(data))
    print(json.dumps({k:v for k,v in info.items() if k!="joint_names"},indent=2))
if __name__=="__main__":
    if len(sys.argv)!=4:raise SystemExit("Usage: build_makehuman_rig.py base.obj default.mhskel default_weights.mhw")
    run(*(Path(s) for s in sys.argv[1:]))
