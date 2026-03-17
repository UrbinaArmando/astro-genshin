import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildsDir = path.join(__dirname, '../src/content/community-builds');
const yattaApiBase = 'https://gi.yatta.moe/api/v2';

// Cache para evitar múltiples requests del mismo item
const weaponCache = new Map();
const artifactCache = new Map();

async function cacheWeaponsAndArtifacts() {
    console.log('Cacheando armas y artefactos de API EN...');
    
    try {
        // Cache weapons
        const weaponsRes = await fetch(`${yattaApiBase}/en/weapon`);
        const weaponsData = await weaponsRes.json();
        if (weaponsData.data && weaponsData.data.items) {
            Object.values(weaponsData.data.items).forEach(weapon => {
                if (weapon.name && weapon.id) {
                    weaponCache.set(weapon.name, String(weapon.id));
                }
            });
        }
        console.log(`✓ ${weaponCache.size} armas cacheadas`);

        // Cache artifacts
        const artifactsRes = await fetch(`${yattaApiBase}/en/reliquary`);
        const artifactsData = await artifactsRes.json();
        if (artifactsData.data && artifactsData.data.items) {
            Object.values(artifactsData.data.items).forEach(artifact => {
                if (artifact.name && artifact.id) {
                    artifactCache.set(artifact.name, String(artifact.id));
                }
            });
        }
        console.log(`✓ ${artifactCache.size} artefactos cacheados`);
    } catch (error) {
        console.error('Error cacheando datos:', error.message);
        process.exit(1);
    }
}

function normalizeForSearch(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ');
}

function findIdByFuzzyMatch(name, cache) {
    const normalized = normalizeForSearch(name);
    const words = normalized.split(' ');
    
    // Búsqueda exacta primero
    for (const [cachedName, id] of cache) {
        if (normalizeForSearch(cachedName) === normalized) {
            return id;
        }
    }
    
    // Búsqueda por coincidencia de palabras
    let bestMatch = null;
    let bestScore = 0;
    
    for (const [cachedName, id] of cache) {
        const normalizedCached = normalizeForSearch(cachedName);
        const cachedWords = normalizedCached.split(' ');
        let score = 0;
        
        for (const word of words) {
            if (cachedWords.some(w => w.includes(word) || word.includes(w))) {
                score++;
            }
        }
        
        if (score > bestScore) {
            bestScore = score;
            bestMatch = id;
        }
    }
    
    return bestMatch;
}

function enrichItemLine(line, cache, itemType) {
    // Saltear líneas vacías o especiales
    if (!line.trim() || line.trim().startsWith('≈') || line.trim().startsWith('*')) {
        return line;
    }
    
    // Parsear línea numerada: "1. Nombre Arma (4✩)" o "1. Nombre Artefacto (4)"
    const match = line.match(/^(\s*[\d≈]+\.\s*)(.+?)(\s*\([45]✩?\))?(.*)$/);
    if (!match) {
        return line;
    }
    
    const [, prefix, name, rarity, suffix] = match;
    
    // Si ya tiene ID (Nombre|ID), saltar
    if (name.includes('|')) {
        return line;
    }
    
    const id = findIdByFuzzyMatch(name, cache);
    
    if (id) {
        return `${prefix}${name}|${id}${rarity || ''}${suffix || ''}`;
    }
    
    return line;
}

function enrichMarkdown(content, filename) {
    const { data, content: mdContent } = matter(content);
    let modified = false;
    
    if (!data.entries || !Array.isArray(data.entries)) {
        return { modified: false, content };
    }
    
    // Procesar cada entrada
    data.entries.forEach(entry => {
        // Enriquecer armas
        if (entry.weapons) {
            const lines = entry.weapons.split('\n');
            const enrichedLines = lines.map(line => {
                const newLine = enrichItemLine(line, weaponCache, 'weapon');
                if (newLine !== line) {
                    modified = true;
                }
                return newLine;
            });
            entry.weapons = enrichedLines.join('\n');
        }
        
        // Enriquecer artefactos
        if (entry.artifacts) {
            const lines = entry.artifacts.split('\n');
            const enrichedLines = lines.map(line => {
                const newLine = enrichItemLine(line, artifactCache, 'artifact');
                if (newLine !== line) {
                    modified = true;
                }
                return newLine;
            });
            entry.artifacts = enrichedLines.join('\n');
        }
    });
    
    if (!modified) {
        return { modified: false, content };
    }
    
    // Regenerar frontmatter
    const updatedContent = matter.stringify(mdContent, data);
    return { modified: true, content: updatedContent };
}

async function processAllMarkdowns() {
    let processed = 0;
    let modified = 0;
    let errors = 0;
    
    const files = fs.readdirSync(buildsDir).filter(f => f.endsWith('.md'));
    console.log(`\nProcesando ${files.length} archivos markdown...\n`);
    
    for (const file of files) {
        try {
            const filePath = path.join(buildsDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            
            const { modified: hasModifications, content: enrichedContent } = enrichMarkdown(content, file);
            
            if (hasModifications) {
                fs.writeFileSync(filePath, enrichedContent, 'utf-8');
                console.log(`✓ ${file} actualizado`);
                modified++;
            } else {
                console.log(`- ${file} sin cambios`);
            }
            
            processed++;
        } catch (error) {
            console.error(`✗ ${file}: ${error.message}`);
            errors++;
        }
    }
    
    console.log(`\nResultados:`);
    console.log(`  Procesados: ${processed}`);
    console.log(`  Modificados: ${modified}`);
    console.log(`  Errores: ${errors}`);
}

async function main() {
    console.log('=== Script de enriquecimiento de builds con IDs ===\n');
    
    // Agregar gray-matter si no existe
    try {
        await import('gray-matter');
    } catch {
        console.error('ERROR: Instala gray-matter con: npm install gray-matter');
        process.exit(1);
    }
    
    await cacheWeaponsAndArtifacts();
    await processAllMarkdowns();
    
    console.log('\n✓ Enriquecimiento completado');
}

main().catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
});
