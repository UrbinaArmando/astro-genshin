import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildsDir = path.join(__dirname, '../src/content/community-builds');
const yattaApiBase = 'https://gi.yatta.moe/api/v2';

// Cache para evitar múltiples requests
const weaponCache = new Map();
const artifactCache = new Map();

async function cacheWeaponsAndArtifacts() {
    console.log('Cacheando armas y artefactos de API EN...');
    
    try {
        // Cache weapons
        const weaponsRes = await fetch(`${yattaApiBase}/en/weapon`);
        const weaponsData = await weaponsRes.json();
        if (weaponsData.data && weaponsData.data.items) {
            Object.entries(weaponsData.data.items).forEach(([id, weapon]) => {
                if (weapon.name) {
                    weaponCache.set(weapon.name.toLowerCase(), id);
                }
            });
        }
        console.log(`✓ ${weaponCache.size} armas cacheadas`);

        // Cache artifacts
        const artifactsRes = await fetch(`${yattaApiBase}/en/reliquary`);
        const artifactsData = await artifactsRes.json();
        if (artifactsData.data && artifactsData.data.items) {
            Object.entries(artifactsData.data.items).forEach(([id, artifact]) => {
                if (artifact.name) {
                    artifactCache.set(artifact.name.toLowerCase(), id);
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
        .replace(/[()✩*≈]/g, '')
        .trim();
}

function findIdByExactOrFuzzy(searchName, cache) {
    const normalized = normalizeForSearch(searchName);
    
    // Búsqueda exacta
    if (cache.has(normalized)) {
        return cache.get(normalized);
    }
    
    // Búsqueda por substring más largo
    let bestMatch = null;
    let bestLength = 0;
    
    for (const [cachedKey, id] of cache) {
        if (normalized.includes(cachedKey) || cachedKey.includes(normalized)) {
            const matchLength = Math.max(normalized.length, cachedKey.length);
            if (matchLength > bestLength) {
                bestLength = matchLength;
                bestMatch = id;
            }
        }
    }
    
    return bestMatch;
}

export function parseMarkdownFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n/);
    if (!match) return null;
    
    const frontmatterStr = match[1];
    const lines = frontmatterStr.split('\n');
    
    const frontmatter = {};
    let currentKey = null;
    let currentValue = '';
    let inMultiline = false;
    
    for (const line of lines) {
        if (line.match(/^[\w]+:\s/)) {
            if (currentKey) {
                frontmatter[currentKey] = currentValue.trim();
            }
            const [key, ...valueParts] = line.split(':');
            currentKey = key.trim();
            const value = valueParts.join(':').trim();
            
            if (value === '|-') {
                currentValue = '';
                inMultiline = true;
            } else {
                currentValue = value;
                inMultiline = false;
            }
        } else if (inMultiline) {
            currentValue += '\n' + line;
        }
    }
    
    if (currentKey) {
        frontmatter[currentKey] = currentValue.trim();
    }
    
    return frontmatter;
}

function enrichWeaponsField(weaponsText) {
    if (!weaponsText) return weaponsText;
    
    const lines = weaponsText.split('\n');
    const enrichedLines = lines.map(line => {
        // Saltear líneas especiales
        if (!line.trim() || line.trim().startsWith('≈') || line.includes('|')) {
            return line;
        }
        
        // Extraer el nombre del arma de una línea numerada
        const match = line.match(/^(\s*[\d≈]+\.\s*)(.+?)(\s*\([45✩]+\))?(.*)$/);
        if (!match) return line;
        
        const [, prefix, nameWithAnnotations, rarity, suffix] = match;
        
        // Limpiar la anotación de nombre (ej: "Elegy for the End (5✩)*" → "Elegy for the End")
        const cleanName = nameWithAnnotations
            .replace(/\s*[\[\{].*[\]\}]/, '') // Remove [R5] or {notes}
            .replace(/\*+$/, '')                 // Remove trailing asterisks
            .trim();
        
        const id = findIdByExactOrFuzzy(cleanName, weaponCache);
        
        if (!id) {
            console.warn(`  ⚠ No encontrado: "${cleanName}"`);
            return line;
        }
        
        return `${prefix}${cleanName}|${id}${rarity || ''}${suffix || ''}`;
    });
    
    return enrichedLines.join('\n');
}

function enrichArtifactsField(artifactsText) {
    if (!artifactsText) return artifactsText;
    
    const lines = artifactsText.split('\n');
    const enrichedLines = lines.map(line => {
        // Saltear líneas especiales
        if (!line.trim() || line.trim().startsWith('≈') || line.includes('|') ||  line.toLowerCase().includes('conditional')) {
            return line;
        }
        
        // Extraer el nombre del artefacto
        const match = line.match(/^(\s*[\d≈]+\.\s*)(.+?)(\s*\([45]\))?(.*)$/);
        if (!match) return line;
        
        const [, prefix, nameWithAnnotations, rarity, suffix] = match;
        
        // Limpiar el nombre
        const cleanName = nameWithAnnotations
            .replace(/\*+$/, '')
            .trim();
        
        const id = findIdByExactOrFuzzy(cleanName, artifactCache);
        
        if (!id) {
            console.warn(`  ⚠ Artefacto no encontrado: "${cleanName}"`);
            return line;
        }
        
        return `${prefix}${cleanName}|${id}${rarity || ''}${suffix || ''}`;
    });
    
    return enrichedLines.join('\n');
}

async function processAllMarkdowns() {
    let processed = 0;
    let modified = 0;
    let errors = 0;
    
    const files = fs.readdirSync(buildsDir).filter(f => f.endsWith('.md')).sort();
    console.log(`\nProcesando ${files.length} archivos markdown...\n`);
    
    for (const file of files) {
        try {
            const filePath = path.join(buildsDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            
            // Separar frontmatter del contenido
            const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
            if (!frontmatterMatch) {
                console.log(`- ${file} sin formato frontmatter válido`);
                processed++;
                continue;
            }
            
            const [, frontmatterStr, mdContent] = frontmatterMatch;
            let frontmatter = frontmatterStr;
            let hasModifications = false;
            
            // Procesar armas y artefactos en el frontmatter
            // Buscar secciones weapons: |
            const weaponsMatch = frontmatter.match(/(weapons:\s*\|-?\n)([\s\S]*?)(?=\n  [a-z]+:|$)/);
            if (weaponsMatch) {
                const enriched = enrichWeaponsField(weaponsMatch[2]);
                if (enriched !== weaponsMatch[2]) {
                    frontmatter = frontmatter.replace(weaponsMatch[0], `${weaponsMatch[1]}${enriched}\n  `);
                    hasModifications = true;
                }
            }
            
            // Buscar secciones artifacts: |
            const artifactsMatch = frontmatter.match(/(artifacts:\s*\|-?\n)([\s\S]*?)(?=\n  [a-z]+:|$)/);
            if (artifactsMatch) {
                const enriched = enrichArtifactsField(artifactsMatch[2]);
                if (enriched !== artifactsMatch[2]) {
                    frontmatter = frontmatter.replace(artifactsMatch[0], `${artifactsMatch[1]}${enriched}\n  `);
                    hasModifications = true;
                }
            }
            
            if (hasModifications) {
                const newContent = `---\n${frontmatter}\n---\n${mdContent}`;
                fs.writeFileSync(filePath, newContent, 'utf-8');
                console.log(`✓ ${file}`);
                modified++;
            } else {
                console.log(`- ${file}`);
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
    console.log('=== Script de enriquecimiento v2 con IDs ===\n');
    
    await cacheWeaponsAndArtifacts();
    await processAllMarkdowns();
    
    console.log('\n✓ Enriquecimiento completado');
}

main().catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
});
