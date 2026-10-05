"""PORTAL Reality Bridge — privacy-preserving real-world mission contract.

Gameplay may react to coarse place/category/time/activity proofs without
requiring persistent raw-location history. Real-world objectives must always
have a safe accessible alternate path.
"""
from dataclasses import dataclass
from enum import Enum
class ProofKind(str,Enum):
 REGION="region";VENUE_CATEGORY="venue_category";ACTIVITY="activity";TIME_WINDOW="time_window";AR="ar"
@dataclass(frozen=True)
class RealityObjective:
 id:str;proof:ProofKind;requirement:str;alternate:str;optional:bool=True
@dataclass(frozen=True)
class Proof:
 objective_id:str;claim:str;verified:bool
def admits(obj,proof):
 return proof.objective_id==obj.id and proof.verified and proof.claim==obj.requirement
def can_progress_without_reality(obj):return bool(obj.alternate)
def retain_raw_location():return False
