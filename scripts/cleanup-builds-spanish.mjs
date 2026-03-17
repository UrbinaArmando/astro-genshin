import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildsDir = path.join(__dirname, '../src/content/community-builds');

/**
 * Limpia líneas de armas/artefactos:
 * - Quita asteriscos finales (notas que no se traducen)
 * - Limpia espacios extra
 */
function cleanItemLine(line) {
    // Remove trailing asterisks and their associated notes
    let cleaned = line.replace(/\*+$/, '').trim();
    
    // Clean up extra spaces
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    return cleaned;
}

/**
 * Traduce y limpia textos específicos
 */
function cleanContent(content) {
    let modified = false;
    let result = content;
    
    // Separar frontmatter
    const frontmatterMatch = result.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!frontmatterMatch) {
        return { modified: false, content };
    }
    
    let [, frontmatterStr, mdContent] = frontmatterMatch;
    
    // Limpiar líneas con asteriscos en weapons
    const weaponsMatch = frontmatterStr.match(/(weapons:\s*\|-?\n)([\s\S]*?)(?=\n  \w+:|$)/);
    if (weaponsMatch) {
        const lines = weaponsMatch[2].split('\n');
        const cleanedLines = lines.map(line => {
            if (line.match(/^\s*[\d≈]/)) {
                return cleanItemLine(line);
            }
            return line;
        });
        
        const newWeaponsSection = cleanedLines.join('\n');
        if (newWeaponsSection !== weaponsMatch[2]) {
            frontmatterStr = frontmatterStr.replace(weaponsMatch[0], `${weaponsMatch[1]}${newWeaponsSection}\n  `);
            modified = true;
        }
    }
    
    // Limpiar líneas con asteriscos en artifacts y reemplazar "Conditional (See Notes):"
    const artifactsMatch = frontmatterStr.match(/(artifacts:\s*\|-?\n)([\s\S]*?)(?=\n  \w+:|$)/);
    if (artifactsMatch) {
        let artifactsContent = artifactsMatch[2];
        
        // Reemplazar "Conditional (See Notes):" con nada (removerlo)
        if (artifactsContent.includes('Conditional (See Notes):')) {
            artifactsContent = artifactsContent.replace(/Conditional \(See Notes\):\n/, '');
            modified = true;
        }
        
        const lines = artifactsContent.split('\n');
        const cleanedLines = lines.map(line => {
            if (line.match(/^\s*[\d≈]/)) {
                return cleanItemLine(line);
            }
            return line;
        });
        
        const newArtifactsSection = cleanedLines.join('\n');
        if (newArtifactsSection !== artifactsContent) {
            frontmatterStr = frontmatterStr.replace(artifactsMatch[0], `${artifactsMatch[1]}${newArtifactsSection}\n  `);
            modified = true;
        }
    }
    
    // Traducir campos al español
    const translations = {
        'mainStats:': 'mainStats:',  // Mantener igual pero limpio
        'subStats:': 'subStats:',     // Mantener igual pero limpio
        'talentPriority:': 'talentPriority:',  // Mantener igual
        'abilityTips:': 'abilityTips:',  // Mantener igual
        'updated:': 'updated:'  // Mantener igual
    };
    
    // Limpiar asteriscos en otros campos (mainStats, subStats, etc)
    const fieldsToClean = ['mainStats', 'subStats', 'talentPriority'];
    
    for (const field of fieldsToClean) {
        const fieldRegex = new RegExp(`(${field}:\\s*\\|-?\\n)([\\s\\S]*?)(?=\\n  \\w+:|$)`);
        const fieldMatch = frontmatterStr.match(fieldRegex);
        
        if (fieldMatch) {
            const lines = fieldMatch[2].split('\n');
            const cleanedLines = lines.map(line => {
                if (line.includes('*')) {
                    // Remover asteriscos
                    return line.replace(/\*+/g, '').trim();
                }
                return line;
            }).filter(line => line.length > 0);  // Remover líneas vacías
            
            const newFieldSection = cleanedLines.join('\n');
            if (newFieldSection !== fieldMatch[2]) {
                frontmatterStr = frontmatterStr.replace(fieldMatch[0], `${fieldMatch[1]}${newFieldSection}\n  `);
                modified = true;
            }
        }
    }
    
    if (modified) {
        result = `---\n${frontmatterStr}\n---\n${mdContent}`;
    }
    
    return { modified, content: result };
}

async function processAllMarkdowns() {
    let processed = 0;
    let modified = 0;
    let errors = 0;
    
    const files = fs.readdirSync(buildsDir).filter(f => f.endsWith('.md')).sort();
    console.log(`Limpiando ${files.length} archivos markdown...\n`);
    
    for (const file of files) {
        try {
            const filePath = path.join(buildsDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            
            const { modified: hasModifications, content: cleanedContent } = cleanContent(content);
            
            if (hasModifications) {
                fs.writeFileSync(filePath, cleanedContent, 'utf-8');
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
    console.log('=== Limpieza de builds - Remover notas en inglés ===\n');
    
    await processAllMarkdowns();
    
    console.log(`\n✓ Limpieza completada`);
}

main().catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
});
