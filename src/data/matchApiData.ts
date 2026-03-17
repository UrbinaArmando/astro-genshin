import type { Weapon } from "./weapons";
import type { ArtifactSet } from "./artifacts";
import { getWeapons } from "./weapons";
import { getArtifacts } from "./artifacts";

/**
 * Cache para armas y artefactos de la API
 */
const weaponsCache: Partial<Record<"es" | "en", Weapon[]>> = {};
const artifactsCache: Partial<Record<"es" | "en", ArtifactSet[]>> = {};

/**
 * Normaliza un nombre para búsqueda (elimina espacios, caracteres especiales, etc)
 */
const normalizeForSearch = (text: string): string =>
    text
        .toLowerCase()
        .trim()
        .replaceAll(/\s+/g, " ")
        .normalize("NFD")
        .replaceAll(/[\u0300-\u036f]/g, "")
        .replaceAll(/[✩≈*\n\t()[\]{}]/g, "")
        .replaceAll(/[^a-z0-9' -]/g, "")
        .trim();

const toBigramSet = (value: string): Set<string> => {
    const clean = value.replaceAll(/\s+/g, " ").trim();
    if (!clean) {
        return new Set();
    }

    if (clean.length < 2) {
        return new Set([clean]);
    }

    const bigrams = new Set<string>();
    for (let index = 0; index < clean.length - 1; index += 1) {
        bigrams.add(clean.slice(index, index + 2));
    }

    return bigrams;
};

const getSimilarityScore = (first: string, second: string): number => {
    if (!first || !second) {
        return 0;
    }

    if (first === second) {
        return 1;
    }

    if (first.includes(second) || second.includes(first)) {
        return 0.92;
    }

    const firstBigrams = toBigramSet(first);
    const secondBigrams = toBigramSet(second);

    if (firstBigrams.size === 0 || secondBigrams.size === 0) {
        return 0;
    }

    let intersectionCount = 0;
    for (const token of firstBigrams) {
        if (secondBigrams.has(token)) {
            intersectionCount += 1;
        }
    }

    return (2 * intersectionCount) / (firstBigrams.size + secondBigrams.size);
};

/**
 * Extrae nombreINICIO y ID si existen
 * Ej: "Kagura's Verity|12345" → { name: "Kagura's Verity", id: "12345" }
 * Ej: "Kagura's Verity" → { name: "Kagura's Verity", id: null }
 */
const parseNameAndId = (line: string): { name: string; id: string | null } => {
    // Primero extraer nombre limpio
    const cleanName = extractCleanName(line);
    
    // Buscar formato "Nombre|ID"
    const idMatch = cleanName.match(/^(.+?)\|(\d+)$/);
    if (idMatch) {
        return { name: idMatch[1].trim(), id: idMatch[2] };
    }
    
    return { name: cleanName, id: null };
};

/**
 * Extrae el nombre limpio de una línea de recomendación
 * Ej: "1. Kagura's Verity (5✩)" → "Kagura's Verity"
 */
const extractCleanName = (line: string): string => {
    return line
    .replaceAll(/^\s*[\d.]+\s*/g, "") // Remove leading numbers and dots
    .replaceAll(/^\s*[≈~\-•]+\s*/g, "") // Remove leading separators
    .replaceAll(/\(.*?\)/g, "") // Remove parentheses and content
    .replaceAll(/\[[^\]]+\]/g, "") // Remove brackets and content
        .trim();
};

/**
 * Busca un arma en la lista de la API usando búsqueda normalizada
 */
const findWeapon = (
    weapons: Weapon[],
    searchName: string,
    minSimilarity = 0.8
): { weapon: Weapon; score: number } | null => {
    const normalized = normalizeForSearch(searchName);

    let bestMatch: Weapon | null = null;
    let bestScore = 0;

    for (const weapon of weapons) {
        const weaponNormalized = normalizeForSearch(weapon.name);
        const score = getSimilarityScore(normalized, weaponNormalized);

        if (score > bestScore) {
            bestMatch = weapon;
            bestScore = score;
        }
    }

    if (bestMatch && bestScore >= minSimilarity) {
        return { weapon: bestMatch, score: bestScore };
    }

    return null;
};

/**
 * Busca un artefacto en la lista de la API usando búsqueda normalizada
 */
const findArtifact = (artifacts: ArtifactSet[], searchName: string): ArtifactSet | undefined => {
    const normalized = normalizeForSearch(searchName);
    
    return artifacts.find((artifact) => {
        const artifactNormalized = normalizeForSearch(artifact.name);
        return artifactNormalized === normalized || artifactNormalized.includes(normalized) || normalized.includes(artifactNormalized);
    });
};

/**
 * Obtiene y cachea las armas de la API
 */
export const getCachedWeapons = async (lang: "es" | "en" = "es"): Promise<Weapon[]> => {
    if (!weaponsCache[lang]) {
        weaponsCache[lang] = await getWeapons(lang);
    }
    return weaponsCache[lang] ?? [];
};

/**
 * Obtiene y cachea los artefactos de la API
 */
export const getCachedArtifacts = async (lang: "es" | "en" = "es"): Promise<ArtifactSet[]> => {
    if (!artifactsCache[lang]) {
        artifactsCache[lang] = await getArtifacts(lang);
    }
    return artifactsCache[lang] ?? [];
};

/**
 * Interfaz para arma enriquecida con datos de la API
 */
export interface EnrichedWeapon extends Weapon {
    fromApi: true;
    queryName: string;
    matchScore: number;
}

/**
 * Interfaz para item de arma que no encontró match en API
 */
export interface UnmatchedWeapon {
    name: string;
    fromApi: false;
    queryName: string;
    matchScore: number;
}

/**
 * Tipo que puede ser arma encontrada en API o nombre sin match
 */
export type MatchedWeapon = EnrichedWeapon | UnmatchedWeapon;

/**
 * Interfaz para artefacto enriquecido con datos de la API
 */
export interface EnrichedArtifact extends ArtifactSet {
    fromApi: true;
}

/**
 * Interfaz para artefacto que no encontró match en API
 */
export interface UnmatchedArtifact {
    name: string;
    fromApi: false;
}

/**
 * Tipo que puede ser artefacto encontrado en API o nombre sin match
 */
export type MatchedArtifact = EnrichedArtifact | UnmatchedArtifact;

/**
 * Busca una arma por nombre (o ID directo) y devuelve datos de la API si existe
 */
export const matchWeapon = async (
    weaponName: string,
    lang: "es" | "en" = "es",
    minSimilarity = 0.8
): Promise<MatchedWeapon> => {
    const { name: cleanName, id } = parseNameAndId(weaponName);
    const weapons = await getCachedWeapons(lang);
    
    // Si hay ID, buscar directamente
    if (id) {
        const weapon = weapons.find((w) => String(w.id) === id);
        if (weapon) {
            return {
                ...weapon,
                fromApi: true,
                queryName: cleanName,
                matchScore: 1.0
            } as EnrichedWeapon;
        }
    }
    
    // Fallback a búsqueda fuzzy
    const matched = findWeapon(weapons, cleanName, minSimilarity);

    if (matched?.weapon) {
        return {
            ...matched.weapon,
            fromApi: true,
            queryName: cleanName,
            matchScore: matched.score
        } as EnrichedWeapon;
    }

    return {
        name: cleanName,
        fromApi: false,
        queryName: cleanName,
        matchScore: 0
    } as UnmatchedWeapon;
};

/**
 * Busca un artefacto por nombre (o ID directo) y devuelve datos de la API si existe
 */
export const matchArtifact = async (
    artifactName: string,
    lang: "es" | "en" = "es"
): Promise<MatchedArtifact> => {
    const { name: cleanName, id } = parseNameAndId(artifactName);
    const artifacts = await getCachedArtifacts(lang);
    
    // Si hay ID, buscar directamente
    if (id) {
        const artifact = artifacts.find((a) => String(a.id) === id);
        if (artifact) {
            return {
                ...artifact,
                fromApi: true
            } as EnrichedArtifact;
        }
    }
    
    // Fallback a búsqueda fuzzy
    const matched = findArtifact(artifacts, cleanName);
    
    if (matched) {
        return {
            ...matched,
            fromApi: true
        } as EnrichedArtifact;
    }
    
    return {
        name: cleanName,
        fromApi: false
    } as UnmatchedArtifact;
};

/**
 * Busca múltiples armas en una sola llamada (más eficiente)
 */
export const matchWeapons = async (
    weaponNames: string[],
    lang: "es" | "en" = "es",
    minSimilarity = 0.8
): Promise<MatchedWeapon[]> => {
    const weapons = await getCachedWeapons(lang);

    return weaponNames.map((weaponName) => {
        const { name: cleanName, id } = parseNameAndId(weaponName);
        
        // Si hay ID, buscar directamente
        if (id) {
            const weapon = weapons.find((w) => String(w.id) === id);
            if (weapon) {
                return {
                    ...weapon,
                    fromApi: true,
                    queryName: cleanName,
                    matchScore: 1.0
                } as EnrichedWeapon;
            }
        }
        
        // Fallback a búsqueda fuzzy
        const matched = findWeapon(weapons, cleanName, minSimilarity);

        if (matched?.weapon) {
            return {
                ...matched.weapon,
                fromApi: true,
                queryName: cleanName,
                matchScore: matched.score
            } as EnrichedWeapon;
        }

        return {
            name: cleanName,
            fromApi: false,
            queryName: cleanName,
            matchScore: 0
        } as UnmatchedWeapon;
    });
};

/**
 * Busca múltiples artefactos en una sola llamada (más eficiente)
 */
export const matchArtifacts = async (
    artifactNames: string[],
    lang: "es" | "en" = "es"
): Promise<MatchedArtifact[]> => {
    const artifacts = await getCachedArtifacts(lang);
    
    return artifactNames.map((artifactName) => {
        const { name: cleanName, id } = parseNameAndId(artifactName);
        
        // Si hay ID, buscar directamente
        if (id) {
            const artifact = artifacts.find((a) => String(a.id) === id);
            if (artifact) {
                return {
                    ...artifact,
                    fromApi: true
                } as EnrichedArtifact;
            }
        }
        
        // Fallback a búsqueda fuzzy
        const matched = findArtifact(artifacts, cleanName);
        
        if (matched) {
            return {
                ...matched,
                fromApi: true
            } as EnrichedArtifact;
        }
        
        return {
            name: cleanName,
            fromApi: false
        } as UnmatchedArtifact;
    });
};
