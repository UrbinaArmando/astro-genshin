export const supportedLangs = ['es', 'en'] as const;
export type Lang = (typeof supportedLangs)[number];

export const defaultLang: Lang = 'es';

const messages = {
    es: {
        meta: {
            homeTitle: 'Genshin Guides'
        },
        navbar: {
            home: 'Inicio',
            characters: 'Personajes',
            weapons: 'Armas',
            artifacts: 'Artefactos',
            tierList: 'Tier List',
            teams: 'Equipos',
            openMenu: 'Abrir menú principal',
            closeMenu: 'Cerrar menú principal'
        },
        footer: {
            legal: '© {year} Genshin Guides. No afiliado con HoYoverse.',
            privacy: 'Privacidad',
            terms: 'Términos',
            contact: 'Contacto'
        },
        home: {
            heroAlt: 'Fondo de Genshin Impact',
            heroPrefix: 'Explora',
            heroHighlight: 'Teyvat',
            heroDescription: 'Tu base de datos definitiva de personajes, armas y artefactos de Genshin Impact.',
            ctaCharacters: 'Ver personajes',
            ctaMap: 'Mapa interactivo',
            sectionTitle: 'Lista de personajes',
            filterAll: 'Todos',
            searchPlaceholder: 'Buscar personaje...',
            elementAll: 'Todos los elementos',
            elementPyro: 'Pyro',
            elementHydro: 'Hydro',
            elementAnemo: 'Anemo',
            elementElectro: 'Electro',
            elementDendro: 'Dendro',
            elementCryo: 'Cryo',
            elementGeo: 'Geo',
            weaponAll: 'Todas las armas',
            loadMore: 'Cargar más personajes'
        },
        character: {
            backToCharacters: 'Volver a personajes',
            rarity: 'Rareza',
            element: 'Elemento',
            weapon: 'Arma',
            noDescription: 'Estamos preparando mas informacion de este personaje.',
            profileTitle: 'Perfil del personaje',
            pageTitle: '{name} | Genshin Guides'
        },
        weapons: {
            pageTitle: 'Armas | Genshin Guides',
            pageDescription: 'Explora el listado de armas de Genshin Impact con filtros por tipo y rareza.',
            title: 'Armas',
            subtitle: 'Consulta armas por tipo y rareza para planear mejor tus builds.',
            searchPlaceholder: 'Buscar arma...',
            filterAllTypes: 'Todos los tipos',
            filterAllRarities: 'Todas',
            typeSword: 'Espada',
            typeClaymore: 'Mandoble',
            typePolearm: 'Lanza',
            typeBow: 'Arco',
            typeCatalyst: 'Catalizador'
        },
        tierlist: {
            pageTitle: 'Tier List | Genshin Guides',
            pageDescription: 'Tier list referencial de personajes de Genshin Impact con filtros por rol y nivel.',
            title: 'Tier List de Personajes',
            subtitle: 'Clasificacion inicial inspirada en el formato de comunidad y ajustable para tu criterio.',
            disclaimer: 'Nota: esta tier list es una referencia editable y no una copia textual de terceros.',
            searchPlaceholder: 'Buscar personaje...',
            filterAllTiers: 'Todos los tiers',
            filterAllRoles: 'Todos los roles',
            roleMainDps: 'Main DPS',
            roleSubDps: 'Sub DPS',
            roleSupport: 'Support'
        },
        artifacts: {
            pageTitle: 'Artefactos | Genshin Guides',
            pageDescription: 'Explora sets de artefactos de Genshin Impact con filtros por rareza.',
            title: 'Artefactos',
            subtitle: 'Consulta bonos de set y filtra por rareza para optimizar tus builds.',
            searchPlaceholder: 'Buscar set de artefactos...',
            filterAllRarities: 'Todas',
            noBonuses: 'Sin bonos disponibles'
        },
        teams: {
            pageTitle: 'Equipos | Genshin Guides',
            pageDescription: 'Composiciones de equipos meta para Genshin Impact con arquetipos y busqueda.',
            title: 'Equipos Meta',
            subtitle: 'Selecciones recomendadas para Abismo y contenido dificil, organizadas por arquetipo.',
            searchPlaceholder: 'Buscar equipo o personaje...',
            filterAllArchetypes: 'Todos los arquetipos'
        }
    },
    en: {
        meta: {
            homeTitle: 'Genshin Guides'
        },
        navbar: {
            home: 'Home',
            characters: 'Characters',
            weapons: 'Weapons',
            artifacts: 'Artifacts',
            tierList: 'Tier List',
            teams: 'Teams',
            openMenu: 'Open main menu',
            closeMenu: 'Close main menu'
        },
        footer: {
            legal: '© {year} Genshin Guides. Not affiliated with HoYoverse.',
            privacy: 'Privacy Policy',
            terms: 'Terms of Service',
            contact: 'Contact'
        },
        home: {
            heroAlt: 'Genshin Impact Background',
            heroPrefix: 'Explore',
            heroHighlight: 'Teyvat',
            heroDescription: 'Your ultimate database for characters, weapons, and artifacts in Genshin Impact.',
            ctaCharacters: 'View Characters',
            ctaMap: 'Interactive Map',
            sectionTitle: 'Character List',
            filterAll: 'All',
            searchPlaceholder: 'Search character...',
            elementAll: 'All elements',
            elementPyro: 'Pyro',
            elementHydro: 'Hydro',
            elementAnemo: 'Anemo',
            elementElectro: 'Electro',
            elementDendro: 'Dendro',
            elementCryo: 'Cryo',
            elementGeo: 'Geo',
            weaponAll: 'All weapons',
            loadMore: 'Load More Characters'
        },
        character: {
            backToCharacters: 'Back to characters',
            rarity: 'Rarity',
            element: 'Element',
            weapon: 'Weapon',
            noDescription: 'We are preparing more information about this character.',
            profileTitle: 'Character profile',
            pageTitle: '{name} | Genshin Guides'
        },
        weapons: {
            pageTitle: 'Weapons | Genshin Guides',
            pageDescription: 'Explore the Genshin Impact weapon list with type and rarity filters.',
            title: 'Weapons',
            subtitle: 'Browse weapons by type and rarity to plan your builds.',
            searchPlaceholder: 'Search weapon...',
            filterAllTypes: 'All types',
            filterAllRarities: 'All',
            typeSword: 'Sword',
            typeClaymore: 'Claymore',
            typePolearm: 'Polearm',
            typeBow: 'Bow',
            typeCatalyst: 'Catalyst'
        },
        tierlist: {
            pageTitle: 'Tier List | Genshin Guides',
            pageDescription: 'Reference Genshin Impact character tier list with role and tier filters.',
            title: 'Character Tier List',
            subtitle: 'Initial ranking inspired by community format and editable for your own criteria.',
            disclaimer: 'Note: this tier list is an editable reference and not a verbatim copy from third parties.',
            searchPlaceholder: 'Search character...',
            filterAllTiers: 'All tiers',
            filterAllRoles: 'All roles',
            roleMainDps: 'Main DPS',
            roleSubDps: 'Sub DPS',
            roleSupport: 'Support'
        },
        artifacts: {
            pageTitle: 'Artifacts | Genshin Guides',
            pageDescription: 'Explore Genshin Impact artifact sets with rarity filters.',
            title: 'Artifacts',
            subtitle: 'Check set bonuses and filter by rarity to optimize your builds.',
            searchPlaceholder: 'Search artifact set...',
            filterAllRarities: 'All',
            noBonuses: 'No bonuses available'
        },
        teams: {
            pageTitle: 'Teams | Genshin Guides',
            pageDescription: 'Meta Genshin Impact team compositions with archetypes and search filters.',
            title: 'Meta Teams',
            subtitle: 'Recommended lineups for Abyss and endgame content, organized by archetype.',
            searchPlaceholder: 'Search team or character...',
            filterAllArchetypes: 'All archetypes'
        }
    }
} as const;

const getMessageByPath = (lang: Lang, key: string): string => {
    const segments = key.split('.');

    let current: unknown = messages[lang];

    for (const segment of segments) {
        if (typeof current !== 'object' || current === null || !(segment in current)) {
            current = undefined;
            break;
        }

        current = (current as Record<string, unknown>)[segment];
    }

    if (typeof current === 'string') {
        return current;
    }

    if (lang !== defaultLang) {
        return getMessageByPath(defaultLang, key);
    }

    return key;
};

export const t = (
    lang: Lang,
    key: string,
    vars: Record<string, string | number> = {}
): string => {
    const template = getMessageByPath(lang, key);

    return template.replaceAll(/\{(\w+)\}/g, (_, token: string) => String(vars[token] ?? `{${token}}`));
};

export const getLangPath = (lang: Lang, baseUrl: string): string => {
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    return lang === defaultLang ? normalizedBase : `${normalizedBase}${lang}/`;
};
