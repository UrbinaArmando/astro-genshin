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
            const fieldsToClean = ['subStats', 'substats', 'mainStats', 'mainstat'];
            
            for (const field of fieldsToClean) {
                if (entry[field] && typeof entry[field] === 'string') {
                    const original = entry[field];
                    
                    // Quitar asteriscos al final de cualquier línea
                    let cleaned = original
                        .split('\n')
                        .map(line => line.replace(/\s*\*+\s*$/, '').trim())
                        .filter(line => line.length > 0)
                        .join('\n');
                    
                    if (cleaned !== original) {
                        entry[field] = cleaned;
                        hasChanges = true;
                    }
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
console.log('✓ Limpieza final completada');
