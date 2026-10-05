from src.reality_bridge import *
def test_verified_coarse_proof_unlocks():
 o=RealityObjective("signal",ProofKind.VENUE_CATEGORY,"public_art","in_game_scan")
 assert admits(o,Proof("signal","public_art",True))
def test_safe_alternate_is_required_by_policy():
 o=RealityObjective("walk",ProofKind.ACTIVITY,"walk_1km","simulation")
 assert can_progress_without_reality(o) and not retain_raw_location()
