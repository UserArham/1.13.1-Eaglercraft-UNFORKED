/**
 * ====================================================================
 * CUSTOM EAGLERCRAFT ENGINE EXPANSION CLIENT (1.13.1 MOB ENABLED)
 * Developed by: UserArham (©2018-2026)
 * Architecture: Forces 1.13.1 Spawning by Re-skinning via 1.12 Assets
 * ====================================================================
 */

const ClientEngine = {
    version: "Eagler-Arham-1.13.1-FullMobs",
    assetMode: "Legacy_Mapping",
    credits: "©2018-2026 by UserArham",

    // 1. DATA TRANSLATION REGISTRY
    registries: {
        blocks: {
            "minecraft:air":           { id: 0,  data: 0 },
            "minecraft:stone":         { id: 1,  data: 0 },
            "minecraft:water":         { id: 9,  data: 0 },
            "minecraft:blue_ice":      { id: 240, data: 0 },
            "minecraft:sea_pickle":    { id: 241, data: 0 },
            "minecraft:conduit":       { id: 242, data: 0 }
        },
        items: {
            "minecraft:trident":          { id: 455, data: 0, reach: 3.0, maxStack: 1 },
            "minecraft:wooden_spear":     { id: 460, data: 0, reach: 4.5, dmg: 4, maxStack: 1 },
            "minecraft:stone_spear":      { id: 461, data: 0, reach: 4.5, dmg: 5, maxStack: 1 },
            "minecraft:iron_spear":       { id: 462, data: 0, reach: 4.5, dmg: 6, maxStack: 1 },
            "minecraft:diamond_spear":    { id: 463, data: 0, reach: 4.5, dmg: 7, maxStack: 1 }
        }
    },

    // 2. DYNAMIC 1.13.1 MOB TEXTURE MAPPER (Tricks 1.13.1 mobs into using 1.12 assets)
    resolveMobTexture(entityStringId) {
        const mobTextureMap = {
            "minecraft:drowned": "assets/minecraft/textures/entity/zombie/zombie.png",    // Re-skins Drowned as classic Zombies
            "minecraft:phantom": "assets/minecraft/textures/entity/bat.png",              // Re-skins Phantoms as Bats
            "minecraft:dolphin": "assets/minecraft/textures/entity/squid.png",            // Re-skins Dolphins as Squids
            "minecraft:turtle":  "assets/minecraft/textures/entity/slime/slime.png"       // Re-skins Turtles as Slimes
        };

        if (mobTextureMap[entityStringId]) {
            console.log(`[Mob Engine] Successfully re-skinned 1.13.1 ${entityStringId} using 1.12 asset fallback.`);
            return mobTextureMap[entityStringId];
        }
        
        // Default fallback for standard mobs
        return `assets/minecraft/textures/entity/${entityStringId.replace("minecraft:", "")}.png`;
    },

    // 3. COMBAT LAYER FOR 1.21.11 SPEARS
    combat: {
        calculateReach(heldItemStringId) {
            const itemMatch = ClientEngine.registries.items[heldItemStringId];
            return itemMatch ? itemMatch.reach : 3.0;
        },
        processAttack(player, heldItemStringId) {
            const item = ClientEngine.registries.items[heldItemStringId];
            if (!item) return 1.0;
            let baseDamage = item.dmg || 1;
            if (heldItemStringId.includes("spear")) {
                let speed = Math.sqrt(player.motionX * player.motionX + player.motionZ * player.motionZ);
                if (speed > 0.15) baseDamage *= 1.5; // Damage scales with movement speed
            }
            return baseDamage;
        }
    },

    // 4. SHARK SPAWNING RENDER SYSTEM
    spawnSharkInstance(spawnX, spawnY, spawnZ) {
        return {
            uid: "shark_" + Math.random().toString(36).substr(2, 9),
            type: "hostile_aquatic",
            texture: "assets/minecraft/textures/entity/guardian.png", // Re-skins Shark as a Guardian
            x: spawnX, y: spawnY, z: spawnZ,
            health: 30.0,
            tickAI(player) {
                let dx = player.x - this.x;
                let dz = player.z - this.z;
                let distance = Math.sqrt(dx*dx + dz*dz);
                if (distance < 16.0 && player.isInWater) {
                    this.x += (dx / distance) * 0.05;
                    this.z += (dz / distance) * 0.04;
                    if (distance < 1.8) player.triggerDamage(4.0, "shark_bite");
                }
            }
        };
    }
};

window.ClientEngine = ClientEngine;
console.log(`[System] UserArham's Custom ${ClientEngine.version} Core Bootstrapped Successfully.`);
