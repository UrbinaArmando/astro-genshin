export interface Character {
    id: string;
    name: string;
    rarity: 4 | 5;
    element: 'Pyro' | 'Hydro' | 'Anemo' | 'Electro' | 'Dendro' | 'Cryo' | 'Geo';
    weapon: 'Sword' | 'Claymore' | 'Polearm' | 'Bow' | 'Catalyst';
    imageUrl: string;
}

export const characters: Character[] = [
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
