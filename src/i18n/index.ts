export const supportedLangs = ['es', 'en'] as const;
export type Lang = (typeof supportedLangs)[number];

export const defaultLang: Lang = 'es';

const messages = {
    es: {
        meta: {
            homeTitle: 'Genshin Hub'
        },
        navbar: {
            home: 'Inicio',
            characters: 'Personajes',
            tierList: 'Tier List',
            teams: 'Equipos',
            openMenu: 'Abrir menú principal',
            closeMenu: 'Cerrar menú principal'
        },
        footer: {
            legal: '© {year} Genshin Hub. No afiliado con HoYoverse.',
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
        }
    },
    en: {
        meta: {
            homeTitle: 'Genshin Hub'
        },
        navbar: {
            home: 'Home',
            characters: 'Characters',
            tierList: 'Tier List',
            teams: 'Teams',
            openMenu: 'Open main menu',
            closeMenu: 'Close main menu'
        },
        footer: {
            legal: '© {year} Genshin Hub. Not affiliated with HoYoverse.',
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

    return template.replace(/\{(\w+)\}/g, (_, token: string) => String(vars[token] ?? `{${token}}`));
};

export const getLangPath = (lang: Lang, baseUrl: string): string => {
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    return lang === defaultLang ? normalizedBase : `${normalizedBase}${lang}/`;
};
