"""Experimental EIDOLON Hero Base V9: anatomical surface landmarks.

Not canonical Stage164. This explicitly changes geometry and identity.
""" 
import numpy as np

def volume():
    xx = np.linspace(-.38, .38, 96)
    yy = np.linspace(-.19, .19, 50)
    zz = np.linspace(-.08, 1.05, 140)
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
        ellipsoid(0,-.069,.935,.015,.019,.028),
        ellipsoid(0,-.084,.919,.017,.018,.014),
        ellipsoid(-.077,0,.923,.016,.026,.030),
        ellipsoid(.077,0,.923,.016,.026,.030),
        ellipsoid(0,0,.708,.125,.089,.158),
        ellipsoid(0,0,.535,.107,.085,.119),
        ellipsoid(0,0,.632,.101,.081,.17),
        tapered((0,0,.839),(0,0,.777),.039,.045),
    ]
    for side in (-1,1):
        parts += [
            tapered((side*.137,0,.755),(side*.205,0,.625),.050,.041),
            tapered((side*.205,0,.625),(side*.268,0,.447),.043,.026),
            ellipsoid(side*.277,0,.415,.031,.029,.048),
            tapered((side*.289,-.020,.414),(side*.314,-.029,.397),.009,.005),
            tapered((side*.257,-.012,.390),(side*.258,-.015,.367),.007,.004),
            tapered((side*.272,-.012,.385),(side*.274,-.015,.361),.007,.004),
            tapered((side*.286,-.011,.385),(side*.288,-.014,.362),.007,.004),
            tapered((side*.301,-.009,.392),(side*.303,-.012,.376),.006,.003),
            tapered((side*.062,0,.484),(side*.09,0,.285),.065,.051),
            tapered((side*.09,0,.285),(side*.078,0,.083),.050,.035),
            ellipsoid(side*.078,-.019,.048,.046,.067,.037),
            tapered((side*.078,-.015,.049),(side*.078,-.080,.039),.034,.026),
        ]
    # Experimental smooth-min union reduces hard intersections in the Stage128 field.
    # IMPORTANT: different topology from canonical Stage164; do not claim its hash/count.
    k=.014
    result=parts[0]
    for part in parts[1:]:
        h=np.clip(.5+.5*(part-result)/k,0,1)
        result=part*(1-h)+result*h-k*h*(1-h)
    return result, (xx, yy, zz)
