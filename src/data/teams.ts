import { getCharacters, type Character } from "./characters";
import type { Lang } from "../i18n";

export type TeamArchetype =
    | "freeze"
    | "vape"
    | "melt"
    | "hyperbloom"
    | "quicken"
    | "electrocharged"
    | "mono"
    | "national"
    | "plunge";

export interface TeamMember {
    character: Character;
    role: string;
}

export interface Team {
    id: string;
    name: string;
    archetype: TeamArchetype;
    note: string;
    members: TeamMember[];
}

interface TeamTemplate {
    id: string;
    archetype: TeamArchetype;
    memberIds: string[];
    nameByLang: Record<Lang, string>;
    noteByLang: Record<Lang, string>;
    roleLabels: Record<Lang, string[]>;
}

const teamTemplates: TeamTemplate[] = [
    {
        id: "team-neuvillette-furina-core",
        archetype: "mono",
        memberIds: ["10000087", "10000089", "10000047", "10000082"],
        nameByLang: {
            es: "Neuvillette Hypercarry",
            en: "Neuvillette Hypercarry"
        },
        noteByLang: {
            es: "Core de alto rendimiento para jefes y salas largas con gran daño sostenido.",
            en: "Top-performing core for bosses and long chambers with excellent sustained damage."
        },
        roleLabels: {
            es: ["Main DPS", "Buffer", "Control", "Sustain"],
            en: ["Main DPS", "Buffer", "Control", "Sustain"]
        }
    },
    {
        id: "team-alhaitham-hyperbloom",
        archetype: "hyperbloom",
        memberIds: ["10000078", "10000060", "10000065", "10000073"],
        nameByLang: {
            es: "Alhaitham Hyperbloom",
            en: "Alhaitham Hyperbloom"
        },
        noteByLang: {
            es: "Equipo meta muy consistente en single-target y multi-target con rotaciones estables.",
            en: "Very consistent meta team for both single-target and multi-target with stable rotations."
        },
        roleLabels: {
            es: ["Driver DPS", "Hydro", "Trigger", "Dendro"],
            en: ["Driver DPS", "Hydro", "Trigger", "Dendro"]
        }
    },
    {
        id: "team-raiden-national",
        archetype: "national",
        memberIds: ["10000052", "10000023", "10000032", "10000025"],
        nameByLang: {
            es: "Raiden National",
            en: "Raiden National"
        },
        noteByLang: {
            es: "Composicion iconica para limpiar contenido con daño explosivo y rotaciones compactas.",
            en: "Iconic composition for fast clears with explosive damage and compact rotations."
        },
        roleLabels: {
            es: ["Driver", "Sub DPS", "Buffer", "Hydro"],
            en: ["Driver", "Sub DPS", "Buffer", "Hydro"]
        }
    },
    {
        id: "team-arlecchino-vape",
        archetype: "vape",
        memberIds: ["10000096", "10000089", "10000047", "10000030"],
        nameByLang: {
            es: "Arlecchino Vape",
            en: "Arlecchino Vape"
        },
        noteByLang: {
            es: "Setup ofensivo con ventanas de burst muy fuertes para objetivos prioritarios.",
            en: "Aggressive setup with very strong burst windows for priority targets."
        },
        roleLabels: {
            es: ["Main DPS", "Buffer", "Control", "Shield"],
            en: ["Main DPS", "Buffer", "Control", "Shield"]
        }
    },
    {
        id: "team-mualani-vape",
        archetype: "vape",
        memberIds: ["10000102", "10000106", "10000107", "10000047"],
        nameByLang: {
            es: "Mualani Vape",
            en: "Mualani Vape"
        },
        noteByLang: {
            es: "Composicion moderna de gran daño puntual con buen control de campo.",
            en: "Modern composition with high burst damage and strong field control."
        },
        roleLabels: {
            es: ["Main DPS", "Pyro enabler", "Sustain", "Control"],
            en: ["Main DPS", "Pyro enabler", "Sustain", "Control"]
        }
    },
    {
        id: "team-fontaine-freeze",
        archetype: "freeze",
        memberIds: ["10000087", "10000089", "10000047", "10000086"],
        nameByLang: {
            es: "Freeze Fontaine",
            en: "Fontaine Freeze"
        },
        noteByLang: {
            es: "Congelado consistente con muy buen rendimiento contra grupos de enemigos.",
            en: "Consistent Freeze control with strong performance against grouped enemies."
        },
        roleLabels: {
            es: ["Main DPS", "Buffer", "Control", "Sub DPS"],
            en: ["Main DPS", "Buffer", "Control", "Sub DPS"]
        }
    },
    {
        id: "team-wriothesley-melt",
        archetype: "melt",
        memberIds: ["10000086", "10000112", "10000047", "10000032"],
        nameByLang: {
            es: "Wriothesley Melt",
            en: "Wriothesley Melt"
        },
        noteByLang: {
            es: "Escala muy bien en daño sostenido con melts frecuentes y buffs de equipo.",
            en: "Scales very well in sustained damage with frequent Melts and team buffs."
        },
        roleLabels: {
            es: ["Main DPS", "Cryo support", "Anemo support", "ATK buffer"],
            en: ["Main DPS", "Cryo support", "Anemo support", "ATK buffer"]
        }
    },
    {
        id: "team-ganyu-melt",
        archetype: "melt",
        memberIds: ["10000037", "10000032", "10000030", "10000047"],
        nameByLang: {
            es: "Ganyu Melt",
            en: "Ganyu Melt"
        },
        noteByLang: {
            es: "Version clasica de alto daño por carga, ideal para contenido de pocos objetivos.",
            en: "Classic high-damage charged-shot setup, ideal for low-target content."
        },
        roleLabels: {
            es: ["Main DPS", "Pyro aura", "Shield", "Control"],
            en: ["Main DPS", "Pyro aura", "Shield", "Control"]
        }
    },
    {
        id: "team-hyperbloom-classic",
        archetype: "hyperbloom",
        memberIds: ["10000060", "10000073", "10000052", "10000065"],
        nameByLang: {
            es: "Hyperbloom Clasico",
            en: "Classic Hyperbloom"
        },
        noteByLang: {
            es: "Equipo comodo y muy eficiente para Abismo con alta consistencia.",
            en: "Comfortable and efficient Abyss team with very high consistency."
        },
        roleLabels: {
            es: ["Aplicador Hydro", "Dendro", "Trigger", "Soporte"],
            en: ["Hydro applier", "Dendro", "Trigger", "Support"]
        }
    },
    {
        id: "team-cyno-quickbloom",
        archetype: "quicken",
        memberIds: ["10000071", "10000060", "10000073", "10000089"],
        nameByLang: {
            es: "Cyno Quickbloom",
            en: "Cyno Quickbloom"
        },
        noteByLang: {
            es: "Muy fuerte en rotaciones largas aprovechando Quicken y semillas Dendro.",
            en: "Excellent in long rotations by combining Quicken and Dendro core pressure."
        },
        roleLabels: {
            es: ["Driver", "Hydro", "Dendro", "Buffer"],
            en: ["Driver", "Hydro", "Dendro", "Buffer"]
        }
    },
    {
        id: "team-quicken-aggravate",
        archetype: "quicken",
        memberIds: ["10000098", "10000073", "10000047", "10000065"],
        nameByLang: {
            es: "Quicken Aggravate",
            en: "Quicken Aggravate"
        },
        noteByLang: {
            es: "Composicion flexible para single-target con mucho daño reactivo.",
            en: "Flexible single-target focused composition with strong reaction damage."
        },
        roleLabels: {
            es: ["Main DPS", "Dendro", "Buffer", "Sustain"],
            en: ["Main DPS", "Dendro", "Buffer", "Sustain"]
        }
    },
    {
        id: "team-keqing-aggravate",
        archetype: "quicken",
        memberIds: ["10000042", "10000073", "10000047", "10000082"],
        nameByLang: {
            es: "Keqing Aggravate",
            en: "Keqing Aggravate"
        },
        noteByLang: {
            es: "Composicion muy fluida para limpiar oleadas con excelente movilidad.",
            en: "Very fluid composition for wave clear with excellent mobility."
        },
        roleLabels: {
            es: ["Main DPS", "Dendro", "Control", "Sustain"],
            en: ["Main DPS", "Dendro", "Control", "Sustain"]
        }
    },
    {
        id: "team-taser-kokomi",
        archetype: "electrocharged",
        memberIds: ["10000054", "10000058", "10000047", "10000065"],
        nameByLang: {
            es: "Taser Kokomi",
            en: "Kokomi Taser"
        },
        noteByLang: {
            es: "Equipo seguro y consistente con muy buen daño en multi-objetivo.",
            en: "Safe and consistent team with very strong multi-target output."
        },
        roleLabels: {
            es: ["Driver", "Sub DPS", "Control", "Sub DPS"],
            en: ["Driver", "Sub DPS", "Control", "Sub DPS"]
        }
    },
    {
        id: "team-clorinde-electrocharged",
        archetype: "electrocharged",
        memberIds: ["10000098", "10000089", "10000047", "10000082"],
        nameByLang: {
            es: "Clorinde Electro-Charged",
            en: "Clorinde Electro-Charged"
        },
        noteByLang: {
            es: "Comp fuerte de daño continuo, especialmente eficaz en contenido mixto.",
            en: "Strong sustained damage comp, especially effective in mixed-content chambers."
        },
        roleLabels: {
            es: ["Main DPS", "Buffer", "Control", "Sustain"],
            en: ["Main DPS", "Buffer", "Control", "Sustain"]
        }
    },
    {
        id: "team-xiao-plunge",
        archetype: "plunge",
        memberIds: ["10000026", "10000089", "10000047", "10000003"],
        nameByLang: {
            es: "Xiao Plunge",
            en: "Xiao Plunge"
        },
        noteByLang: {
            es: "Version moderna del hipercarry de Xiao con buffs potentes y alta estabilidad.",
            en: "Modern Xiao hypercarry setup with strong buffs and high stability."
        },
        roleLabels: {
            es: ["Main DPS", "Buffer", "Control", "Healer"],
            en: ["Main DPS", "Buffer", "Control", "Healer"]
        }
    },
    {
        id: "team-wanderer-hypercarry",
        archetype: "plunge",
        memberIds: ["10000075", "10000076", "10000047", "10000032"],
        nameByLang: {
            es: "Wanderer Hypercarry",
            en: "Wanderer Hypercarry"
        },
        noteByLang: {
            es: "Carry anemo de rotaciones rapidas con alta flexibilidad de posicionamiento.",
            en: "Fast-rotation Anemo carry with great positioning flexibility."
        },
        roleLabels: {
            es: ["Main DPS", "Anemo support", "Control", "ATK buffer"],
            en: ["Main DPS", "Anemo support", "Control", "ATK buffer"]
        }
    },
    {
        id: "team-mono-geo",
        archetype: "mono",
        memberIds: ["10000057", "10000055", "10000064", "10000030"],
        nameByLang: {
            es: "Mono Geo",
            en: "Mono Geo"
        },
        noteByLang: {
            es: "Arquetipo estable de alta supervivencia y gran daño continuo.",
            en: "Stable archetype with high survivability and strong sustained damage."
        },
        roleLabels: {
            es: ["Main DPS", "Soporte", "Buffer", "Escudo"],
            en: ["Main DPS", "Support", "Buffer", "Shield"]
        }
    },
    {
        id: "team-navia-geo-flex",
        archetype: "mono",
        memberIds: ["10000091", "10000089", "10000047", "10000082"],
        nameByLang: {
            es: "Navia Geo Flex",
            en: "Navia Geo Flex"
        },
        noteByLang: {
            es: "Alternativa meta para Navia con buffs universales y rotacion muy comoda.",
            en: "Meta Navia alternative with universal buffs and comfortable rotations."
        },
        roleLabels: {
            es: ["Main DPS", "Buffer", "Control", "Sustain"],
            en: ["Main DPS", "Buffer", "Control", "Sustain"]
        }
    }
];

