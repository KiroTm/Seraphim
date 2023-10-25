export type recipe = { itemName: string; amount: number }[]

export type items = {
    name: string
    description: string
    emoji?: string
    price?: number 
    info: {
        usage: string,
        usable: boolean,
        type: 'Collectable' | 'PowerUps' | 'Magical Item' | 'Tool' | 'Utility' | 'Junk' | 'Animals' | 'Other'
        craft?: { usedInCrafting: boolean, canbeCrafted: boolean, recipe?: recipe }
        boosts?: { type: 'levelUp' | 'coinsBoost' | 'xpBoost', amount: number, time?: number}
    },
    weight: number
}

const AllItems: Record<string, items> = {
    grimoire: {
        name: "Ghoulish Grimoire",
        description: "Ohh, look at this fancy magical book! I wonder what it does.",
        emoji: "<a:magical_book:1162824200243912754>",
        info: {
            type: 'Magical Item',
            usable: true,
            usage: "Use Ghoulish Grimoire to redeem 1 item from the magical shop.",
        },
        weight: 1
    },
    ticket: {
        name: "Lottery Ticket!",
        description: "Nah bro I ain't selling this shit, I'm broke and I need money",
        emoji: "<:Ticket:1163384283755466804>",
        info: {
            type: 'Collectable',
            usable: true,
            usage: "Use ticket to participate in the nitro hunt",
            craft: { canbeCrafted: true, usedInCrafting: false, recipe: [{ itemName: 'ticket_fragments', amount: 5 }] as recipe},
        },
        weight: 2
    },
    ticket_fragments: {
        name: "Ticket Fragments",
        description: "MARK! MARK! I found the last lottery fragment! We'll be rich now",
        emoji: "<:Ticket_Fragment:1163386943875317821>",
        info: {
            type: 'Collectable',
            usable: false,
            usage: "Craft 5 fragments to make a lottery ticket",
            craft: { canbeCrafted: false, usedInCrafting: true }
        },
        weight: 5
    },
    hat: {
        name: "Halloween Hat",
        description: "Another witch be-hatted, you better use this before the witch steals it off you.",
        emoji: "<:Halloween_Hat:1163382021943480360>",
        info: {
            type: 'PowerUps',
            usable: true,
            usage: "Use Halloween Hat to gain 1 level worth of xp!",
            boosts: { type: 'levelUp', amount: 1 }
        },
        weight: 5
    },
    candy_cane: {
        name: "Halloween Candy Cane",
        description: "NO GRANDA, THIS ARE NOT THOSE CANES! OH C'MON NOW DON'T FAKE IT",
        emoji: "<a:Candy_Cane:1163381494094508035>",
        info: {
            type: 'PowerUps',
            usable: true,
            usage: "Use Halloween Candy Cane to gain 30% coin bonus for 1 minute!",
            boosts: { type: 'coinsBoost', amount: 30, time: 600000 }
        },
        weight: 10
    },
    coins: {
        name: "Shop Coins",
        description: "Nice one Jerry! The Dollar coins machine works perfectly now, we managed to fool ISA for the fifth time now.",
        emoji: '<:coin:1164253043991253116>',
        info: {
            type: 'Utility',
            usable: true,
            usage: "Currency for the shop!"
        },
        weight: 200
    },
    potion_weak: {
        name: "Weak Vampiric Vitality Vile",
        description: "Yo, I ain't even lyin', she guzzled down that whole bottle of that weird-lookin' liquid and, like, passed out cold. ",
        emoji: '<:Vampiric_Vitality_Vile_weak:1163161116277477526>',
        info: {
            usable: true,
            usage: "Use this potion to give 30% xp boost for 1 hour. Standard xp cooldowns apply even after consuming this bottle. There's also a chance you die to this drink",
            boosts: { type: 'xpBoost', amount: 30, time: 60 * 60 * 1000 },
            type: 'PowerUps'
        },
        weight: 12
    },
    potion_mild: {
        name: "Mild Vampiric Vitality Vile",
        description: "And then, her neighbors come knockin' on her door the next day, see her laid out on the floor. They hit up her sister, and 10 minutes later. ",
        emoji: "<:Vampiric_Vitality_Vile_mild:1163161198016069702>",
        info: {
            usable: true,
            usage: "Use this potion to give 40% xp boost for 1 hour. Standard xp cooldowns apply even after consuming this bottle. There's also a chance you die to this drink x 2",
            boosts: { type: 'xpBoost', amount: 30, time: 60 * 60 * 1000 },
            type: 'PowerUps'
        },
        weight: 9
    },
    potion_strong: {
        name: "Strong Vampiric Vitality Vile",
        description: "She rolls up, and what she didn't see comin' was it was ALL A BIG JOKE! It was her birthday, and they decided to pull off a prank on her, tellin' her she'd kicked the bucket. ",
        emoji: "<:Vampiric_Vitality_Vile_strong:1163161248272240731>",
        info: {
            usable: true,
            usage: "Use this potion to give 50% xp boost for 1 hour. Standard xp cooldowns apply even after consuming this bottle. There's also a chance you die to this drink x 3",
            boosts: { type: 'xpBoost', amount: 30, time: 60 * 60 * 1000 },
            type: 'PowerUps'
        },
        weight: 8
    },
    casette: {
        name: "Yuuki's Cassette",
        description: "Man idk what happened last night but that stuff was good, did you record it...?",
        emoji: "<:Cassette:1163895625583169579>",
        info: {
            type: 'Collectable',
            usable: false,
            usage: "Collect!"
        },
        weight: 1
    },
    // All the tools:
    hoe: {
        name: "Hoe",
        description: "I ain't never missing with these hoes again!",
        emoji: "<:hoe:1164261165833138216>",
        price: 20000,
        info: {
            type: 'Tool',
            usable: false,
            usage: 'Having a hoe in your inventory would allow you to farm',
            craft: {canbeCrafted: true, usedInCrafting: false, recipe: [{itemName: 'metal', amount: 10}, {itemName: 'stick', amount: 2}, {itemName: 'stone', amount: 5}] as recipe}
        },
        weight: 10
    },
    shovel: {
        name: "Shovel",
        description: "Lanny you are not being smart, bringing a shovel to the beach wont help you find a tresure here!",
        emoji: "<:shovel:1164260707634794556>",
        price: 15000,
        info: {
            type: 'Tool',
            usable: false,
            usage: 'Having a shovel in your inventory would allow you to dig through dirt',
            craft: { canbeCrafted: true, usedInCrafting: false, recipe: [{itemName: 'metal', amount: 10}, {itemName: 'stick', amount: 1}, {itemName: 'stone', amount: 3}] as recipe }
        },
        weight: 60
    },
    fishing_rod: {
        name: "Fishing Rod",
        price: 30000,
        description: "I hope I get some bitches tonight.",
        emoji: "<:fishing_rod:1164260873297211492>",
        info: {
            type: 'Tool',
            usable: false,
            usage: 'Having a fishing rod in your inventory would allow you to fish',
            craft: { canbeCrafted: true, usedInCrafting: false, recipe: [{itemName: 'metal', amount: 10}, {itemName: 'stick', amount: 2}, {itemName: 'string', amount: 5}] as recipe }
        },
        weight: 60
    },
    rifle: {
        name: "Hunting Rifle",
        price: 40000,
        description: "GET HERE SHAWN, ONE STEP CLOSER AND YOU DIE!",
        emoji: "<:rifle:1165170154167091280>",
        info: {
            type: 'Tool',
            usable: false,
            usage: 'Having a rifle in your inventory would allow you to hunt',
            craft: { canbeCrafted: true, usedInCrafting: false, recipe: [{itemName: 'metal', amount: 10}, {itemName: 'stick', amount: 2}, {itemName: 'gunpowder', amount: 50}] as recipe }
        },
        weight: 60
    },
    // All the materials:
    metal: {
        name: "Metal Scrap",
        description: "Like plug is to socket, metal is to junkyard",
        emoji: "<:scrap:1164264273187455047>",
        info: {
            type: 'Junk',
            usable: false,
            usage: "Most used material throughout crafting, magical or common, makes no exception! Truly the hero"
        },
        weight: 50
    },
    string: {
        name: "Metal String",
        description: "What do you mean the guillotine was stolen? WHAT?! Gary stole it? He's a maniac he'll use it to behead people.",
        emoji: "<:string:1164266391663296534>",
        info: {
            type: 'Junk',
            usable: false,
            usage: "Used in crafting items that possess some potential energy."
        },
        weight: 50
    },
    stick: {
        name: "Stick",
        description: "MOM WHERE ARE MY STICKS, what do you mean you threw them away? Bitch Imma kill you!",
        emoji: "<:stick:1164268209852125275>",
        info: {
            type: 'Junk',
            usable: false,
            usage: "Another commonly used material in crafting tools like shovel, hoe, etc."
        },
        weight: 50
    },
    stone: {
        name: "Stone",
        description: "As a grown man, I love collecting little rocks!",
        emoji: "<:stone:1164268426076889120>",
        info: {
            type: 'Junk',
            usable: false,
            usage: "Commonly used material in crafting tools like shovel, hoe, etc."
        },
        weight: 50
    }
} as const


