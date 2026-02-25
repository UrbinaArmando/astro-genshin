import { type Lang } from '../i18n';

export interface Character {
    id: string;
    name: string;
    rarity: 4 | 5;
    element: 'Pyro' | 'Hydro' | 'Anemo' | 'Electro' | 'Dendro' | 'Cryo' | 'Geo';
    weapon: 'Sword' | 'Claymore' | 'Polearm' | 'Bow' | 'Catalyst';
    title?: string;
    description?: string;
    elementLabel?: string;
    weaponLabel?: string;
    imageUrl: string;
    fallbackImageUrl?: string;
}

const fallbackCharacters: Character[] = [
    {
        id: 'amber',
        name: 'Amber',
        rarity: 4,
        element: 'Pyro',
        weapon: 'Bow',
        imageUrl: 'https://sunderarmor.com/GENSHIN/Characters/1/Amber.png'
    },
    {
        id: 'kaeya',
        name: 'Kaeya',
        rarity: 4,
        element: 'Cryo',
        weapon: 'Sword',
        imageUrl: 'https://sunderarmor.com/GENSHIN/Characters/1/Kaeya.png'
    },
    {
        id: 'lisa',
        name: 'Lisa',
        rarity: 4,
        element: 'Electro',
        weapon: 'Catalyst',
        imageUrl: 'https://sunderarmor.com/GENSHIN/Characters/1/Lisa.png'
    },
    {
        id: 'diluc',
        name: 'Diluc',
        rarity: 5,
        element: 'Pyro',
        weapon: 'Claymore',
        imageUrl: 'https://sunderarmor.com/GENSHIN/Characters/1/Diluc.png'
    },
    {
        id: 'jean',
        name: 'Jean',
        rarity: 5,
        element: 'Anemo',
        weapon: 'Sword',
        imageUrl: 'https://sunderarmor.com/GENSHIN/Characters/1/Jean.png'
    }
];

interface GsiCharacter {
    id: number;
    name: string;
    rarity: '4_star' | '5_star';
    weapon: Character['weapon'];
    vision: Character['element'];
    wiki_url: string;
}

interface GsiCharacterListResponse {
    page: number;
    results: GsiCharacter[];
    total_pages: number;
}

interface GenshinDbCharacterResponse {
    name?: string;
    title?: string;
    description?: string;
    weaponText?: string;
    elementText?: string;
}

const GSI_API_BASE_URL = 'https://gsi.fly.dev';
const GENSHIN_DB_API_BASE_URL = 'https://genshin-db-api.vercel.app/api/v5';

