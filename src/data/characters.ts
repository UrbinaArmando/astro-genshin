import { type Lang } from '../i18n';

export interface Character {
    id: string;
    name: string;
    rarity: 4 | 5;
    element: 'Pyro' | 'Hydro' | 'Anemo' | 'Electro' | 'Dendro' | 'Cryo' | 'Geo';
    elements?: Array<'Pyro' | 'Hydro' | 'Anemo' | 'Electro' | 'Dendro' | 'Cryo' | 'Geo'>;
    weapon: 'Sword' | 'Claymore' | 'Polearm' | 'Bow' | 'Catalyst';
    title?: string;
    description?: string;
    elementLabel?: string;
    weaponLabel?: string;
    releaseOrder?: number;
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
        elementLabel: 'Pyro',
        weaponLabel: 'Bow',
        imageUrl: 'https://sunderarmor.com/GENSHIN/Characters/1/Amber.png',
        fallbackImageUrl: 'https://sunderarmor.com/GENSHIN/Characters/1/Amber.png'
    },
    {
        id: 'kaeya',
        name: 'Kaeya',
        rarity: 4,
        element: 'Cryo',
        weapon: 'Sword',
        elementLabel: 'Cryo',
        weaponLabel: 'Sword',
        imageUrl: 'https://sunderarmor.com/GENSHIN/Characters/1/Kaeya.png',
        fallbackImageUrl: 'https://sunderarmor.com/GENSHIN/Characters/1/Kaeya.png'
    }
];

interface YattaAvatarItem {
    id: number | string;
    rank: number;
    name: string;
    element: 'Fire' | 'Water' | 'Wind' | 'Electric' | 'Grass' | 'Ice' | 'Rock';
    weaponType:
        | 'WEAPON_SWORD_ONE_HAND'
        | 'WEAPON_CLAYMORE'
        | 'WEAPON_POLE'
        | 'WEAPON_BOW'
        | 'WEAPON_CATALYST';
    icon: string;
    release?: number;
}

interface YattaAvatarResponse {
    data?: {
        items?: Record<string, YattaAvatarItem>;
    };
}

const YATTA_API_BASE_URL = 'https://gi.yatta.moe/api/v2';
const YATTA_ASSET_BASE_URL = 'https://gi.yatta.moe/assets/UI';

const elementByYattaValue: Record<YattaAvatarItem['element'], Character['element']> = {
    Fire: 'Pyro',
    Water: 'Hydro',
    Wind: 'Anemo',
    Electric: 'Electro',
    Grass: 'Dendro',
    Ice: 'Cryo',
    Rock: 'Geo'
};

const weaponByYattaValue: Record<YattaAvatarItem['weaponType'], Character['weapon']> = {
    WEAPON_SWORD_ONE_HAND: 'Sword',
    WEAPON_CLAYMORE: 'Claymore',
    WEAPON_POLE: 'Polearm',
    WEAPON_BOW: 'Bow',
    WEAPON_CATALYST: 'Catalyst'
};

const elementLabelByLang: Record<Lang, Record<Character['element'], string>> = {
    es: {
        Pyro: 'Pyro',
        Hydro: 'Hydro',
        Anemo: 'Anemo',
        Electro: 'Electro',
        Dendro: 'Dendro',
        Cryo: 'Cryo',
        Geo: 'Geo'
    },
    en: {
        Pyro: 'Pyro',
        Hydro: 'Hydro',
        Anemo: 'Anemo',
        Electro: 'Electro',
        Dendro: 'Dendro',
        Cryo: 'Cryo',
        Geo: 'Geo'
    }
};

const weaponLabelByLang: Record<Lang, Record<Character['weapon'], string>> = {
    es: {
        Sword: 'Espada',
        Claymore: 'Mandoble',
        Polearm: 'Lanza',
        Bow: 'Arco',
        Catalyst: 'Catalizador'
    },
    en: {
        Sword: 'Sword',
        Claymore: 'Claymore',
        Polearm: 'Polearm',
        Bow: 'Bow',
        Catalyst: 'Catalyst'
    }
};

const toApiLocale = (lang: Lang): 'en' | 'es' => (lang === 'es' ? 'es' : 'en');

const mapYattaItemToCharacter = (key: string, item: YattaAvatarItem, lang: Lang): Character | null => {
    const element = elementByYattaValue[item.element];
    const weapon = weaponByYattaValue[item.weaponType];

    if (!element || !weapon || !item.icon || item.rank < 4) {
        return null;
    }

    const imageUrl = `${YATTA_ASSET_BASE_URL}/${item.icon}.png`;

    return {
        id: key,
        name: item.name,
        rarity: item.rank === 5 ? 5 : 4,
        element,
        elements: [element],
        weapon,
        elementLabel: elementLabelByLang[lang][element],
        weaponLabel: weaponLabelByLang[lang][weapon],
        releaseOrder: item.release,
        imageUrl,
        fallbackImageUrl: imageUrl
    };
};

const sortCharactersByReleaseOrder = (characters: Character[]): Character[] =>
    [...characters].sort((first, second) => {
        const firstOrder = first.releaseOrder ?? Number.MAX_SAFE_INTEGER;
        const secondOrder = second.releaseOrder ?? Number.MAX_SAFE_INTEGER;

        if (firstOrder !== secondOrder) {
            return secondOrder - firstOrder;
        }

        return second.name.localeCompare(first.name);
    });

export const getCharacters = async (lang: Lang = 'es'): Promise<Character[]> => {
    try {
        const locale = toApiLocale(lang);
        const response = await fetch(`${YATTA_API_BASE_URL}/${locale}/avatar`);

        if (!response.ok) {
            throw new Error(`Yatta API request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as YattaAvatarResponse;
        const items = payload.data?.items;

        if (!items) {
            return fallbackCharacters;
        }

        const mappedCharacters = Object.entries(items)
            .map(([key, item]) => mapYattaItemToCharacter(key, item, lang))
            .filter((character): character is Character => character !== null);

        if (!mappedCharacters.length) {
            return fallbackCharacters;
        }

        return sortCharactersByReleaseOrder(mappedCharacters);
    } catch {
        return fallbackCharacters;
    }
};

export const characters = fallbackCharacters;
