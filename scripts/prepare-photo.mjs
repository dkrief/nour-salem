import sharp from 'sharp';
import path from 'node:path';
import { stat, mkdir } from 'node:fs/promises';
const [source, output] = process.argv.slice(2);
if (!source || !output || !/\.webp$/i.test(output)) throw new Error('Usage : npm run prepare:photo -- chemin/source.jpg chemin/export.webp');
if (path.resolve(source) === path.resolve(output)) throw new Error('Conserver un original distinct.');
try { await stat(output); throw new Error('Le fichier de sortie existe déjà. Choisir un nouveau nom.'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
await mkdir(path.dirname(output), { recursive: true });
const buffer = await sharp(source).rotate().resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
if (buffer.length >= 2_000_000) throw new Error('Export encore trop lourd ; diminuer les dimensions avant import.');
await sharp(buffer).toFile(output);
console.log('Photo exportée sans métadonnées : ' + path.basename(output) + ' (' + Math.round(buffer.length / 1024) + ' Ko).');
