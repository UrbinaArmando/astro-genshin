import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildsDir = path.join(__dirname, '../src/content/community-builds');
const yattaApiBase = 'https://gi.yatta.moe/api/v2';

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
        console.log(`✓ ${artifactCache.size} artefactos cacheados\n`);
    } catch (error) {
        console.error('Error cacheando datos:', error.message);
        process.exit(1);
    }
}

function findIdByName(searchName, cache) {
    if (!searchName || searchName.length < 2) return null;
    
    const normalized = searchName.toLowerCase().trim();
    
    // Búsqueda exacta
    if (cache.has(normalized)) {
        return cache.get(normalized);
    }
    
    // Búsqueda por palabras comunes (primeras palabras)
    const words = normalized.split(/\s+/);
    let bestMatch = null;
    let bestScore = 0;
    
    for (const [cachedName, id] of cache) {
        // Contar palabras coincidentes desde el inicio
        let matchedWords = 0;
        for (const word of words) {
            if (cachedName.includes(word)) {
                matchedWords++;
            } else {
                break;
            }
        }
        
        if (matchedWords > bestScore) {
            bestScore = matchedWords;
            bestMatch = id;
        }
        
        // Si encontramos una coincidencia perfecta de todas las palabras
        if (matchedWords === words.length) {
            return id;
        }
    }
    
    return bestMatch;
}

function enrichMarkdownContent(content) {
    let modified = false;
    
    // Split frontmatter from content
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!frontmatterMatch) {
        return { modified: false, content };
    }
    
    let [, frontmatterStr, mdContent] = frontmatterMatch;
    
    // Process weapons section
    const weaponsRegex = /(weapons:\s*\|-?\n)([\s\S]*?)(?=\n  \w+:|$)/;
    const weaponsMatch = frontmatterStr.match(weaponsRegex);
    if (weaponsMatch) {
        const enriched = enrichWeaponsSection(weaponsMatch[2]);
        if (enriched.modified) {
            frontmatterStr = frontmatterStr.replace(weaponsMatch[0], `${weaponsMatch[1]}${enriched.content}\n  `);
            modified = true;
        }
    }
    
    // Process artifacts section
    const artifactsRegex = /(artifacts:\s*\|-?\n)([\s\S]*?)(?=\n  \w+:|$)/;
    const artifactsMatch = frontmatterStr.match(artifactsRegex);
    if (artifactsMatch) {
        const enriched = enrichArtifactsSection(artifactsMatch[2]);
        if (enriched.modified) {
            frontmatterStr = frontmatterStr.replace(artifactsMatch[0], `${artifactsMatch[1]}${enriched.content}\n  `);
            modified = true;
        }
    }
    
    if (modified) {
        const newContent = `---\n${frontmatterStr}\n---\n${mdContent}`;
        return { modified: true, content: newContent };
    }
    
    return { modified: false, content };
}

function enrichWeaponsSection(weaponsText) {
    const lines = weaponsText.split('\n');
    let modified = false;
    
    const enrichedLines = lines.map(line => {
        // Skip special lines
        if (!line.trim() || line.includes('|') || line.trim().startsWith('≈') || 
            line.trim().startsWith('*') || !line.match(/^\s*[\d]/)) {
            return line;
        }
        
        // Extract: "1. Name (5✩)" → "Name"
        const match = line.match(/^(\s*\d+\.\s+)([^(]+)(\s*\([45✩]+\).*)?$/);
        if (!match) return line;
        
        const [, prefix, name, rarity] = match;
        const cleanName = name
            .replace(/\s*\[.*\]/, '')  // Remove [R5]
            .replace(/\*+$/, '')        // Remove asterisks
            .trim();
        
        if (!cleanName || cleanName.length < 2) return line;
        
        // Check if already has ID
        if (cleanName.includes('|')) return line;
        
        const id = findIdByName(cleanName, weaponCache);
        
        if (id) {
            return `${prefix}${cleanName}|${id}${rarity || ''}`;
        }
        
        return line;
    });
    
    const newContent = enrichedLines.join('\n');
    return {
        modified: newContent !== weaponsText,
        content: newContent
    };
}

function enrichArtifactsSection(artifactsText) {
    const lines = artifactsText.split('\n');
    let modified = false;
    
    const enrichedLines = lines.map(line => {
        // Skip special lines
        if (!line.trim() || line.includes('|') || line.trim().startsWith('≈') ||  line.trim().startsWith('*') || line.toLowerCase().includes('conditional') || !line.match(/^\s*[\d]/)) {
            return line;
        }
        
        // Extract: "1. Name (4)" → "Name"
        const match = line.match(/^(\s*\d+\.\s+)([^(]+)(\s*\([45]\).*)?$/);
        if (!match) return line;
        
        const [, prefix, name, rarity] = match;
        const cleanName = name
            .replace(/\*+$/, '')
            .trim();
        
        if (!cleanName || cleanName.length < 2) return line;
        
        // Check if already has ID
        if (cleanName.includes('|')) return line;
        
        const id = findIdByName(cleanName, artifactCache);
        
        if (id) {
            return `${prefix}${cleanName}|${id}${rarity || ''}`;
        }
        
        return line;
    });
    
    const newContent = enrichedLines.join('\n');
    return {
        modified: newContent !== artifactsText,
        content: newContent
    };
}

async function processAllMarkdowns() {
    let processed = 0;
    let modified = 0;
    let errors = 0;
    
    const files = fs.readdirSync(buildsDir).filter(f => f.endsWith('.md')).sort();
    console.log(`Procesando ${files.length} archivos markdown...\n`);
    
    for (const file of files) {
        try {
            const filePath = path.join(buildsDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            
            const { modified: hasModifications, content: enrichedContent } = enrichMarkdownContent(content);
            
            if (hasModifications) {
                fs.writeFileSync(filePath, enrichedContent, 'utf-8');
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
    
    console.log(`\n${'='.repeat(40)}`);
    console.log(`Resultados:`);
    console.log(`  Procesados: ${processed}`);
    console.log(`  Modificados: ${modified}`);
    console.log(`  Errores: ${errors}`);
}

async function main() {
    console.log('=== Enriquecimiento de builds con IDs v3 ===\n');
    
    await cacheWeaponsAndArtifacts();
    await processAllMarkdowns();
    
    console.log(`\n✓ Enriquecimiento completado`);
}

main().catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
});
