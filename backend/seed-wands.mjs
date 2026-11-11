const API_URL = "http://localhost:8081/api/v1/wands";
const PROFILE_UID = process.env.PROFILE_UID;

if (!PROFILE_UID) {
    throw new Error("Set PROFILE_UID to a public Harry Potter profile UID.");
}

const profileUrl = `https://www.harrypotter.com/profile/${PROFILE_UID}`;

async function getWandCatalog() {
    const response = await fetch(profileUrl);

    if (!response.ok) {
        throw new Error(`Failed to fetch profile: HTTP ${response.status}`);
    }

    const html = await response.text();
    const match = html.match(
        /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s
    );

    if (!match) {
        throw new Error("Could not find __NEXT_DATA__ in profile HTML.");
    }

    const data = JSON.parse(match[1]);
    return data.props.pageProps.rootContent.wandData;
}

function generateWands(catalog) {
    const { images, woodList, lengthList, flexibilityList, coreList } = catalog;
    const wandsByKey = new Map();

    for (const [wood, woodInfo] of Object.entries(woodList)) {
        for (const [length, lengthInfo] of Object.entries(lengthList)) {
            for (const [flexibility, flexibilityInfo] of Object.entries(
                flexibilityList
            )) {
                const wandKey =
                    `wand-${woodInfo.type}-${lengthInfo.type}-` +
                    `${flexibilityInfo.type}_handle`;

                // Different attributes can share the same visual key.
                if (wandsByKey.has(wandKey)) continue;

                const image = images[wandKey];
                if (!image) continue;

                wandsByKey.set(wandKey, {
                    wandKey,
                    length: lengthInfo.title.replace(/"/g, ""),
                    wood: woodInfo.title,
                    core: coreList.Dragon.title,
                    flexibility: flexibilityInfo.title,
                    imageUrl: image.displayImage,
                });
            }
        }
    }

    return [...wandsByKey.values()];
}

async function seedWands() {
    const catalog = await getWandCatalog();
    const wands = generateWands(catalog);

    console.log(`Generated ${wands.length} unique wand records.`);

    if (wands.length !== 90) {
        throw new Error(`Expected 90 wands, generated ${wands.length}.`);
    }

    let created = 0;

    for (const wand of wands) {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(wand),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed: ${wand.wandKey} — ${response.status} ${errorText}`);
            continue;
        }

        created++;
        console.log(`[${created}/${wands.length}] Added ${wand.wandKey}`);
    }

    console.log(`Finished. Successfully POSTed ${created}/${wands.length} wands.`);
}

seedWands().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});