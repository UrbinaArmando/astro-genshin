#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildsDir = path.join(__dirname, '../src/content/community-builds');

// Mapeo manual de artefactos comunes que suelen aparecer
const artifactMap = {
    'Obsidian Codex': 15038,
    'Scroll of the Hero of Cinder City': 15037,
    'Marechaussee Hunter': 15036,
    'Deepwood Memories': 15009,
    'Artifact': 0,
};

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
                
                for (let line of lines) {
                    // Si la línea no tiene ID pero tiene un nombre que conocemos
                    if (!line.includes('|') && line.match(/\([0-9✩*]+\)/)) {
                        for (const [name, id] of Object.entries(artifactMap)) {
                            if (line.includes(name) && id > 0) {
                                line = line.replace(name, `${name}|${id}`);
                                hasChanges = true;
                                break;
                            }
                        }
                    }
                    cleanedLines.push(line);
                }
                
                entry.artifacts = cleanedLines.join('\n');
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
console.log('✓ Enriquecimiento de artefactos restantes completado');
