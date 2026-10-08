"""Experimental smooth union of the original Stage128 anatomical field.

Not canonical Stage164. This explicitly changes geometry and identity.
""" 
import numpy as np

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
    # Experimental smooth-min union reduces hard intersections in the Stage128 field.
    # IMPORTANT: different topology from canonical Stage164; do not claim its hash/count.
    k=.018
    result=parts[0]
    for part in parts[1:]:
        h=np.clip(.5+.5*(part-result)/k,0,1)
        result=part*(1-h)+result*h-k*h*(1-h)
    return result, (xx, yy, zz)
