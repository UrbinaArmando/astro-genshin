#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildsDir = path.join(__dirname, '../src/content/community-builds');

// Cargar artefactos desde el build anterior (enrich-builds-with-ids-v3.mjs)
// Usamos la misma estrategia: buscar por nombre en API de Yatta
let artifactsData = [];
try {
    const response = await fetch('https://genshin.yatta.top/api?game=genshin_en&language=en&query=artifacts');
    const data = await response.json();
    artifactsData = data.data || [];
    console.log(`✓ ${artifactsData.length} artefactos cacheados`);
} catch (error) {
    console.error('Error cacheando artefactos:', error.message);
    process.exit(1);
}

// Crear índice por nombre fuzzy matching
const artifactIndex = {};
artifactsData.forEach(artifact => {
    const name = artifact.name?.toLowerCase() || '';
    if (name) {
        artifactIndex[name] = artifact.id;
    }
});

function findArtifactIdByName(name) {
    const clean = name.toLowerCase().trim();
    if (artifactIndex[clean]) return artifactIndex[clean];
    
    // Si no hay coincidencia exacta, buscar parcial
    for (const [key, id] of Object.entries(artifactIndex)) {
        if (key.includes(clean) || clean.includes(key)) {
            return id;
        }
    }
    return null;
}

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
            if (entry.artifacts && typeof entry.artifacts === 'string') {
                const originalArtifacts = entry.artifacts;
                
                let lines = originalArtifacts.split('\n');
                let cleanedLines = [];
                
                for (let i = 0; i < lines.length; i++) {
                    let line = lines[i].trim();
                    
                    if (line.length === 0) continue;
                    
                    // Si la línea NO tiene número al principio (no es un item principal)
                    // y NO tiene ID, intentar agregarle uno
                    const hasNumber = /^\d+\./.test(line);
                    const hasId = /\|\d+/.test(line);
                    
                    if (!hasNumber && !hasId && line.match(/\([0-9✩*]+\)/)) {
                        // Extraer nombre: todo antes de la rarity en paréntesis
                        const match = line.match(/^(.+?)\s*\([0-9✩*]+\)/);
                        if (match) {
                            const artifactName = match[1].trim();
                            const id = findArtifactIdByName(artifactName);
                            if (id) {
                                line = line.replace(artifactName, `${artifactName}|${id}`);
                            }
                        }
                    }
                    
                    cleanedLines.push(line);
                }
                
                let cleanedArtifacts = cleanedLines.join('\n');
                
                if (cleanedArtifacts !== originalArtifacts) {
                    entry.artifacts = cleanedArtifacts;
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
console.log('✓ Enriquecimiento de artefactos completado');
