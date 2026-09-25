import React, { useState, useEffect, useMemo } from 'react';
import { useGLTF, Clone } from '@react-three/drei';
import * as THREE from 'three';
import { getAssetForCategory, AssetCategory } from '../../assets/AssetRegistry';
import { ProceduralBuilding } from './BuildingRenderer'; // We will export it from BuildingRenderer
import type { Building } from '../../types/city';

interface AssetBuildingProps {
  building: Building;
  isNight: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  lodLevel: 0 | 1 | 2;
  damageSeverity?: number;
}

// Map simulation building types to Asset Categories
function getCategoryForType(type: string, h: number): AssetCategory {
  if (type === 'commercial' && h > 60) return 'skyscraper';
  if (type === 'commercial') return 'commercial';
  if (type === 'office' && h > 60) return 'skyscraper';
  if (type === 'office') return 'office';
  if (type === 'residential_high') return 'residential_high';
  if (type === 'industrial') return 'industrial';
  if (type === 'hospital') return 'hospital';
  if (type === 'school') return 'school';
  if (type === 'police') return 'police';
  if (type === 'fire_station') return 'fire';
  if (type === 'government') return 'government';
  return 'residential_low';
}

function GLTFModel({ path, building, damageSeverity, isSelected, onSelect }: { path: string, building: Building, damageSeverity?: number, isSelected: boolean, onSelect: (id:string)=>void }) {
  const { scene } = useGLTF(path);
  
  const h = building.height || 15;
  const w = building.width || 20;
  const d = building.depth || 20;

  // Calculate bounding box to scale the asset correctly to w,d,h
  const { scale, position } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    
    // Scale asset to fit simulation bounds
    const scaleX = size.x > 0 ? w / size.x : 1;
    const scaleZ = size.z > 0 ? d / size.z : 1;
    const scaleY = size.y > 0 ? h / size.y : 1;
    
    // Position to sit on the ground
    return {
      scale: [scaleX, scaleY, scaleZ] as [number, number, number],
      position: [0, 0, 0] as [number, number, number]
    };
  }, [scene, w, d, h]);

  const rotY = useMemo(() => {
    let hashVal = 0;
    const str = building.id || `${building.x}_${building.z}`;
    for (let i = 0; i < str.length; i++) hashVal = (hashVal << 5) - hashVal + str.charCodeAt(i);
    return (Math.abs(hashVal) % 4) * (Math.PI / 2);
  }, [building.id, building.x, building.z]);

  return (
    <group 
      position={[building.x, 0, building.z]} 
      rotation={[0, rotY, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(building.id);
      }}
    >
      {isSelected && (
        <mesh position={[0, h / 2, 0]}>
          <boxGeometry args={[w * 1.1, h * 1.05, d * 1.1]} />
          <meshBasicMaterial color="#00E5FF" wireframe />
        </mesh>
      )}
      <group scale={scale} position={position}>
        <Clone 
          object={scene} 
          castShadow 
          receiveShadow 
          inject={
            damageSeverity ? <meshStandardMaterial color="#555555" /> : undefined
          } 
        />
      </group>
    </group>
  );
}

export function AssetBuilding(props: AssetBuildingProps) {
  const category = getCategoryForType(props.building.type, props.building.height || 15);
  
  // Deterministic seed based on ID
  const seed = useMemo(() => {
    let s = 0;
    const id = props.building.id || '';
    for(let i=0; i<id.length; i++) s += id.charCodeAt(i);
    return s;
  }, [props.building.id]);

  const asset = getAssetForCategory(category, seed);
  
  const [loadFailed, setLoadFailed] = useState(false);

  // Fallback to procedural if damaged (as damage system uses procedural currently)
  // or if LOD is 2 (far distance, use cheap procedural)
  if (!asset || loadFailed || props.damageSeverity || props.lodLevel === 2) {
    return <ProceduralBuilding {...props} />;
  }

  return (
    <React.Suspense fallback={<ProceduralBuilding {...props} />}>
      <ErrorBoundary fallback={<ProceduralBuilding {...props} />} onError={() => setLoadFailed(true)}>
        <GLTFModel path={asset.path} building={props.building} damageSeverity={props.damageSeverity} isSelected={props.isSelected} onSelect={props.onSelect} />
      </ErrorBoundary>
    </React.Suspense>
  );
}

class ErrorBoundary extends React.Component<{ fallback: React.ReactNode, onError: () => void, children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
