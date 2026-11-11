//seed-patronusCharms.mjs

import fs from "node:fs/promises";

const API_URL = "http://localhost:8081/api/v1/patronusCharms";
const JSON_FILE = "./patronusCharms.json"; // Update your filename to match

async function seedPatronusCharms() {
    try {
        const rawData = await fs.readFile(JSON_FILE, "utf-8");
        const patronusCharms = JSON.parse(rawData);

        console.log(`Found ${patronusCharms.length} Patronus Charms.\n`);

        let successful = 0;
        let failed = 0;

        for (const patronus of patronusCharms) {
            try {
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(patronus),
                });

                if (!response.ok) {
                    const error = await response.text();
                    console.error(
                        `❌ ${patronus.name}: ${response.status} - ${error}`
                    );
                    failed++;
                    continue;
                }

                console.log(`✅ ${patronus.name}`);
                successful++;
            } catch (error) {
                console.error(`❌ ${patronus.name}: ${error.message}`);
                failed++;
            }
        }

        console.log("\n========== SEEDING SUMMARY ==========");
        console.log(`Total:      ${patronusCharms.length}`);
        console.log(`Successful: ${successful}`);
        console.log(`Failed:     ${failed}`);
        console.log("====================================");
    } catch (error) {
        console.error("Seeding failed:", error);
    }
}

seedPatronusCharms();