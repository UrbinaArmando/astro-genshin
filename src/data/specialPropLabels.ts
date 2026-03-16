import type { Lang } from "../i18n";

const specialPropLabels: Record<Lang, Record<string, string>> = {
    es: {
        FIGHT_PROP_CRITICAL: "Prob. CRIT",
        FIGHT_PROP_CRITICAL_HURT: "Daño CRIT",
        FIGHT_PROP_CHARGE_EFFICIENCY: "Recarga de Energía",
        FIGHT_PROP_ELEMENT_MASTERY: "Maestría Elemental",
        FIGHT_PROP_HEAL_ADD: "Bono de Curación",
        FIGHT_PROP_ATTACK_PERCENT: "ATQ%",
        FIGHT_PROP_HP_PERCENT: "Vida%",
        FIGHT_PROP_DEFENSE_PERCENT: "DEF%",
        FIGHT_PROP_PHYSICAL_ADD_HURT: "Bono de Daño Físico",
        FIGHT_PROP_FIRE_ADD_HURT: "Bono de Daño Pyro",
        FIGHT_PROP_WATER_ADD_HURT: "Bono de Daño Hydro",
        FIGHT_PROP_WIND_ADD_HURT: "Bono de Daño Anemo",
        FIGHT_PROP_ELEC_ADD_HURT: "Bono de Daño Electro",
        FIGHT_PROP_GRASS_ADD_HURT: "Bono de Daño Dendro",
        FIGHT_PROP_ICE_ADD_HURT: "Bono de Daño Cryo",
        FIGHT_PROP_ROCK_ADD_HURT: "Bono de Daño Geo"
    },
    en: {
        FIGHT_PROP_CRITICAL: "CRIT Rate",
        FIGHT_PROP_CRITICAL_HURT: "CRIT DMG",
        FIGHT_PROP_CHARGE_EFFICIENCY: "Energy Recharge",
        FIGHT_PROP_ELEMENT_MASTERY: "Elemental Mastery",
        FIGHT_PROP_HEAL_ADD: "Healing Bonus",
        FIGHT_PROP_ATTACK_PERCENT: "ATK%",
        FIGHT_PROP_HP_PERCENT: "HP%",
        FIGHT_PROP_DEFENSE_PERCENT: "DEF%",
        FIGHT_PROP_PHYSICAL_ADD_HURT: "Physical DMG Bonus",
        FIGHT_PROP_FIRE_ADD_HURT: "Pyro DMG Bonus",
        FIGHT_PROP_WATER_ADD_HURT: "Hydro DMG Bonus",
        FIGHT_PROP_WIND_ADD_HURT: "Anemo DMG Bonus",
        FIGHT_PROP_ELEC_ADD_HURT: "Electro DMG Bonus",
        FIGHT_PROP_GRASS_ADD_HURT: "Dendro DMG Bonus",
        FIGHT_PROP_ICE_ADD_HURT: "Cryo DMG Bonus",
        FIGHT_PROP_ROCK_ADD_HURT: "Geo DMG Bonus"
    }
};

export const getSpecialPropLabel = (specialProp: string | undefined, lang: Lang): string => {
    if (!specialProp) {
        return "-";
    }

    return specialPropLabels[lang][specialProp] ?? specialProp;
};
