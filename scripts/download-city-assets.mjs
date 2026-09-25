import fs from 'fs';
import path from 'path';
import https from 'https';

const ASSETS_TO_DOWNLOAD = [
  // Example known URLs for testing the pipeline
  { url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoxTextured/glTF-Binary/BoxTextured.glb', dest: 'frontend/public/assets/buildings/house_01.glb' },
  { url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb', dest: 'frontend/public/assets/transport/car.glb' }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url} to ${dest}...`);
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Successfully downloaded: ${dest}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {}); // Delete the file async. (But we don't check the result)
      reject(err);
    });
  });
}

async function main() {
  console.log('--- METACITY Asset Downloader ---');
  console.log('Preparing to download GLB/GLTF assets from approved sources (e.g. Kenney CC0, PolyHaven).');
  
  for (const asset of ASSETS_TO_DOWNLOAD) {
    const destPath = path.resolve(process.cwd(), asset.dest);
    const dir = path.dirname(destPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    try {
      await downloadFile(asset.url, destPath);
    } catch (e) {
      console.warn(`WARNING: Failed to download ${asset.url}: ${e.message}`);
      console.warn(`The simulation will use the procedural fallback for this asset.`);
    }
  }
  
  console.log('Asset pipeline complete. Check /frontend/public/assets/');
}

main().catch(console.error);
