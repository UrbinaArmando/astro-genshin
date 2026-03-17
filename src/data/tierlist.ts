import { getCharacters, type Character } from "./characters";
import type { Lang } from "../i18n";

export type Tier = "S" | "A" | "B" | "C";
export type TierRole = "main_dps" | "sub_dps" | "support";

export interface TierListEntry {
    character: Character;
    tier: Tier;
    role: TierRole;
    note?: string;
}

const tierOverrideById: Partial<Record<string, Tier>> = {
    furina: "S",
    neuvillette: "S",
    nahida: "S",
    bennett: "S",
    kazuha: "S"
};

const roleOverrideById: Partial<Record<string, TierRole>> = {
    bennett: "support",
    furina: "support",
    kazuha: "support",
    nahida: "support",
    xingqiu: "sub_dps",
    yelan: "sub_dps",
    xiangling: "sub_dps",
    raiden: "sub_dps"
};

const inferRole = (character: Character): TierRole => {
    const override = roleOverrideById[character.id];
    if (override) {
        return override;
    }

    if (character.weapon === "Bow" || character.weapon === "Catalyst") {
        return "sub_dps";
    }

    if (character.element === "Anemo" || character.element === "Geo" || character.element === "Hydro") {
        return "support";
    }

    return "main_dps";
};

const inferTier = (character: Character): Tier => {
    const override = tierOverrideById[character.id];
    if (override) {
        return override;
    }

    const release = character.releaseOrder ?? 0;

    if (character.rarity === 5 && release >= 1710000000) {
        return "S";
    }

    if (character.rarity === 5) {
        return "A";
    }

    if (character.rarity === 4 && release >= 1710000000) {
        return "A";
    }

    return "B";
};

export const getTierListEntries = async (lang: Lang): Promise<TierListEntry[]> => {
    const characters = await getCharacters(lang);

    return characters.map((character) => ({
        character,
        tier: inferTier(character),
        role: inferRole(character)
    }));
};
