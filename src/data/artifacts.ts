import { type Lang } from "../i18n";

export interface ArtifactSet {
    id: string;
    name: string;
    rarity: 1 | 2 | 3 | 4 | 5;
    bonuses: string[];
    imageUrl: string;
    fallbackImageUrl?: string;
}

interface YattaReliquaryItem {
    id: number | string;
    name: string;
    levelList?: number[];
    affixList?: Record<string, string>;
    icon?: string;
}

interface YattaReliquaryResponse {
    data?: {
        items?: Record<string, YattaReliquaryItem>;
    };
}

const YATTA_API_BASE_URL = "https://gi.yatta.moe/api/v2";
const YATTA_RELIQUARY_ASSET_BASE_URL = "https://gi.yatta.moe/assets/UI/reliquary";

const fallbackArtifacts: ArtifactSet[] = [
    {
        id: "10001",
        name: "Resolution of Sojourner",
        rarity: 4,
        bonuses: ["ATK +18%", "Increases Charged Attack CRIT Rate by 30%"],
        imageUrl: `${YATTA_RELIQUARY_ASSET_BASE_URL}/UI_RelicIcon_10001_4.png`,
        fallbackImageUrl: `${YATTA_RELIQUARY_ASSET_BASE_URL}/UI_RelicIcon_10001_4.png`
    }
];

const getBestRarity = (levelList?: number[]): ArtifactSet["rarity"] => {
    if (!levelList?.length) {
        return 5;
    }

    const maxRarity = Math.max(...levelList);
    if (maxRarity >= 5) return 5;
    if (maxRarity === 4) return 4;
    if (maxRarity === 3) return 3;
    if (maxRarity === 2) return 2;
    return 1;
};

const getBonuses = (affixList?: Record<string, string>): string[] => {
    if (!affixList) {
        return [];
    }

    return Object.entries(affixList)
        .sort(([first], [second]) => Number(first) - Number(second))
        .map(([, value]) => value)
        .filter(Boolean);
};

const mapYattaItemToArtifact = (key: string, item: YattaReliquaryItem): ArtifactSet | null => {
    if (!item.icon) {
        return null;
    }

    const imageUrl = `${YATTA_RELIQUARY_ASSET_BASE_URL}/${item.icon}.png`;

    return {
        id: key,
        name: item.name,
        rarity: getBestRarity(item.levelList),
        bonuses: getBonuses(item.affixList),
        imageUrl,
        fallbackImageUrl: imageUrl
    };
};

const sortArtifacts = (artifacts: ArtifactSet[]): ArtifactSet[] =>
    [...artifacts].sort((first, second) => {
        if (first.rarity !== second.rarity) {
            return second.rarity - first.rarity;
        }

        return first.name.localeCompare(second.name);
    });

export const getArtifacts = async (lang: Lang = "es"): Promise<ArtifactSet[]> => {
    try {
        const response = await fetch(`${YATTA_API_BASE_URL}/${lang}/reliquary`);

        if (!response.ok) {
            throw new Error(`Yatta API request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as YattaReliquaryResponse;
        const items = payload.data?.items;

        if (!items) {
            return fallbackArtifacts;
        }

        const mappedArtifacts = Object.entries(items)
            .map(([key, item]) => mapYattaItemToArtifact(key, item))
            .filter((artifact): artifact is ArtifactSet => artifact !== null);

        if (!mappedArtifacts.length) {
            return fallbackArtifacts;
        }

        return sortArtifacts(mappedArtifacts);
    } catch {
        return fallbackArtifacts;
    }
};
