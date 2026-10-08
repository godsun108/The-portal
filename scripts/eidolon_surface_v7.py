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
    def ellipsoid(cx,cy,cz,rx,ry,rz):
        return (np.sqrt(((x-cx)/rx)**2+((y-cy)/ry)**2+((z-cz)/rz)**2)-1)*min(rx,ry,rz)
    def tapered(a,b,ra,rb):
        ax,ay,az=a
        bx,by,bz=b
        dx,dy,dz=bx-ax,by-ay,bz-az
        t=np.clip(((x-ax)*dx+(y-ay)*dy+(z-az)*dz)/(dx*dx+dy*dy+dz*dz),0,1)
        r=ra*(1-t)+rb*t
        return np.sqrt((x-ax-t*dx)**2+(y-ay-t*dy)**2+(z-az-t*dz)**2)-r
    def capsule(a, b, radius):
        ax, ay, az = a
        bx, by, bz = b
        dx, dy, dz = bx-ax, by-ay, bz-az
        length_sq = dx*dx+dy*dy+dz*dz
        t = np.clip(((x-ax)*dx+(y-ay)*dy+(z-az)*dz)/length_sq, 0, 1)
        return np.sqrt((x-ax-t*dx)**2+(y-ay-t*dy)**2+(z-az-t*dz)**2)-radius
    parts = [
        ellipsoid(0,0,.925,.077,.068,.092),
        ellipsoid(0,0,.708,.139,.099,.16),
        ellipsoid(0,0,.535,.108,.090,.112),
        ellipsoid(0,0,.632,.109,.085,.185),
        tapered((0,0,.839),(0,0,.777),.044,.053),
    ]
    for side in (-1,1):
        parts += [
            tapered((side*.137,0,.755),(side*.205,0,.625),.050,.041),
            tapered((side*.205,0,.625),(side*.268,0,.447),.043,.026),
            ellipsoid(side*.277,0,.415,.031,.029,.048),
            tapered((side*.062,0,.484),(side*.09,0,.285),.065,.051),
            tapered((side*.09,0,.285),(side*.078,0,.083),.050,.035),
            ellipsoid(side*.078,-.017,.046,.049,.068,.038),
        ]
    # Experimental smooth-min union reduces hard intersections in the Stage128 field.
    # IMPORTANT: different topology from canonical Stage164; do not claim its hash/count.
    k=.032
    result=parts[0]
    for part in parts[1:]:
        h=np.clip(.5+.5*(part-result)/k,0,1)
        result=part*(1-h)+result*h-k*h*(1-h)
    return result, (xx, yy, zz)
