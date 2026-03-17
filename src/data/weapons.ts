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

const normalizeToSlug = (value: string): string =>
    value
        .toLowerCase()
        .normalize("NFD")
        .replaceAll(/[\u0300-\u036f]/g, "")
        .replaceAll(/[^a-z0-9]+/g, "-")
        .replaceAll(/^-+|-+$/g, "");

export const createWeaponSlug = (weapon: Pick<Weapon, "name" | "id">): string => {
    const nameSlug = normalizeToSlug(weapon.name);

    return nameSlug || normalizeToSlug(weapon.id) || weapon.id;
};

export const getWeaponBySlug = (weapons: Weapon[], slug: string): Weapon | undefined =>
    weapons.find((weapon) => createWeaponSlug(weapon) === slug);

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

export interface YattaWeaponAffix {
    name?: string;
    upgrade?: Record<string, string>;
}

export interface YattaWeaponItemRef {
    name?: string;
    rank?: number;
    icon?: string;
}

export interface YattaWeaponPromote {
    promoteLevel?: number;
    unlockMaxLevel?: number;
    requiredPlayerLevel?: number;
    coinCost?: number;
    costItems?: Record<string, number>;
    addProps?: Record<string, number>;
}

export interface YattaWeaponProp {
    propType: string;
    initValue: number;
    type?: string;
}

export interface YattaWeaponDetail {
    id: number | string;
    rank: number;
    type: YattaWeaponItem["type"];
    name: string;
    description?: string;
    specialProp?: string;
    icon?: string;
    affix?: Record<string, YattaWeaponAffix>;
    upgrade?: {
        awakenCost?: number;
        prop?: YattaWeaponProp[];
        promote?: YattaWeaponPromote[];
    };
    items?: Record<string, YattaWeaponItemRef>;
}


interface YattaWeaponDetailResponse {
    data?: YattaWeaponDetail;
}

const YATTA_API_BASE_URL = "https://gi.yatta.moe/api/v2";
const YATTA_ASSET_BASE_URL = "https://gi.yatta.moe/assets/UI";

const percentPropTypes = new Set([
    "FIGHT_PROP_ATTACK_PERCENT",
    "FIGHT_PROP_DEFENSE_PERCENT",
    "FIGHT_PROP_HP_PERCENT",
    "FIGHT_PROP_CHARGE_EFFICIENCY",
    "FIGHT_PROP_CRITICAL",
    "FIGHT_PROP_CRITICAL_HURT",
    "FIGHT_PROP_HEAL_ADD",
    "FIGHT_PROP_FIRE_ADD_HURT",
    "FIGHT_PROP_WATER_ADD_HURT",
    "FIGHT_PROP_WIND_ADD_HURT",
    "FIGHT_PROP_ELEC_ADD_HURT",
    "FIGHT_PROP_ICE_ADD_HURT",
    "FIGHT_PROP_ROCK_ADD_HURT",
    "FIGHT_PROP_GRASS_ADD_HURT",
    "FIGHT_PROP_PHYSICAL_ADD_HURT"
]);

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

export const getWeaponDetail = async (weaponId: string, lang: Lang): Promise<YattaWeaponDetail | null> => {
    try {
        const response = await fetch(`${YATTA_API_BASE_URL}/${lang}/weapon/${weaponId}`);

        if (!response.ok) {
            return null;
        }

        const payload = (await response.json()) as YattaWeaponDetailResponse;
        return payload.data ?? null;
    } catch {
        return null;
    }
};

export const cleanWeaponRichText = (value: string): string =>
    value
        .replaceAll(/<color=.*?>/g, "")
        .replaceAll("</color>", "")
        .replaceAll(/\{LINK#[^}]+\}/g, "")
        .replaceAll("{/LINK}", "")
        .replaceAll(/\{LAYOUT_[A-Z]+#[^}]+\}/g, "")
        .replaceAll("{NON_BREAK_SPACE}", " ")
        .replaceAll(/\{?NON_BREAK_SPACE\}?/g, " ")
        .replaceAll(/\{[A-Z_]+#[^}]+\}/g, "")
        .replaceAll(/(^|\n)#(?=\S)/g, "$1")
        .replaceAll(String.raw`\n`, "\n")
        .replaceAll(/[ \t]{2,}/g, " ")
        .trim();

export const getWeaponPropLabel = (propType: string, lang: Lang): string => {
    const labels: Record<Lang, Record<string, string>> = {
        es: {
            FIGHT_PROP_BASE_ATTACK: "ATQ base",
            FIGHT_PROP_ATTACK_PERCENT: "ATQ%",
            FIGHT_PROP_CRITICAL: "Prob. Crit",
            FIGHT_PROP_CRITICAL_HURT: "Daño Crit",
            FIGHT_PROP_CHARGE_EFFICIENCY: "Recarga de Energía",
            FIGHT_PROP_ELEMENT_MASTERY: "Maestría Elemental",
            FIGHT_PROP_HP_PERCENT: "Vida%",
            FIGHT_PROP_DEFENSE_PERCENT: "DEF%"
        },
        en: {
            FIGHT_PROP_BASE_ATTACK: "Base ATK",
            FIGHT_PROP_ATTACK_PERCENT: "ATK%",
            FIGHT_PROP_CRITICAL: "CRIT Rate",
            FIGHT_PROP_CRITICAL_HURT: "CRIT DMG",
            FIGHT_PROP_CHARGE_EFFICIENCY: "Energy Recharge",
            FIGHT_PROP_ELEMENT_MASTERY: "Elemental Mastery",
            FIGHT_PROP_HP_PERCENT: "HP%",
            FIGHT_PROP_DEFENSE_PERCENT: "DEF%"
        }
    };

    return labels[lang][propType] ?? propType;
};

export const formatWeaponPropValue = (value: number, propType: string, lang: Lang): string => {
    const locale = lang === "es" ? "es-ES" : "en-US";
    const isPercent = percentPropTypes.has(propType);
    const normalized = isPercent ? value * 100 : value;

    const formatted = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: isPercent ? 1 : 0
    }).format(normalized);

    return isPercent ? `${formatted}%` : formatted;
};