const archetypeLabels: Record<TeamArchetype, string> = {
    freeze: "Freeze",
    vape: "Vape",
    melt: "Melt",
    hyperbloom: "Hyperbloom",
    quicken: "Quicken",
    electrocharged: "Electro-Charged",
    mono: "Mono",
    national: "National",
    plunge: "Plunge"
};

const getArchetypeLabel = (archetype: TeamArchetype, _lang: Lang): string => archetypeLabels[archetype];

export const getTeams = async (lang: Lang): Promise<Team[]> => {
    const characters = await getCharacters(lang);
    const characterById = new Map(characters.map((character) => [character.id, character]));

    const teams: Team[] = [];

    for (const template of teamTemplates) {
        const members = template.memberIds
            .map((memberId, index) => {
                const character = characterById.get(memberId);
                if (!character) {
                    return null;
                }

                return {
                    character,
                    role: template.roleLabels[lang][index] ?? ""
                };
            })
            .filter((member): member is TeamMember => member !== null);

        if (members.length < 3) {
            continue;
        }

        teams.push({
            id: template.id,
            name: template.nameByLang[lang],
            archetype: template.archetype,
            note: template.noteByLang[lang],
            members
        });
    }

    return teams;
};

export const getTeamArchetypeLabel = getArchetypeLabel;