const toSlug = (value: string) =>
    value
        .toLowerCase()
        .replace(/['’.]/g, '')
        .replace(/\s+/g, '-');

const mapRarity = (rarity: GsiCharacter['rarity']): Character['rarity'] =>
    rarity === '5_star' ? 5 : 4;

const imageNameAliases: Record<string, string> = {
    Tartaglia: 'Childe',
    'Raiden Shogun': 'Raiden',
    Yae: 'Yae Miko',
    Kuki: 'Kuki Shinobu'
};

const getImageName = (name: string): string => imageNameAliases[name] ?? name;

const characterQueryAliases: Record<string, string> = {
    'Traveller (male)': 'Aether',
    'Traveller (female)': 'Lumine',
    Tartaglia: 'Tartaglia',
    Yae: 'Yae Miko',
    Kuki: 'Kuki Shinobu',
    Sara: 'Kujou Sara',
    Ayaka: 'Kamisato Ayaka',
    Ayato: 'Kamisato Ayato',
    Kazuha: 'Kaedehara Kazuha',
    Itto: 'Arataki Itto',
    Kokomi: 'Sangonomiya Kokomi'
};

const getCharacterQueryName = (name: string): string => characterQueryAliases[name] ?? name;

const getResultLanguage = (lang: Lang): 'Spanish' | 'English' =>
    lang === 'es' ? 'Spanish' : 'English';

const localizedDetailsCache = new Map<string, Promise<GenshinDbCharacterResponse | undefined>>();

const getLocalizedCharacterDetails = async (
    name: string,
    lang: Lang
): Promise<GenshinDbCharacterResponse | undefined> => {
    const queryName = getCharacterQueryName(name);
    const cacheKey = `${lang}:${queryName.toLowerCase()}`;

    if (localizedDetailsCache.has(cacheKey)) {
        return localizedDetailsCache.get(cacheKey);
    }

    const fetchPromise = (async () => {
        try {
            const params = new URLSearchParams({
                query: queryName,
                resultLanguage: getResultLanguage(lang)
            });

            const response = await fetch(`${GENSHIN_DB_API_BASE_URL}/characters?${params.toString()}`);

            if (!response.ok) {
                return undefined;
            }

            return (await response.json()) as GenshinDbCharacterResponse;
        } catch {
            return undefined;
        }
    })();

    localizedDetailsCache.set(cacheKey, fetchPromise);
    return fetchPromise;
};

const getFallbackImageUrl = (name: string): string =>
    `https://sunderarmor.com/GENSHIN/Characters/1/${encodeURIComponent(getImageName(name))}.png`;

const normalizeWikiTitle = (value: string): string =>
    decodeURIComponent(value).replace(/\s+/g, '_');

const getWikiTitleFromUrl = (wikiUrl: string): string => {
    try {
        const pathname = new URL(wikiUrl).pathname;
        const rawTitle = pathname.split('/').filter(Boolean).pop();
        return rawTitle ? normalizeWikiTitle(rawTitle) : '';
    } catch {
        return '';
    }
};

const getFandomThumbnailMap = async (
    gsiCharacters: GsiCharacter[]
): Promise<Record<string, string>> => {
    const titles = Array.from(
        new Set(gsiCharacters.map((character) => getWikiTitleFromUrl(character.wiki_url)).filter(Boolean))
    );

    if (!titles.length) {
        return {};
    }

    const chunkSize = 15;
    const thumbnailMap: Record<string, string> = {};

    for (let index = 0; index < titles.length; index += chunkSize) {
        const chunk = titles.slice(index, index + chunkSize);
        const params = new URLSearchParams({
            action: 'query',
            format: 'json',
            prop: 'pageimages',
            pithumbsize: '512',
            titles: chunk.join('|')
        });

        const response = await fetch(`https://genshin-impact.fandom.com/api.php?${params.toString()}`);

        if (!response.ok) {
            continue;
        }

        const payload = (await response.json()) as {
            query?: { pages?: Record<string, { title?: string; thumbnail?: { source?: string } }> };
        };

        const pages = payload.query?.pages ?? {};

        for (const page of Object.values(pages)) {
            const pageTitle = page.title ? normalizeWikiTitle(page.title) : '';
            const thumbnailUrl = page.thumbnail?.source;

            if (pageTitle && thumbnailUrl) {
                thumbnailMap[pageTitle] = thumbnailUrl;
            }
        }
    }

    return thumbnailMap;
};

const mapToCharacter = (
    character: GsiCharacter,
    thumbnailMap: Record<string, string>
): Character => {
    const wikiTitle = getWikiTitleFromUrl(character.wiki_url);
    const thumbnailUrl = wikiTitle ? thumbnailMap[wikiTitle] : undefined;

    return {
        id: toSlug(character.name),
        name: character.name,
        rarity: mapRarity(character.rarity),
        element: character.vision,
        weapon: character.weapon,
        elementLabel: character.vision,
        weaponLabel: character.weapon,
        imageUrl: thumbnailUrl ?? getFallbackImageUrl(character.name),
        fallbackImageUrl: getFallbackImageUrl(character.name)
    };
};

const enrichCharactersWithLocalization = async (
    characters: Character[],
    lang: Lang
): Promise<Character[]> => {
    const localizedDetails = await Promise.all(
        characters.map((character) => getLocalizedCharacterDetails(character.name, lang))
    );

    return characters.map((character, index) => {
        const details = localizedDetails[index];

        if (!details) {
            return character;
        }

        return {
            ...character,
            name: details.name ?? character.name,
            title: details.title,
            description: details.description,
            elementLabel: details.elementText ?? character.elementLabel ?? character.element,
            weaponLabel: details.weaponText ?? character.weaponLabel ?? character.weapon
        };
    });
};

export const getCharacters = async (lang: Lang = 'es'): Promise<Character[]> => {
    try {
        const limitPerPage = 100;
        const firstResponse = await fetch(`${GSI_API_BASE_URL}/characters?limit=${limitPerPage}&page=1`);

        if (!firstResponse.ok) {
            throw new Error(`GSI API request failed with status ${firstResponse.status}`);
        }

        const firstPayload = (await firstResponse.json()) as GsiCharacterListResponse;

        if (!firstPayload.results?.length) {
            return fallbackCharacters;
        }

        const allResults = [...firstPayload.results];

        for (let page = 2; page <= firstPayload.total_pages; page += 1) {
            const pageResponse = await fetch(`${GSI_API_BASE_URL}/characters?limit=${limitPerPage}&page=${page}`);

            if (!pageResponse.ok) {
                break;
            }

            const pagePayload = (await pageResponse.json()) as GsiCharacterListResponse;
            allResults.push(...pagePayload.results);
        }

        const thumbnailMap = await getFandomThumbnailMap(allResults);
        const baseCharacters = allResults.map((character) => mapToCharacter(character, thumbnailMap));

        return enrichCharactersWithLocalization(baseCharacters, lang);
    } catch {
        return fallbackCharacters;
    }
};

export const characters = fallbackCharacters;
