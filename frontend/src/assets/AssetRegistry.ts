/**
 * AssetRegistry.ts
 * 
 * Maps logical simulation entities to physical 3D asset paths.
 * Allows the engine to request a category (e.g., "commercial") and get a valid GLB path.
 */

export type AssetCategory = 
  | 'residential_low' | 'residential_high' 
  | 'commercial' | 'office' | 'skyscraper'
  | 'industrial' | 'hospital' | 'school' 
  | 'police' | 'fire' | 'government'
  | 'car' | 'bus' | 'truck' | 'police_car' | 'firetruck' | 'ambulance'
  | 'metro' | 'train' | 'aircraft'
  | 'airport_terminal' | 'control_tower' | 'hangar';

interface AssetEntry {
  id: string;
  category: AssetCategory;
  path: string;
  scale?: [number, number, number];
  rotation?: [number, number, number];
}

const REGISTRY: AssetEntry[] = [
  // --- BUILDINGS ---
  { id: 'b_res_01', category: 'residential_low', path: '/assets/buildings/house_01.glb' },
  { id: 'b_res_02', category: 'residential_low', path: '/assets/buildings/house_02.glb' },
  { id: 'b_res_high_01', category: 'residential_high', path: '/assets/buildings/apartment_01.glb' },
  { id: 'b_com_01', category: 'commercial', path: '/assets/buildings/commercial_01.glb' },
  { id: 'b_off_01', category: 'office', path: '/assets/buildings/office_01.glb' },
  { id: 'b_sky_01', category: 'skyscraper', path: '/assets/buildings/skyscraper_01.glb' },
  { id: 'b_ind_01', category: 'industrial', path: '/assets/buildings/industrial_01.glb' },
  
  // --- INFRASTRUCTURE ---
  { id: 'i_hosp_01', category: 'hospital', path: '/assets/buildings/hospital.glb' },
  { id: 'i_school_01', category: 'school', path: '/assets/buildings/school.glb' },
  { id: 'i_police_01', category: 'police', path: '/assets/buildings/police.glb' },
  { id: 'i_fire_01', category: 'fire', path: '/assets/buildings/firestation.glb' },
  { id: 'i_gov_01', category: 'government', path: '/assets/buildings/government.glb' },
  
  // --- AIRPORT ---
  { id: 'a_term_01', category: 'airport_terminal', path: '/assets/airport/terminal.glb' },
  { id: 'a_tower_01', category: 'control_tower', path: '/assets/airport/tower.glb' },
  { id: 'a_hangar_01', category: 'hangar', path: '/assets/airport/hangar.glb' },

  // --- TRANSPORT ---
  { id: 'v_car_01', category: 'car', path: '/assets/transport/car.glb' },
  { id: 'v_bus_01', category: 'bus', path: '/assets/transport/bus.glb' },
  { id: 'v_police_01', category: 'police_car', path: '/assets/transport/police.glb' },
  { id: 'v_fire_01', category: 'firetruck', path: '/assets/transport/firetruck.glb' },
  { id: 'v_amb_01', category: 'ambulance', path: '/assets/transport/ambulance.glb' },
  { id: 'v_metro_01', category: 'metro', path: '/assets/transport/metro.glb' },
  { id: 'v_aircraft_01', category: 'aircraft', path: '/assets/transport/aircraft.glb' },
];

/**
 * Returns a random registered asset for the given category, 
 * using a seeded random if provided (to keep buildings deterministic).
 */
export function getAssetForCategory(category: AssetCategory, seed?: number): AssetEntry | null {
  const matches = REGISTRY.filter(a => a.category === category);
  if (matches.length === 0) return null;
  
  if (seed !== undefined) {
    // Simple deterministic pseudo-random
    const s = Math.sin(seed) * 10000;
    const index = Math.floor((s - Math.floor(s)) * matches.length);
    return matches[index];
  }
  
  return matches[Math.floor(Math.random() * matches.length)];
}

export function getAllAssets(): string[] {
  return REGISTRY.map(a => a.path);
}

// Legacy exports for compatibility with other files
export const ASSET_REGISTRY = REGISTRY;

export function selectBuildingAsset(buildingType: string, seed: number): string | null {
  const category = buildingType as AssetCategory;
  const asset = getAssetForCategory(category, seed);
  return asset ? asset.path : null;
}

export function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function logMissingAsset(path: string, category?: string, objectId?: string) {
  console.warn(`[AssetRegistry] Missing asset: ${path} (Category: ${category}, ID: ${objectId})`);
}

