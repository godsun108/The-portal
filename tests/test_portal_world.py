from src.portal_world import *
def test_ground_to_space_continuous():
 z=(Zone("home",Domain.INTERIOR),Zone("city",Domain.CITY),Zone("port",Domain.CITY),Zone("sky",Domain.ATMOSPHERE),Zone("orbit",Domain.ORBIT))
 t=(Transit("home","city","walk"),Transit("city","port","drive"),Transit("port","sky","ship"),Transit("sky","orbit","ship"))
 assert reachable(WorldGraph(z,t),"home","orbit")
def test_menu_jump_not_continuity():
 assert not reachable(WorldGraph((Zone("a",Domain.CITY),Zone("b",Domain.ORBIT)),(Transit("a","b","menu",False),)),"a","b")
