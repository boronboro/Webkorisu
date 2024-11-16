const CACHE_NAME = 'webkorisu-v0';

/**
 * @type ExtendableEvent
 */
self.addEventListener('install', (event) => {
    console.log(`Install cache ${CACHE_NAME}`);
    let precache = async () => {
        let cache = await caches.open(CACHE_NAME);
        return cache.addAll([
            "/",
            "entities/acorn.js",
            "entities/announcement.js",
            "entities/dialog.js",
            "entities/disappearing_platform.js",
            "entities/fadeout.js",
            "entities/huerotate.js",
            "entities/key.js",
            "entities/lever.js",
            "entities/moving_platform.js",
            "entities/squirrel.js",
            "entities/vulnerable.js",
            "favicon.png",
            "favicon512.png",
            "index.css",
            "index.html",
            "manifest.json",
            "maps/castle",
            "maps/castle/castle.tsx",
            "maps/castle/castle1.tmx",
            "maps/castle/castle2.tmx",
            "maps/castle/castle3.tmx",
            "maps/castle/castle4.tmx",
            "maps/factory/factory.tsx",
            "maps/factory/factory1.tmx",
            "maps/factory/factory2.tmx",
            "maps/factory/factory3.tmx",
            "maps/factory/factory4.tmx",
            "maps/forest/forest.tsx",
            "maps/forest/forest1.tmx",
            "maps/forest/forest2.tmx",
            "maps/forest/forest3.tmx",
            "playnewton.js",
            "scenes/castle_level.js",
            "scenes/factory_level.js",
            "scenes/forest_level.js",
            "scenes/scene.js",
            "scenes/title.js",
            "scenes/tutorial_level.js",
            "serviceWorker.js",
            "sounds/collect-acorn.wav",
            "sounds/collect-key.wav",
            "sounds/hurt-squirrel.wav",
            "sounds/jump-squirrel.wav",
            "sounds/menu-select.wav",
            "sounds/pause_resume.wav",
            "sounds/skip.wav",
            "sprites/squirrel.png",
            "sprites/title.png",
            "sprites/tutorial.png",
            "utils/keyboard_mappings.js",
            "utils/z_order.js",
            "webkorisu.js"
            ]);
    }
    event.waitUntil(precache());
});

/**
 * @type FetchEvent
 */
self.addEventListener('fetch', (event) => {
    let respond = async () => {
        let cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
            return cachedResponse;
        } else {
            return fetch(event.request);
        }
    }
    event.respondWith(respond());
});

self.addEventListener('activate', function (event) {
    let updateCache = async () => {
        let keys = await caches.keys();
        return Promise.all(keys.map((key) => {
            if (key !== CACHE_NAME) {
                console.log(`Delete cache ${key}`);
                return caches.delete(key);
            }
        }));
    }
    event.waitUntil(updateCache());
});
