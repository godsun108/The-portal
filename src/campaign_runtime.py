"""PORTAL Campaign Runtime — persistent, resumable story progression.

Designed for mobile-first campaign play without reducing the campaign to
throwaway sessions. Progress is deterministic data that can resume across
devices and later feed richer desktop/TV/XR clients.
"""
from dataclasses import dataclass
@dataclass(frozen=True)
class Mission:
 id:str;chapter:str;requires:tuple[str,...]=();unlocks:tuple[str,...]=()
@dataclass(frozen=True)
class CampaignState:
 campaign_id:str;completed:tuple[str,...]=();active:str|None=None
def available(missions,state):
 done=set(state.completed)
 return tuple(m.id for m in missions if m.id not in done and all(x in done for x in m.requires))
def complete(state,mission):
 if mission.id in state.completed:return state
 return CampaignState(state.campaign_id,state.completed+(mission.id,),None)
def resume_target(missions,state):
 if state.active:return state.active
 a=available(missions,state);return a[0] if a else None
