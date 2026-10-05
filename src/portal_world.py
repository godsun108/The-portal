from dataclasses import dataclass
from enum import Enum
class Domain(str,Enum): INTERIOR="interior";CITY="city";WILDERNESS="wilderness";ATMOSPHERE="atmosphere";ORBIT="orbit";SPACE="space";SURFACE="surface"
@dataclass(frozen=True)
class Zone:id:str;domain:Domain
@dataclass(frozen=True)
class Transit:source:str;target:str;mode:str;continuous:bool=True
@dataclass(frozen=True)
class WorldGraph:zones:tuple[Zone,...];transits:tuple[Transit,...]
def validate(w):
 ids={z.id for z in w.zones};return bool(ids) and all(t.source in ids and t.target in ids for t in w.transits)
def reachable(w,start,target):
 if not validate(w):return False
 e={}
 for t in w.transits:
  if t.continuous:e.setdefault(t.source,set()).add(t.target)
 seen={start};stack=[start]
 while stack:
  x=stack.pop()
  if x==target:return True
  for y in e.get(x,()):
   if y not in seen:seen.add(y);stack.append(y)
 return False
