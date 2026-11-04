const houses = [
    {
        name: "Gryffindor",
        imageUrl:
            "https://www.harrypotter.com/_next/static/media/gryffindor.0hdpfojimsg0p.svg",
    },
    {
        name: "Hufflepuff",
        imageUrl:
            "https://www.harrypotter.com/_next/static/media/hufflepuff.2-n1wzmzinnm1.svg",
    },
    {
        name: "Ravenclaw",
        imageUrl:
            "https://www.harrypotter.com/_next/static/media/ravenclaw.0zxeg5ydz7zdy.svg",
    },
    {
        name: "Slytherin",
        imageUrl:
            "https://www.harrypotter.com/_next/static/media/slytherin.3v19xr-9yvat_.svg",
    },
];

const API_URL = "http://localhost:8081/api/v1/houses";

async function seedHouses() {
    for (const house of houses) {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(house),
            });

            if (!response.ok) {
                const error = await response.text();
                console.error(`Failed to seed ${house.name}:`, response.status, error);
                continue;
            }

            console.log(`Seeded ${house.name}`);
        } catch (error) {
            console.error(`Error seeding ${house.name}:`, error.message);
        }
    }
}

seedHouses();