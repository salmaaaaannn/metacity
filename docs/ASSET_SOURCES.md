# METACITY - Asset Sources

This project uses free, legally permissible 3D assets (CC0, public domain, or permissive licenses) to power the virtual city simulation.

## Asset Pipeline

Assets are downloaded via the `/scripts/download-city-assets.mjs` script and placed in `/frontend/public/assets/`.
The simulation uses `AssetRegistry.ts` to map logical simulation entities (e.g., "commercial_building", "police_car") to physical GLB files.

## Source Acknowledgements

| Category | Name | Source | Author | License |
| :--- | :--- | :--- | :--- | :--- |
| Buildings | Kenney City Kit | [Kenney.nl](https://kenney.nl/assets/city-kit-commercial) | Kenney | CC0 (Public Domain) |
| Transport | Kenney Car Kit | [Kenney.nl](https://kenney.nl/assets/car-kit) | Kenney | CC0 (Public Domain) |
| Airport | Kenney Airport | [Kenney.nl](https://kenney.nl/assets/airport) | Kenney | CC0 (Public Domain) |
| Environment| Poly Haven HDRI | [PolyHaven](https://polyhaven.com/) | Various | CC0 (Public Domain) |
| Characters | Quaternius Humans | [Quaternius](https://quaternius.com/packs/casualcharacters.html) | Quaternius | CC0 (Public Domain) |

*Note: If specific GLB downloads fail during the automated build, the engine automatically falls back to procedural geometry generation to ensure the city remains playable.*
