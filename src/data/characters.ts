export interface Character {
    id: string;
    name: string;
    rarity: 4 | 5;
    element: 'Pyro' | 'Hydro' | 'Anemo' | 'Electro' | 'Dendro' | 'Cryo' | 'Geo';
    weapon: 'Sword' | 'Claymore' | 'Polearm' | 'Bow' | 'Catalyst';
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

const GSI_API_BASE_URL = 'https://gsi.fly.dev';

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
    imageUrl: thumbnailUrl ?? getFallbackImageUrl(character.name),
    fallbackImageUrl: getFallbackImageUrl(character.name)
    };
};

export const getCharacters = async (): Promise<Character[]> => {
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

        return allResults.map((character) => mapToCharacter(character, thumbnailMap));
    } catch {
        return fallbackCharacters;
    }
};

export const characters = fallbackCharacters;
