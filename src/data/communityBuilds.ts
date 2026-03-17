interface CommunityBuildEntryFrontmatter {
    element?: string;
    role?: string;
    weapons?: string;
    artifacts?: string;
    mainStats?: string;
    subStats?: string;
    talentPriority?: string;
    abilityTips?: string;
    updated?: string;
}

interface CommunityBuildFrontmatter {
    character?: string;
    slug?: string;
    source?: string;
    entries?: CommunityBuildEntryFrontmatter[];
}

export interface CommunityBuildEntry {
    element: string;
    role: string;
    weapons: string[];
    artifacts: string[];
    mainStats: string[];
    subStats: string[];
    talentPriority: string[];
    abilityTips: string[];
    updated: string;
}

export interface CommunityCharacterBuild {
    character: string;
    slug: string;
    source: string;
    entries: CommunityBuildEntry[];
}

const normalize = (value: string): string =>
    value
        .toLowerCase()
        .normalize("NFD")
        .replaceAll(/[\u0300-\u036f]/g, "")
        .replaceAll(/[^a-z0-9]+/g, "-")
        .replaceAll(/^-+|-+$/g, "");

const splitLines = (value?: string): string[] =>
    (value ?? "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

const normalizeRole = (value?: string): string => splitLines(value)[0] ?? "Build";

const modules = import.meta.glob("../content/community-builds/*.md", { eager: true });

const builds: CommunityCharacterBuild[] = Object.values(modules)
    .map((moduleEntry) => {
        const frontmatter = (moduleEntry as { frontmatter?: CommunityBuildFrontmatter }).frontmatter;
        if (!frontmatter?.character || !frontmatter.slug || !frontmatter.entries?.length) {
            return null;
        }

        return {
            character: frontmatter.character,
            slug: frontmatter.slug,
            source: frontmatter.source ?? "",
            entries: frontmatter.entries.map((entry) => ({
                element: entry.element ?? "",
                role: normalizeRole(entry.role),
                weapons: splitLines(entry.weapons),
                artifacts: splitLines(entry.artifacts),
                mainStats: splitLines(entry.mainStats),
                subStats: splitLines(entry.subStats),
                talentPriority: splitLines(entry.talentPriority),
                abilityTips: splitLines(entry.abilityTips),
                updated: entry.updated ?? ""
            }))
        } satisfies CommunityCharacterBuild;
    })
    .filter((entry): entry is CommunityCharacterBuild => entry !== null);

const buildBySlug = new Map(builds.map((build) => [build.slug, build]));

export const getCommunityBuildByCharacterName = (characterName: string): CommunityCharacterBuild | null =>
    buildBySlug.get(normalize(characterName)) ?? null;
