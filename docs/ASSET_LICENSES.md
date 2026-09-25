# METACITY Asset Licensing & Provenance Registry

This document records the licensing, provenance, and attribution details for all 3D models, textures, sprites, and environmental props utilized in METACITY.

METACITY strictly adheres to permissive open-source licensing:
- **No Proprietary Assets**: Zero assets from SimCity, Maxis, Electronic Arts, or proprietary games are used.
- **No Unlicensed Assets**: No assets scraped from search engines or unverified copyright repositories.
- **Permissive Licensing**: All assets are CC0 (Public Domain Dedication) or MIT licensed.

---

## 1. Asset Registry Summary

| Asset Category | Primary Format | Source / Creator | License | Attribution Requirement |
| :--- | :--- | :--- | :--- | :--- |
| **Buildings: Residential** | GLB (glTF 2.0 Binary) | METACITY Engine / Kenney Urban CC0 inspiration | CC0 1.0 Universal | None (Public Domain) |
| **Buildings: Commercial & Office** | GLB (glTF 2.0 Binary) | METACITY Engine / Kenney Commercial CC0 | CC0 1.0 Universal | None (Public Domain) |
| **Buildings: Industrial & Warehouses** | GLB (glTF 2.0 Binary) | METACITY Engine / Kenney Industrial CC0 | CC0 1.0 Universal | None (Public Domain) |
| **Buildings: Civic & Transit** | GLB (glTF 2.0 Binary) | METACITY Engine / OpenGameArt Public Domain | CC0 1.0 Universal | None (Public Domain) |
| **Vehicles: Cars, SUVs, Trucks, Buses** | GLB (glTF 2.0 Binary) | METACITY Engine / Kenney Car Kit CC0 | CC0 1.0 Universal | None (Public Domain) |
| **Vehicles: Emergency (Police, Fire, Ambulance)** | GLB (glTF 2.0 Binary) | METACITY Engine / Kenney Emergency CC0 | CC0 1.0 Universal | None (Public Domain) |
| **Transit: Metro & Heavy Rail Trains** | GLB (glTF 2.0 Binary) | METACITY Engine / CC0 Public Domain | CC0 1.0 Universal | None (Public Domain) |
| **Street Furniture & Signals** | GLB (glTF 2.0 Binary) | METACITY Engine / Kenney City Kit CC0 | CC0 1.0 Universal | None (Public Domain) |
| **Vegetation: Trees, Shrubs & Rocks** | GLB (glTF 2.0 Binary) | METACITY Engine / Poly Haven & Kenney Nature CC0 | CC0 1.0 Universal | None (Public Domain) |
| **Interiors: Office, Hospital, School, Shop, Home** | GLB & Modular Primitives | METACITY Modular Interior Engine | MIT License | Optional attribution |
| **PBR Textures: Asphalt, Concrete, Brick, Glass, Metal** | PNG / WebP & Procedural Atlases | METACITY Engine / Poly Haven CC0 | CC0 1.0 Universal | None (Public Domain) |
| **Citizen Sprites & Animation Atlases** | PNG RGBA 32-bit / HTML5 Atlases | METACITY Citizen Studio / OpenGameArt CC0 | CC0 1.0 Universal | None (Public Domain) |

---

## 2. Source Repositories & Upstream References

1. **Kenney (Asset Forge / City Kits)**
   - Author: Kenney Vleugels ([kenney.nl](https://kenney.nl))
   - License: CC0 1.0 Universal ([Creative Commons CC0](https://creativecommons.org/publicdomain/zero/1.0/))
   - Packs referenced: City Kit Commercial, City Kit Suburban, City Kit Industrial, City Kit Roads, Car Kit, Furniture Kit.

2. **Poly Haven**
   - Repository: [polyhaven.com](https://polyhaven.com)
   - License: CC0 1.0 Universal
   - Assets referenced: PBR textures (asphalt, concrete, red brick, corrugated metal, architectural glass).

3. **OpenGameArt**
   - Repository: [opengameart.org](https://opengameart.org)
   - License: CC0 / Public Domain
   - Assets referenced: Urban character sprites, street props.

4. **Three.js & React Three Fiber**
   - Author: Ricardo Cabello (mrdoob) & PMNDRS
   - License: MIT License
   - Assets referenced: GLTFExporter, GLTFLoader, OrbitControls, Sky shader.

---

## 3. Compliance Verification Checklist

- [x] All 3D assets comply with glTF 2.0 standard binary format (.glb).
- [x] All textures use standard sRGB / linear color spaces appropriate for PBR standard materials.
- [x] Zero copyrighted game brandings, corporate trademarks, or proprietary meshes exist.
- [x] Automatic fallback is guaranteed if any asset fails to load.
