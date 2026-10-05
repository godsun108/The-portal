from src.campaign_runtime import *
def test_campaign_unlocks_in_order():
 ms=(Mission("m1","arrival"),Mission("m2","launch",("m1",)))
 s=CampaignState("first-flight");assert available(ms,s)==("m1",)
 s=complete(s,ms[0]);assert available(ms,s)==("m2",) and resume_target(ms,s)=="m2"
def test_resume_active_mission():
 assert resume_target((),CampaignState("x",(), "checkpoint-7"))=="checkpoint-7"
