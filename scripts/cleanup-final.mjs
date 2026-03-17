import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildsDir = path.join(__dirname, '../src/content/community-builds');

async function processAllMarkdowns() {
    let processed = 0;
    let modified = 0;
    
    const files = fs.readdirSync(buildsDir).filter(f => f.endsWith('.md')).sort();
    console.log(`Limpiando completamente markdown...\n`);
    
    for (const file of files) {
        try {
            const filePath = path.join(buildsDir, file);
            let content = fs.readFileSync(filePath, 'utf-8');
            const originalContent = content;
            
            // 1. Process línea por línea en el frontmatter
            content = content.split('\n').map(line => {
                // Remove trailing asterisks (notes markers)
                line = line.replace(/\s*\*+\s*$/, '');
                
                // Remove comment text after braces
                line = line.replace(/\s*\{[^}]*\}\s*$/g, '');
                
                return line;
            }).join('\n');
            
            // 2. Remove "Conditional (See Notes):" línea completa
            content = content.replace(/^\s*Conditional \(See Notes\):\s*$/gm, '');
            
            // 3. Remove múltiples líneas en blanco
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
    console.log('=== Limpieza final completa ===\n');
    await processAllMarkdowns();
    console.log(`\n✓ Limpieza completada`);
}

main().catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
});
