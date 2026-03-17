import { type Lang } from "../i18n";

export interface Weapon {
    id: string;
    name: string;
    rarity: 1 | 2 | 3 | 4 | 5;
    type: "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst";
    typeLabel: string;
    imageUrl: string;
    fallbackImageUrl?: string;
}

interface YattaWeaponItem {
    id: number | string;
    rank: number;
    type:
        | "WEAPON_SWORD_ONE_HAND"
        | "WEAPON_CLAYMORE"
        | "WEAPON_POLE"
        | "WEAPON_BOW"
        | "WEAPON_CATALYST";
    name: string;
    icon: string;
}

interface YattaWeaponResponse {
    data?: {
        items?: Record<string, YattaWeaponItem>;
    };
}

const YATTA_API_BASE_URL = "https://gi.yatta.moe/api/v2";
const YATTA_ASSET_BASE_URL = "https://gi.yatta.moe/assets/UI";

const weaponTypeByYattaValue: Record<YattaWeaponItem["type"], Weapon["type"]> = {
    WEAPON_SWORD_ONE_HAND: "Sword",
    WEAPON_CLAYMORE: "Claymore",
    WEAPON_POLE: "Polearm",
    WEAPON_BOW: "Bow",
    WEAPON_CATALYST: "Catalyst"
};

const weaponTypeLabelByLang: Record<Lang, Record<Weapon["type"], string>> = {
    es: {
        Sword: "Espada",
        Claymore: "Mandoble",
        Polearm: "Lanza",
        Bow: "Arco",
        Catalyst: "Catalizador"
    },
    en: {
        Sword: "Sword",
        Claymore: "Claymore",
        Polearm: "Polearm",
        Bow: "Bow",
        Catalyst: "Catalyst"
    }
};

const fallbackWeapons: Weapon[] = [
    {
        id: "11101",
        name: "Dull Blade",
        rarity: 1,
        type: "Sword",
        typeLabel: "Sword",
        imageUrl: `${YATTA_ASSET_BASE_URL}/UI_EquipIcon_Sword_Blunt.png`,
        fallbackImageUrl: `${YATTA_ASSET_BASE_URL}/UI_EquipIcon_Sword_Blunt.png`
    },
    {
        id: "15401",
        name: "Hunter's Bow",
        rarity: 1,
        type: "Bow",
        typeLabel: "Bow",
        imageUrl: `${YATTA_ASSET_BASE_URL}/UI_EquipIcon_Bow_Hunters.png`,
        fallbackImageUrl: `${YATTA_ASSET_BASE_URL}/UI_EquipIcon_Bow_Hunters.png`
    }
];

const mapYattaWeaponToWeapon = (key: string, item: YattaWeaponItem, lang: Lang): Weapon | null => {
    const type = weaponTypeByYattaValue[item.type];

    if (!type || !item.icon || item.rank < 1 || item.rank > 5) {
        return null;
    }

    const imageUrl = `${YATTA_ASSET_BASE_URL}/${item.icon}.png`;

    return {
        id: key,
        name: item.name,
        rarity: item.rank as Weapon["rarity"],
        type,
        typeLabel: weaponTypeLabelByLang[lang][type],
        imageUrl,
        fallbackImageUrl: imageUrl
    };
};

const sortWeapons = (weapons: Weapon[]): Weapon[] =>
    [...weapons].sort((first, second) => {
        if (first.rarity !== second.rarity) {
            return second.rarity - first.rarity;
        }

        return first.name.localeCompare(second.name);
    });

export const getWeapons = async (lang: Lang = "es"): Promise<Weapon[]> => {
    try {
        const response = await fetch(`${YATTA_API_BASE_URL}/${lang}/weapon`);

        if (!response.ok) {
            throw new Error(`Yatta API request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as YattaWeaponResponse;
        const items = payload.data?.items;

        if (!items) {
            return fallbackWeapons;
        }

        const mappedWeapons = Object.entries(items)
            .map(([key, item]) => mapYattaWeaponToWeapon(key, item, lang))
            .filter((weapon): weapon is Weapon => weapon !== null);

        if (!mappedWeapons.length) {
            return fallbackWeapons;
        }

        return sortWeapons(mappedWeapons);
    } catch {
        return fallbackWeapons;
    }
};
