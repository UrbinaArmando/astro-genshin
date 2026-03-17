#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildsDir = path.join(__dirname, '../src/content/community-builds');

const files = fs.readdirSync(buildsDir).filter(f => f.endsWith('.md'));

let modificados = 0;
let procesados = 0;

for (const file of files) {
    const filePath = path.join(buildsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data, content: body } = matter(content);
    
    procesados++;
    
    // Procesamos cada entry
    let hasChanges = false;
    
    if (data.entries && Array.isArray(data.entries)) {
        for (const entry of data.entries) {
            // Procesar weapons
            if (entry.weapons && typeof entry.weapons === 'string') {
                const originalWeapons = entry.weapons;
                
                // Quitar asteriscos al final de líneas
                let cleanedWeapons = originalWeapons
                    .split('\n')
                    .map(line => line.replace(/\s*\*\s*$/, '').trim())
                    .filter(line => line.length > 0)
                    .join('\n');
                
                if (cleanedWeapons !== originalWeapons) {
                    entry.weapons = cleanedWeapons;
                    hasChanges = true;
                }
            }
            
            // Procesar artifacts
            if (entry.artifacts && typeof entry.artifacts === 'string') {
                const originalArtifacts = entry.artifacts;
                
                let lines = originalArtifacts.split('\n');
                let cleanedLines = [];
                
                for (let i = 0; i < lines.length; i++) {
                    let line = lines[i];
                    
                    // Saltar línea "Conditional (See Notes):"
                    if (line.includes('Conditional (See Notes):')) {
                        continue;
                    }
                    
                    // Limpiar asteriscos al final
                    line = line.replace(/\s*\*\s*$/, '').trim();
                    
                    // Solo agregar líneas no vacías
                    if (line.length > 0) {
                        cleanedLines.push(line);
                    }
                }
                
                let cleanedArtifacts = cleanedLines.join('\n');
                
                if (cleanedArtifacts !== originalArtifacts) {
                    entry.artifacts = cleanedArtifacts;
                    hasChanges = true;
                }
            }
            
            // Procesar mainStats
            if (entry.mainStats && typeof entry.mainStats === 'string') {
                const originalMainStats = entry.mainStats;
                
                let cleanedMainStats = originalMainStats
                    .split('\n')
                    .map(line => line.replace(/\s*\*\s*$/, '').trim())
                    .filter(line => line.length > 0)
                    .join('\n');
                
                if (cleanedMainStats !== originalMainStats) {
                    entry.mainStats = cleanedMainStats;
                    hasChanges = true;
                }
            }
            
            // Procesar substats si existe
            if (entry.substats && typeof entry.substats === 'string') {
                const originalSubstats = entry.substats;
                
                let cleanedSubstats = originalSubstats
                    .split('\n')
                    .map(line => line.replace(/\s*\*\s*$/, '').trim())
                    .filter(line => line.length > 0)
                    .join('\n');
                
                if (cleanedSubstats !== originalSubstats) {
                    entry.substats = cleanedSubstats;
                    hasChanges = true;
                }
            }
        }
    }
    
    if (hasChanges) {
        const newContent = matter.stringify(body, data);
        fs.writeFileSync(filePath, newContent, 'utf-8');
        modificados++;
        console.log(`✓ ${file}`);
    }
}

console.log('\n========================================');
console.log('Resultados:');
console.log(`  Procesados: ${procesados}`);
console.log(`  Modificados: ${modificados}`);
console.log('✓ Limpieza completada');
