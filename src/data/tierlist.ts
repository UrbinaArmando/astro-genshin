import { getCharacters, type Character } from "./characters";
import type { Lang } from "../i18n";

export type Tier = "SS" | "S" | "A" | "B" | "C" | "D";
export type TierRole = "main_dps" | "sub_dps" | "support";

export const tierOrder: Tier[] = ["SS", "S", "A", "B", "C", "D"];
export const roleOrder: TierRole[] = ["main_dps", "sub_dps", "support"];

export interface TierListEntry {
    character: Character;
    tier: Tier;
    role: TierRole;
    order: number;
}

type TierMatrix = Record<Tier, Record<TierRole, string[]>>;

const tierMatrix: TierMatrix = {
    SS: {
        main_dps: ["Mavuika", "Nefer", "Flins", "Zibai", "Skirk", "Varesa"],
        sub_dps: ["Columbina", "Ineffa", "Lauma", "Furina", "Escoffier", "Durin", "Mavuika", "Fischl"],
        support: ["Columbina", "Furina", "Bennett", "Iansan", "Lauma", "Citlali", "Xilonen", "Chevreuse", "Sucrose"]
    },
    S: {
        main_dps: ["Arlecchino", "Mualani", "Varka", "Neuvillette", "Chasca", "Kinich"],
        sub_dps: ["Yelan", "Xingqiu", "Nahida", "Xiangling", "Raiden", "Albedo", "Emilie", "Nilou", "Kuki Shinobu"],
        support: ["Escoffier", "Nahida", "Mona", "Kazuha", "Ineffa", "Xianyun", "Baizhu", "Zhongli", "Shenhe"]
    },
    A: {
        main_dps: ["Clorinde", "Gaming", "Klee", "Razor", "Venti", "Navia", "Alhaitham", "Ayaka", "Wriothesley", "Lyney", "Hu Tao", "Xiao", "Raiden"],
        sub_dps: ["Ororon", "Aino", "Venti", "Mona", "Sucrose", "Chiori", "Yae Miko", "Rosaria"],
        support: ["Jean", "Lan Yan", "Kokomi", "Faruzan", "Illuga", "Diona", "Yaoyao", "Charlotte", "Layla", "Kirara", "Kuki Shinobu"]
    },
    B: {
        main_dps: ["Tartaglia", "Wanderer", "Yoimiya", "Diluc", "Ayato", "Ganyu", "Tighnari", "Sethos", "Cyno", "Ifa"],
        sub_dps: ["Jahoda", "Thoma", "Ganyu", "Collei", "Traveler", "Kokomi", "Beidou", "Kaeya", "Traveler", "Lynette"],
        support: ["Jahoda", "Yun Jin", "Sara", "Gorou", "Mizuki", "Sigewinne", "Thoma", "Dehya"]
    },
    C: {
        main_dps: ["Keqing", "Noelle", "Eula", "Mizuki", "Yanfei", "Heizou", "Kaveh"],
        sub_dps: ["Kachina", "Dehya", "Lisa", "Chongyun", "Sayu"],
        support: ["Mika", "Sayu", "Candace", "Barbara", "Traveler", "Rosaria", "Dori"]
    },
    D: {
        main_dps: ["Freminet", "Ningguang", "Dehya", "Xinyan", "Aloy"],
        sub_dps: ["Xinyan", "Traveler", "Amber", "Traveler", "Traveler"],
        support: ["Noelle", "Chongyun", "Lisa", "Xinyan"]
    }
};

const nameAlias: Record<string, string> = {
    xingchiu: "xingqiu",
    keching: "keqing",
    ninguang: "ningguang",
    sacarosa: "sucrose",
    colombina: "columbina",
    viajero: "traveler",
    viajera: "traveler",
    "raiden shogun": "raiden",
    kuki: "kuki shinobu",
    shinobu: "kuki shinobu"
};

const normalizeName = (value: string): string =>
    value
        .toLowerCase()
        .normalize("NFD")
        .replaceAll(/[\u0300-\u036f]/g, "")
        .replaceAll(/[^a-z0-9 ]+/g, " ")
        .replaceAll(/\s+/g, " ")
        .trim();

const canonicalName = (value: string): string => {
    const normalized = normalizeName(value);
    return nameAlias[normalized] ?? normalized;
};

export const getTierListEntries = async (lang: Lang): Promise<TierListEntry[]> => {
    const characters = await getCharacters(lang);
    const available = new Map<string, Character[]>();

    for (const character of characters) {
        const key = canonicalName(character.name);
        const list = available.get(key) ?? [];
        list.push(character);
        available.set(key, list);
    }

    const entries: TierListEntry[] = [];
    let order = 0;

    for (const tier of tierOrder) {
        for (const role of roleOrder) {
            for (const requestedName of tierMatrix[tier][role]) {
                const key = canonicalName(requestedName);
                const list = available.get(key);
                const character = list?.shift();
                if (!character) {
                    continue;
                }

                entries.push({
                    character,
                    tier,
                    role,
                    order: order++
                });
            }
        }
    }

    return entries;
};