type animals = {
    name: string,
    description: string,
    emoji?: string
    type: 'Common' | 'Uncommon' | 'Rare' | 'Mythic' | 'Ultra Rare' | 'Godlike'
    weight: number
    sell_price: number
}
const AllAnimals: Record<string, animals> = {
    Pig: {
        name: "pig",
        description: "Oink Oink~~",
        emoji: "<:piggy:1165210242813022230>",
        type: 'Common',
        weight: 100,
        sell_price: 2000
    },
    Sheep: {
        name: "sheep",
        description: "bɑɑɑɑɑɑɑ!",
        emoji: "<:sheep:1165259262675656714> ",
        type: 'Common',
        weight: 50,
        sell_price: 3000
    },
    Boar: {
        name: "boar",
        description: "Never heard a boar scream....",
        emoji: "<:boar:1165259809914884096> ",
        type: 'Uncommon',
        weight: 40,
        sell_price: 4000
    },
    Eagle: {
        name: "eagle",
        description: "'MURICA 🦅🦅🦅🦅",
        emoji: "<a:eagle:1165261157645430804>",
        type: 'Uncommon',
        weight: 30,
        sell_price: 4600
    },
    Tiger: {
        name: "tiger",
        description: "SIMBAAAAA!!!!1AAHHHH",
        emoji: "",
        type: 'Rare',
        weight: 15,
        sell_price: 4800
    },
    Leopard: {
        name: "leopard",
        description: "[Description..](https://africafreak.com/what-sound-does-a-leopard-make)",
        emoji: "<:leopard:1165263075193135195>",
        type: 'Rare',
        weight: 20,
        sell_price: 5000
    },
    Lynx: {
        name: "lynx",
        description: "ew furry",
        emoji: "<:lynx:1165264087551324250> ",
        type: 'Rare',
        weight: 10,
        sell_price: 10000
    },
    Yuuki: {
        name: "Yuuki",
        description: "Furry",
        type: 'Mythic',
        weight: 5,
        sell_price: 1
    },
    Dodo: {
        name: "dodo",
        description: "The dodo is an extinct flightless bird that was endemic to the island of Mauritius",
        emoji: "<:dodo:1165264720870244372>",
        type: 'Ultra Rare',
        weight: 3,
        sell_price: 50000
    },

}

export {AllItems, AllAnimals}