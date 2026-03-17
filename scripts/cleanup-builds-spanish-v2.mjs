import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildsDir = path.join(__dirname, '../src/content/community-builds');

/**
 * Limpia líneas removiendo asteriscos y espacios extra
 */
function cleanLine(line) {
    if (!line.trim()) return line;
    
    // Remove all trailing asterisks and spaces
    let cleaned = line.replace(/\*+$/, '').trimEnd();
    
    return cleaned;
}

async function processAllMarkdowns() {
    let processed = 0;
    let modified = 0;
    
    const files = fs.readdirSync(buildsDir).filter(f => f.endsWith('.md')).sort();
    console.log(`Limpiando ${files.length} archivos markdown...\n`);
    
    for (const file of files) {
        try {
            const filePath = path.join(buildsDir, file);
            let content = fs.readFileSync(filePath, 'utf-8');
            
             const originalContent = content;
            
            // 1. Remover "Conditional (See Notes):" completamente
            content = content.replace(/\s*Conditional \(See Notes\):\n/g, '');
            
            // 2. Remover asteriscos finales de cualquier línea
            const lines = content.split('\n');
            const cleanedLines = lines.map(line => cleanLine(line));
            content = cleanedLines.join('\n');
            
            // 3. Limpiar múltiples espacios en blanco
            content = content.replace(/\n\n\n+/g, '\n\n');
            
            if (content !== originalContent) {
                fs.writeFileSync(filePath, content, 'utf-8');
                console.log(`✓ ${file}`);
                modified++;
            } else {
                console.log(`- ${file}`);
            }
            
            processed++;
        } catch (error) {
            console.error(`✗ ${file}: ${error.message}`);
        }
    }
    
    console.log(`\n${'='.repeat(40)}`);
    console.log(`Resultados:`);
    console.log(`  Procesados: ${processed}`);
    console.log(`  Modificados: ${modified}`);
}

async function main() {
    console.log('=== Limpieza de builds - v2 ===\n');
    await processAllMarkdowns();
    console.log(`\n✓ Limpieza completada`);
}

main().catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
});
