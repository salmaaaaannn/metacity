import networkx as nx
from typing import List, Dict, Tuple, Optional
import math

class RoadGraph:
    def __init__(self, seed: int = 42):
        self.graph = nx.DiGraph()

    def add_node(self, node_id: str, x: float, z: float, node_type: str = 'intersection') -> None:
        self.graph.add_node(node_id, pos=(x, z), node_type=node_type)

    def add_edge(self, from_id: str, to_id: str, road_type: str, lanes: int, speed_limit: float, length: float, capacity: int = 1000) -> None:
        self.graph.add_edge(from_id, to_id, road_type=road_type, lanes=lanes, speed_limit=speed_limit, length=length, capacity=capacity, volume=0)

    def find_path(self, from_x: float, from_z: float, to_x: float, to_z: float) -> List[Tuple[float, float]]:
        start_node = self.get_nearest_node(from_x, from_z)
        end_node = self.get_nearest_node(to_x, to_z)
        if not start_node or not end_node:
            return []
            
        path_nodes = self.find_path_by_node(start_node, end_node)
        return [self.graph.nodes[n]['pos'] for n in path_nodes]

    def find_path_by_node(self, from_node: str, to_node: str) -> List[str]:
        try:
            def dist(u, v):
                u_pos = self.graph.nodes[u]['pos']
                v_pos = self.graph.nodes[v]['pos']
                return math.sqrt((u_pos[0]-v_pos[0])**2 + (u_pos[1]-v_pos[1])**2)
            
            def weight(u, v, d):
                return self.bpr_travel_time(d)
                
            return nx.astar_path(self.graph, from_node, to_node, heuristic=dist, weight=weight)
        except nx.NetworkXNoPath:
            return []

    def get_nearest_node(self, x: float, z: float) -> Optional[str]:
        if not self.graph.nodes:
            return None
        return min(self.graph.nodes, key=lambda n: math.sqrt((self.graph.nodes[n]['pos'][0]-x)**2 + (self.graph.nodes[n]['pos'][1]-z)**2))

    def bpr_travel_time(self, edge_data: dict) -> float:
        t0 = edge_data['length'] / (edge_data['speed_limit'] * 1000 / 3600 + 0.1)
        volume = edge_data.get('volume', 0)
        capacity = edge_data['capacity']
        return t0 * (1 + 0.15 * (volume/capacity)**4)

    def update_edge_volume(self, from_id: str, to_id: str, volume_delta: int) -> None:
        if self.graph.has_edge(from_id, to_id):
            self.graph[from_id][to_id]['volume'] = max(0, self.graph[from_id][to_id].get('volume', 0) + volume_delta)

    def remove_edge(self, from_id: str, to_id: str) -> None:
        if self.graph.has_edge(from_id, to_id):
            self.graph.remove_edge(from_id, to_id)

    def remove_node(self, node_id: str) -> None:
        if self.graph.has_node(node_id):
            self.graph.remove_node(node_id)

    def get_all_edges_as_list(self) -> List[dict]:
        edges = []
        for u, v, d in self.graph.edges(data=True):
            edges.append({
                "start_node_id": u,
                "end_node_id": v,
                "road_type": d.get('road_type', 'street'),
                "lanes": d.get('lanes', 2),
                "speed_limit": d.get('speed_limit', 50),
                "length": d.get('length', 0),
                "capacity": d.get('capacity', 1000)
            })
        return edges

    def get_all_nodes_as_list(self) -> List[dict]:
        nodes = []
        for n, d in self.graph.nodes(data=True):
            nodes.append({
                "id": n,
                "x": d['pos'][0],
                "z": d['pos'][1],
                "node_type": d.get('node_type', 'intersection')
            })
        return nodes
