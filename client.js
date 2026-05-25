/**
 * ====================================================================
 * CUSTOM EAGLERCRAFT ENGINE EXPANSION CLIENT (DUAL ZIP STREAM SYSTEM)
 * Developed by: UserArham (©2018-2026)
 * Target Platform: TeaVM Web Browser Execution
 * Purpose: Direct runtime extraction using exact InventivetalentDev names
 * ====================================================================
 */

(function() {
    "use strict";

    console.log("[ClientEngine] Initializing InventivetalentDev dual ZIP stream injector...");

    const zipTextureCache = {};
    let zipsReadyCount = 0;

    // The precise flat file paths matching inside InventivetalentDev's zip structures
    const entityFileMapping = {
        "drowned": "zombie/drowned.png",
        "phantom": "phantom.png",
        "dolphin": "dolphin.png",
        "turtle":  "turtle.png"
    };

    window.addEventListener("load", function() {
        // Handles the exact full names with spaces from your files
        loadZipArchive("InventivetalentDev minecraft-assets 1.13.1 assets-minecraft_textures_entity.zip", "ENTITY");
        loadZipArchive("InventivetalentDev minecraft-assets 1.13.1 assets-realms.zip", "REALMS");
        
        setTimeout(injectRuntimePatches, 1500);
    });

    function loadZipArchive(fileName, type) {
        // Encodes the spaces safely for browser HTTP requests (e.g., changing spaces to %20)
        const encodedUrl = encodeURIComponent(fileName);
        console.log(`[ZIP Pipeline] Fetching ${type} bundle from: ${fileName}`);
        
        fetch(encodedUrl)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP Error Status: ${res.status} for file ${fileName}`);
                return res.arrayBuffer();
            })
            .then(buf => window.JSZip.loadAsync(buf))
            .then(async (zip) => {
                console.log(`[ZIP Pipeline] Successfully unpacked ${type} archive structure!`);
                
                if (type === "ENTITY") {
                    // Extract mob files using the flat format from the repository
                    for (const [key, pathInsideZip] of Object.entries(entityFileMapping)) {
                        const file = zip.file(pathInsideZip);
                        if (file) {
                            const base64 = await file.async("base64");
                            zipTextureCache[key] = `data:image/png;base64,${base64}`;
                            console.log(`[Cache Manager] Cached 1.13.1 Mob: ${key}.png`);
                        }
                    }
                } else if (type === "REALMS") {
                    // Extract everything inside the realms bundle automatically into RAM
                    zip.forEach(async (relativePath, file) => {
                        if (!file.dir && relativePath.endsWith(".png")) {
                            const base64 = await file.async("base64");
                            // Cache via the file name to hot-swap background assets
                            const cleanName = relativePath.split('/').pop();
                            zipTextureCache[cleanName] = `data:image/png;base64,${base64}`;
                        }
                    });
                }

                zipsReadyCount++;
            })
            .catch(err => console.error(`[ZIP Pipeline] Failed loading ${fileName}: `, err));
    }

    function injectRuntimePatches() {
        try {
            const imagePrototype = window.Image.prototype;
            const originalSetSrc = Object.getOwnPropertyDescriptor(imagePrototype, "src").set;

            Object.defineProperty(imagePrototype, "src", {
                set: function(url) {
                    let processedUrl = url;

                    if (zipsReadyCount > 0) {
                        // 1. Hot-swap missing 1.13 mob textures with matching strings from the entity ZIP
                        for (const mobKey of Object.keys(entityFileMapping)) {
                            if (url.includes(`textures/entity/${mobKey}`)) {
                                if (zipTextureCache[mobKey]) {
                                    processedUrl = zipTextureCache[mobKey];
                                    originalSetSrc.call(this, processedUrl);
                                    return;
                                }
                            }
                        }

                        // 2. Intercept and load direct Realms UI textures requested by the networking layer
                        const requestedFileName = url.split('/').pop();
                        if (zipTextureCache[requestedFileName]) {
                            processedUrl = zipTextureCache[requestedFileName];
                            originalSetSrc.call(this, processedUrl);
                            return;
                        }
                    }

                    // Standardize 1.13 singular paths to 1.12 plural layouts for base game assets
                    if (processedUrl.includes("/textures/block/")) {
                        processedUrl = processedUrl.replace("/textures/block/", "/textures/blocks/");
                    } else if (processedUrl.includes("/textures/item/")) {
                        processedUrl = processedUrl.replace("/textures/item/", "/textures/items/");
                    }

                    originalSetSrc.call(this, processedUrl);
                },
                configurable: true
            });

            console.log("[ClientEngine] Active memory pipeline safely locked to both archives.");
        } catch (error) {
            console.error("[ClientEngine] Setup critical failure: ", error);
        }
    }

    window.ClientEngine = {
        version: "Eagler-Arham-1.13.1-DualZipStream-SpacesFix",
        credits: "©2018-2026 by UserArham",
        getLoadedCount: () => zipsReadyCount
    };
})();
