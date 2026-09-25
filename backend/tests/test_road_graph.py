from app.simulation.roads.road_graph import RoadGraph

def test_road_graph_creation():
    graph = RoadGraph()
    graph.add_node("n1", 0, 0)
    graph.add_node("n2", 100, 0)
    graph.add_edge("n1", "n2", "street", 2, 50, 100)
    
    assert "n1" in graph.graph.nodes
    assert "n2" in graph.graph.nodes
    assert graph.graph.has_edge("n1", "n2")

def test_road_graph_pathfinding():
    graph = RoadGraph()
    graph.add_node("n1", 0, 0)
    graph.add_node("n2", 100, 0)
    graph.add_node("n3", 100, 100)
    graph.add_edge("n1", "n2", "street", 2, 50, 100)
    graph.add_edge("n2", "n3", "street", 2, 50, 100)
    
    path = graph.find_path(0, 0, 100, 100)
    assert len(path) == 3
    assert path[0] == (0, 0)
    assert path[-1] == (100, 100)

def test_bpr_travel_time():
    graph = RoadGraph()
    edge_data = {"length": 1000, "speed_limit": 50, "capacity": 1000, "volume": 500}
    t = graph.bpr_travel_time(edge_data)
    assert t > 0
