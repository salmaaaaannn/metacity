"""
METACITY — Pedestrian Walkable Graph
Provides sidewalk network and walkable pathfinding between buildings,
transit stops, stations, and intersections.
"""
import networkx as nx
import math
from typing import List, Tuple, Optional


class PedestrianGraph:
    def __init__(self):
        self.graph = nx.Graph()

    def add_node(self, node_id: str, x: float, z: float, node_type: str = "sidewalk") -> None:
        self.graph.add_node(node_id, pos=(x, z), node_type=node_type)

    def add_edge(self, from_id: str, to_id: str, length: Optional[float] = None) -> None:
        if not self.graph.has_node(from_id) or not self.graph.has_node(to_id):
            return
        if length is None:
            p1 = self.graph.nodes[from_id]["pos"]
            p2 = self.graph.nodes[to_id]["pos"]
            length = math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2)
        self.graph.add_edge(from_id, to_id, length=length)

    def get_nearest_node(self, x: float, z: float) -> Optional[str]:
        if not self.graph.nodes:
            return None
        return min(
            self.graph.nodes,
            key=lambda n: (self.graph.nodes[n]["pos"][0] - x) ** 2 + (self.graph.nodes[n]["pos"][1] - z) ** 2
        )

    def find_path(self, from_x: float, from_z: float, to_x: float, to_z: float) -> List[Tuple[float, float]]:
        """Compute walkable path between two points. Falls back to straight line if unreachable."""
        start_node = self.get_nearest_node(from_x, from_z)
        end_node = self.get_nearest_node(to_x, to_z)

        if not start_node or not end_node:
            return [(to_x, to_z)]

        if start_node == end_node:
            return [(to_x, to_z)]

        try:
            def dist_heuristic(u, v):
                pos1 = self.graph.nodes[u]["pos"]
                pos2 = self.graph.nodes[v]["pos"]
                return math.sqrt((pos2[0] - pos1[0]) ** 2 + (pos2[1] - pos1[1]) ** 2)

            node_path = nx.astar_path(self.graph, start_node, end_node, heuristic=dist_heuristic, weight="length")
            coords = [self.graph.nodes[n]["pos"] for n in node_path]
            # Ensure arrival at destination
            coords.append((to_x, to_z))
            return coords
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return [(to_x, to_z)]
