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
    let hasChanges = false;
    
    if (data.entries && Array.isArray(data.entries)) {
        for (const entry of data.entries) {
            // Procesar artifacts
            if (entry.artifacts && typeof entry.artifacts === 'string') {
                const originalArtifacts = entry.artifacts;
                
                // Normalizar: quitar espacios entre ID y rarity
                // De: "Name|ID (4)" a "Name|ID(4)"
                let normalizedArtifacts = originalArtifacts
                    .replace(/\|(\d+)\s+\(/g, '|$1(');
                
                if (normalizedArtifacts !== originalArtifacts) {
                    entry.artifacts = normalizedArtifacts;
                    hasChanges = true;
                }
            }
            
            // Procesar weapons
            if (entry.weapons && typeof entry.weapons === 'string') {
                const originalWeapons = entry.weapons;
                
                let normalizedWeapons = originalWeapons
                    .replace(/\|(\d+)\s+\(/g, '|$1(');
                
                if (normalizedWeapons !== originalWeapons) {
                    entry.weapons = normalizedWeapons;
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
console.log('✓ Normalización de formato completada');
