#!/usr/bin/env python3
"""Sixth experimental pass: gait phasing and knee flex on smooth-union body.

This is NOT a certified VHE Stage166 locomotion audit, Luna likeness, or
biomechanically validated rig. Original static canonical export is preserved.
"""
import json
import struct
import hashlib
from pathlib import Path
import numpy as np
from skimage.measure import marching_cubes
from eidolon_surface_v5 import volume

OUT=Path("eidolon-canonical/assets")
def smooth(lo,hi,x):
    t=np.clip((x-lo)/(hi-lo),0,1)
    return t*t*(3-2*t)

def build():
    field,(xx,yy,zz)=volume()
    verts,faces,normals,_=marching_cubes(field,level=0,spacing=(xx[1]-xx[0],yy[1]-yy[0],zz[1]-zz[0]))
    assert 10000 <= len(verts) < 65536 and 15000 <= len(faces) < 120000, 'Unexpected smooth-union topology'
    pos=np.column_stack((verts[:,0]+xx[0],verts[:,2]+zz[0],-(verts[:,1]+yy[0]))).astype("<f4")
    nor=np.column_stack((normals[:,0],normals[:,2],-normals[:,1])).astype("<f4")
    nor/=np.maximum(np.linalg.norm(nor,axis=1,keepdims=True),1e-8)
    names=["pelvis","spine","chest","neck","head","shoulder_l","elbow_l","hand_l","shoulder_r","elbow_r","hand_r","hip_l","knee_l","ankle_l","hip_r","knee_r","ankle_r"]
    parents=[-1,0,1,2,3,2,5,6,2,8,9,0,11,12,0,14,15]
    locations=np.array([
        (0,.47,0),(0,.60,0),(0,.74,0),(0,.84,0),(0,.94,0),
        (-.145,.745,0),(-.235,.60,0),(-.285,.43,0),
        (.145,.745,0),(.235,.60,0),(.285,.43,0),
        (-.07,.485,0),(-.09,.275,0),(-.075,.065,0),
        (.07,.485,0),(.09,.275,0),(.075,.065,0)
    ],dtype=np.float32)

    # Anatomical influence domains prevent torso vertices from being claimed
    # by leg joints merely because they are below hip height.
    # Four slots per vertex; interpolated at shoulder/hip/elbow/knee seams.
    vx=pos[:,0]; vy=pos[:,1]
    ids=np.zeros((len(pos),4),dtype=np.uint16)
    w=np.zeros((len(pos),4),dtype=np.float32)
    def assign(i, pairs):
        total=sum(q for _,q in pairs)
        if total<=0: raise ValueError("Zero skin weights")
        for k,(joint,weight) in enumerate(pairs[:4]):
            ids[i,k]=joint
            w[i,k]=weight/total

    for i,(x,y) in enumerate(zip(vx,vy)):
        ax=abs(float(x)); y=float(y)
        side=x>0
        sh,el,hand=(8,9,10) if side else (5,6,7)
        hip,knee,ankle=(14,15,16) if side else (11,12,13)
        if y>=.87 and ax<.145:
            assign(i,[(3,1-float(smooth(.85,.93,y))),(4,float(smooth(.85,.93,y)))])
        elif y>=.51 and ax>=.15:
            # Shoulder has torso/chest support; elbow takes over only distally.
            shoulder_to_elbow=float(1-smooth(.57,.665,y))
            chest_share=float(1-smooth(.145,.215,ax))
            shoulder_share=1-chest_share
            assign(i,[(2,chest_share),(sh,shoulder_share*(1-shoulder_to_elbow)),(el,shoulder_share*shoulder_to_elbow)])
        elif y>=.38 and ax>=.205:
            elbow_to_hand=float(1-smooth(.435,.525,y))
            assign(i,[(el,1-elbow_to_hand),(hand,elbow_to_hand)])
        elif y<.505 and ax>=.045:
            # Only externally positioned leg vertices are given leg bones.
            if y>=.30:
                to_knee=float(1-smooth(.32,.47,y))
                pelvis_mix=float(1-smooth(.065,.095,ax)) if y>.40 else 0.
                assign(i,[(0,pelvis_mix),(hip,(1-to_knee)*(1-pelvis_mix)),(knee,to_knee*(1-pelvis_mix))])
            else:
                to_ankle=float(1-smooth(.075,.265,y))
                assign(i,[(knee,1-to_ankle),(ankle,to_ankle)])
        elif y>.72:
            q=float(smooth(.73,.85,y))
            assign(i,[(2,1-q),(3,q)])
        elif y>.55:
            q=float(smooth(.57,.72,y))
            assign(i,[(1,1-q),(2,q)])
        else:
            q=float(smooth(.47,.60,y))
            assign(i,[(0,1-q),(1,q)])
    # V2 left abrupt skin-weight boundaries between adjoining triangles.
    # Smooth all 17 joint fields along the actual mesh topology. This is
    # geometry-aware smoothing, NOT biomechanics certification.
    dense=np.zeros((len(pos),len(names)),dtype=np.float32)
    for k in range(4):
        dense[np.arange(len(pos)),ids[:,k]]+=w[:,k]
    original=dense.copy()
    src=faces[:,[0,1,1,2,2,0]].reshape(-1)
    dst=faces[:,[1,0,2,1,0,2]].reshape(-1)
    degree=np.bincount(src,minlength=len(pos)).astype(np.float32)
    def discontinuity(weights):
        return float(np.mean(np.sum(np.abs(weights[src]-weights[dst]),axis=1)))
    rough_before=discontinuity(dense)
    for _ in range(36):
        sums=np.zeros_like(dense)
        np.add.at(sums,src,dense[dst])
        average=sums/np.maximum(degree[:,None],1)
        dense=.54*dense+.46*average
        dense/=np.maximum(dense.sum(axis=1,keepdims=True),1e-8)
    # glTF supports four influences per vertex. Retain largest four and
    # renormalize, reducing abrupt vertex-to-vertex influence switches.
    keep=np.argsort(-dense,axis=1)[:,:4]
    weights=np.take_along_axis(dense,keep,axis=1)
    weights/=np.maximum(weights.sum(axis=1,keepdims=True),1e-8)
    ids=keep.astype(np.uint16)
    w=weights.astype(np.float32)
    full=np.zeros_like(dense)
    for k in range(4):
        full[np.arange(len(pos)),ids[:,k]]+=w[:,k]
    rough_after=discontinuity(full)
    before_edges=np.sum(np.abs(original[src]-original[dst]),axis=1)
    after_edges=np.sum(np.abs(full[src]-full[dst]),axis=1)
    p95_before=float(np.percentile(before_edges,95))
    p95_after=float(np.percentile(after_edges,95))
    if p95_after>=p95_before:
        raise RuntimeError(f"High-gradient seam worsened: {p95_before} -> {p95_after}")
    if rough_after>=rough_before:
        raise RuntimeError(f"Weight smoothing did not reduce adjacency discontinuity: {rough_before} -> {rough_after}")
    print(f"Adjacency L1 discontinuity: {rough_before:.5f} -> {rough_after:.5f}")
    assert np.all(np.isfinite(w))
    assert np.allclose(w.sum(axis=1),1,atol=1e-5)
    assert np.max(ids)<len(names)
    indexes=faces.astype("<u2").reshape(-1)
    data=bytearray();views=[];acc=[]
    def accessor(arr,typ,component,target=None,minmax=False):
        while len(data)%4:data.append(0)
        offset=len(data);buf=arr.tobytes();data.extend(buf)
        v={"buffer":0,"byteOffset":offset,"byteLength":len(buf)}
        if target:v["target"]=target
        views.append(v)
        n=arr.shape[0] if arr.ndim>1 else len(arr)
        a={"bufferView":len(views)-1,"componentType":component,"count":n,"type":typ}
        if minmax:a["min"]=arr.min(axis=0).tolist();a["max"]=arr.max(axis=0).tolist()
        acc.append(a)
        return len(acc)-1
    pa=accessor(pos,"VEC3",5126,34962,True)
    na=accessor(nor,"VEC3",5126,34962)
    ja=accessor(ids,"VEC4",5123,34962)
    wa=accessor(w,"VEC4",5126,34962)
    ia=accessor(indexes,"SCALAR",5123,34963)
    inverse=np.tile(np.eye(4,dtype=np.float32),(len(names),1,1))
    for i,p in enumerate(locations): inverse[i,:3,3]=-p
    inverse_array=np.stack([m.T.reshape(16) for m in inverse]).astype("<f4")
    ib=accessor(inverse_array,"MAT4",5126)

    nodes=[{"name":"EIDOLON_Canonical_Rigged_Experimental","mesh":0,"skin":0}]
    for i,name in enumerate(names):
        parent=parents[i]
        local=locations[i]-(locations[parent] if parent>=0 else np.zeros(3))
        nodes.append({"name":name,"translation":[float(a) for a in local]})
    for i,parent in enumerate(parents):
        children=[j+1 for j,p in enumerate(parents) if p==i]
        if children:nodes[i+1]["children"]=children
    nodes[0]["extras"]={"research_only":True,"kinematics_not_validated":True}
    gltf={
        "asset":{"version":"2.0","generator":"EIDOLON V5 experimental smooth-union mesh, not Stage164 canonical"},
        "scene":0,"scenes":[{"nodes":[0,1]}],
        "nodes":nodes,
        "skins":[{"name":"experimental_canonical_skin","inverseBindMatrices":ib,"joints":list(range(1,len(names)+1)),"skeleton":1}],
        "meshes":[{"name":"stage164_24454_triangles_skin_test","primitives":[{
            "attributes":{"POSITION":pa,"NORMAL":na,"JOINTS_0":ja,"WEIGHTS_0":wa},
            "indices":ia,"material":0
        }]}],
        "materials":[{"name":"diagnostic_warm_clay","pbrMetallicRoughness":{
            "baseColorFactor":[.67,.47,.38,1],"metallicFactor":0,"roughnessFactor":.83
        },"doubleSided":True}],
        "buffers":[],"bufferViews":views,"accessors":acc,
        "extras":{"stage":164,"source_stage":164,"canonical":False,"new_vertices":len(pos),"new_triangles":len(faces),
                  "rigging":"experimental_v2_region_aware","skin_joints":len(names),
                  "locomotion_audit":"not_performed"}
    }
    times=np.linspace(0,1,33).astype("<f4")
    tacc=accessor(times,"SCALAR",5126)
    def animation(name,mode):
        # Same in-place motion cycle, revised kinematics. Not foot-locked locomotion.
        channels=[];samplers=[]
        joints=[0,2,4,5,8,11,14,12,15]
        for joint in joints:
            out=[]
            for t in times:
                phase=float(t)*2*np.pi
                if mode=="walk":
                    left=np.sin(phase); right=-left
                    # Arms counter-swing to their corresponding legs.
                    angles={
                        0:.027*np.sin(2*phase),
                        2:.017*np.sin(phase+np.pi/2),
                        4:.018*np.sin(phase+np.pi/2),
                        5:-.17*left,8:-.17*right,
                        11:.22*left,14:.22*right,
                        # Both knees bend in positive anatomical direction during swing.
                        12:.20*max(0.,-left),15:.20*max(0.,-right)
                    }
                    angle=angles[joint]
                else:
                    angle=.012*np.sin(phase) if joint in (2,4) else 0.
                half=angle/2
                # Pelvis / head yaw, chest and limbs pitch.
                out.append([0,np.sin(half),0,np.cos(half)] if joint in (0,4) else [np.sin(half),0,0,np.cos(half)])
            output=accessor(np.array(out,dtype="<f4"),"VEC4",5126)
            samplers.append({"input":tacc,"output":output,"interpolation":"LINEAR"})
            channels.append({"sampler":len(samplers)-1,"target":{"node":joint+1,"path":"rotation"}})
        return {"name":"EIDOLON_Experimental_"+mode.title(),"channels":channels,"samplers":samplers}
    gltf["animations"]=[animation("Idle","idle"),animation("Walk","walk")]
    while len(data)%4:data.append(0)
    gltf["buffers"]=[{"byteLength":len(data)}]
    doc=json.dumps(gltf,separators=(",",":"),allow_nan=False).encode()
    doc+=b" "*((-len(doc))%4)
    payload=struct.pack("<4sII",b"glTF",2,12+8+len(doc)+8+len(data))
    payload+=struct.pack("<I4s",len(doc),b"JSON")+doc
    payload+=struct.pack("<I4s",len(data),b"BIN\x00")+data
    OUT.mkdir(parents=True,exist_ok=True)
    output=OUT/"eidolon-human-v1-rigged-v6-gait.glb"
    output.write_bytes(payload)
    manifest={"stage":164,"vertices":len(pos),"triangles":len(faces),
              "joint_count":len(names),"clips":["EIDOLON_Experimental_Idle","EIDOLON_Experimental_Walk"],
              "size":len(payload),"sha256":hashlib.sha256(payload).hexdigest(),
              "skin_test_only":True,"stage166_approved":False,"deformation_version":6,"gait_revision":"counter_swing_and_nonnegative_swing_knee","foot_planting":False,"same_static_geometry_as_v5":True,"surface_strategy":"smooth_min_k_0.018","canonical_stage164":False,"weight_strategy":"mesh_adjacency_laplacian_36_pass_top4","walk_amplitudes_reduced":True,"adjacency_l1_before":rough_before,"adjacency_l1_after":rough_after,"edge_p95_before":p95_before,"edge_p95_after":p95_after}
    (OUT/"rig-v6-manifest.json").write_text(json.dumps(manifest,indent=2)+"\n")
    # Syntactic self-check (GLTFLoader/browser check happens independently).
    assert struct.unpack_from("<4sII",payload)==(b"glTF",2,len(payload))
    n,t=struct.unpack_from("<I4s",payload,12)
    assert t==b"JSON"
    parsed=json.loads(payload[20:20+n]);assert len(parsed["animations"])==2
    print(json.dumps(manifest,indent=2))

if __name__=="__main__":build()
