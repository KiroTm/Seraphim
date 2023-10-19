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
        craft?: { usedInCrafting: boolean, canbeCrafted: boolean, recipe?: recipe    }
        boosts?: { type: 'levelUp' | 'coinsBoost' | 'xpBoost', amount: number, time?: number}
    },
}

const AllItems: Record<string, items> = {
    ticket: {
        name: "Lottery Ticket!",
        description: "Nah bro I ain't selling this shit, I'm broke and I need money",
        emoji: "<:Ticket:1163384283755466804>",
        info: {
            type: 'Collectable',
            usable: true,
            usage: "Use ticket to participate in the nitro hunt",
            craft: { canbeCrafted: true, usedInCrafting: false, recipe: [{ itemName: 'ticket_fragments', amount: 5 }] as recipe},
        }
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
        }
    },
    grimoire: {
        name: "Ghoulish Grimoire",
        description: "Ohh, look at this fancy magical book! I wonder what it does.",
        emoji: "<a:magical_book:1162824200243912754>",
        info: {
            type: 'Magical Item',
            usable: true,
            usage: "Use Ghoulish Grimoire to redeem 1 item from the magical shop.",
        }
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
        }
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
        }
    },
    coins: {
        name: "Shop Coins",
        description: "Nice one Jerry! The Dollar coins machine works perfectly now, we managed to fool ISA for the fifth time now.",
        emoji: '<:coin:1164253043991253116>',
        info: {
            type: 'Utility',
            usable: true,
            usage: "Currency for the shop!"
        }
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
        }
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
        }
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
        }
    },
    casette: {
        name: "Yuuki's Cassette",
        description: "Man idk what happened last night but that stuff was good, did you record it...?",
        emoji: "<:Cassette:1163895625583169579>",
        info: {
            type: 'Collectable',
            usable: false,
            usage: "Collect!"
        }
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
        }
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
        }
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
        }
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
        }
    },
    string: {
        name: "Metal String",
        description: "What do you mean the guillotine was stolen? WHAT?! Gary stole it? He's a maniac he'll use it to behead people.",
        emoji: "<:string:1164266391663296534>",
        info: {
            type: 'Junk',
            usable: false,
            usage: "Used in crafting items that possess some potential energy."
        }
    },
    stick: {
        name: "Stick",
        description: "MOM WHERE ARE MY STICKS, what do you mean you threw them away? Bitch Imma kill you!",
        emoji: "<:stick:1164268209852125275>",
        info: {
            type: 'Junk',
            usable: false,
            usage: "Another commonly used material in crafting tools like shovel, hoe, etc."
        }
    },
    stone: {
        name: "Stone",
        description: "As a grown man, I love collecting little rocks!",
        emoji: "<:stone:1164268426076889120>",
        info: {
            type: 'Junk',
            usable: false,
            usage: "Commonly used material in crafting tools like shovel, hoe, etc."
        }
    }
} as const

export default AllItems