// Simple script to reset cards via API
// Run this after starting the dev server

const API_BASE = 'http://localhost:3000';

const newCards = [
    {
        title: "Cyber Attack on National Infrastructure",
        description: "A sophisticated cyber attack has compromised the national power grid. Critical systems are failing, and millions are without electricity.",
        categoryName: "Technology Crisis",
        political: -15,
        economic: -20,
        infrastructure: -25,
        society: -10,
        environment: 0,
        timeLimit: 1,
        status: "Active",
        responseOptions: [
            { text: "Shut down all affected systems immediately", politicalEffect: 5, economicEffect: -15, infrastructureEffect: -10, societyEffect: -5, environmentEffect: 0, score: -25 },
            { text: "Deploy emergency backup systems while investigating", politicalEffect: 10, economicEffect: -5, infrastructureEffect: 15, societyEffect: 10, environmentEffect: 0, score: 30 },
            { text: "Request international cybersecurity assistance", politicalEffect: -5, economicEffect: 0, infrastructureEffect: 10, societyEffect: 5, environmentEffect: 0, score: 10 }
        ]
    },
    {
        title: "Pandemic Outbreak in Major Cities",
        description: "A highly contagious virus has emerged in three major cities. Hospitals are overwhelmed and public panic is spreading rapidly.",
        categoryName: "Health Crisis",
        political: -10,
        economic: -15,
        infrastructure: -5,
        society: -20,
        environment: 0,
        timeLimit: 1,
        status: "Active",
        responseOptions: [
            { text: "Implement immediate lockdown measures", politicalEffect: -10, economicEffect: -20, infrastructureEffect: 0, societyEffect: 15, environmentEffect: 5, score: -10 },
            { text: "Mass vaccination campaign with emergency protocols", politicalEffect: 15, economicEffect: -10, infrastructureEffect: 5, societyEffect: 20, environmentEffect: 0, score: 30 }
        ]
    },
    {
        title: "Economic Collapse Warning",
        description: "Major banks are on the verge of collapse. Stock markets have crashed 40% in one day. Citizens are rushing to withdraw savings.",
        categoryName: "Economic Crisis",
        political: -20,
        economic: -30,
        infrastructure: 0,
        society: -15,
        environment: 0,
        timeLimit: 1,
        status: "Active",
        responseOptions: [
            { text: "Emergency government bailout of banks", politicalEffect: -15, economicEffect: 20, infrastructureEffect: 0, societyEffect: -10, environmentEffect: 0, score: -5 },
            { text: "Implement strict capital controls and freeze withdrawals", politicalEffect: -20, economicEffect: 10, infrastructureEffect: 0, societyEffect: -15, environmentEffect: 0, score: -25 },
            { text: "Create national economic stimulus package", politicalEffect: 10, economicEffect: 15, infrastructureEffect: 5, societyEffect: 10, environmentEffect: 0, score: 40 }
        ]
    },
    {
        title: "Massive Earthquake Aftermath",
        description: "A 7.8 magnitude earthquake has devastated the capital city. Buildings have collapsed, infrastructure is destroyed, and thousands are trapped.",
        categoryName: "Natural Disaster",
        political: 0,
        economic: -15,
        infrastructure: -30,
        society: -20,
        environment: -10,
        timeLimit: 1,
        status: "Active",
        responseOptions: [
            { text: "Deploy all emergency services for search and rescue", politicalEffect: 15, economicEffect: -10, infrastructureEffect: 5, societyEffect: 20, environmentEffect: 0, score: 30 },
            { text: "Evacuate the city and establish temporary shelters", politicalEffect: 5, economicEffect: -15, infrastructureEffect: -5, societyEffect: 10, environmentEffect: -5, score: -10 }
        ]
    },
    {
        title: "Climate Refugee Crisis",
        description: "Rising sea levels have displaced 2 million people from coastal regions. They are seeking refuge in your nation, straining resources.",
        categoryName: "Environmental Crisis",
        political: -15,
        economic: -10,
        infrastructure: -10,
        society: -15,
        environment: -20,
        timeLimit: 1,
        status: "Active",
        responseOptions: [
            { text: "Open borders and provide humanitarian aid", politicalEffect: -10, economicEffect: -15, infrastructureEffect: -10, societyEffect: 20, environmentEffect: 10, score: -5 },
            { text: "Build sustainable refugee settlements with green technology", politicalEffect: 10, economicEffect: -5, infrastructureEffect: 15, societyEffect: 15, environmentEffect: 20, score: 55 },
            { text: "Close borders and redirect to other nations", politicalEffect: -20, economicEffect: 5, infrastructureEffect: 0, societyEffect: -25, environmentEffect: -10, score: -50 }
        ]
    },
    {
        title: "Political Coup Attempt",
        description: "Military generals have seized control of government buildings. They demand the president's resignation and threaten violence.",
        categoryName: "Political Crisis",
        political: -30,
        economic: -10,
        infrastructure: 0,
        society: -15,
        environment: 0,
        timeLimit: 1,
        status: "Active",
        responseOptions: [
            { text: "Negotiate peaceful transition with coup leaders", politicalEffect: -15, economicEffect: -5, infrastructureEffect: 0, societyEffect: 10, environmentEffect: 0, score: -10 },
            { text: "Deploy loyal forces to retake government buildings", politicalEffect: 15, economicEffect: -10, infrastructureEffect: -5, societyEffect: -10, environmentEffect: 0, score: -10 },
            { text: "Call for international mediation and peacekeepers", politicalEffect: 20, economicEffect: 0, infrastructureEffect: 0, societyEffect: 15, environmentEffect: 0, score: 35 }
        ]
    },
    {
        title: "Water Supply Contamination",
        description: "Industrial waste has contaminated the main water supply serving 5 million people. Immediate health risks are severe.",
        categoryName: "Environmental Crisis",
        political: -10,
        economic: -15,
        infrastructure: -15,
        society: -20,
        environment: -25,
        timeLimit: 1,
        status: "Active",
        responseOptions: [
            { text: "Distribute bottled water and shut down contaminated systems", politicalEffect: 10, economicEffect: -20, infrastructureEffect: -10, societyEffect: 15, environmentEffect: 5, score: 0 },
            { text: "Fast-track emergency water purification infrastructure", politicalEffect: 15, economicEffect: -10, infrastructureEffect: 20, societyEffect: 20, environmentEffect: 15, score: 60 }
        ]
    },
    {
        title: "Mass Unemployment Crisis",
        description: "Automation has eliminated 3 million jobs in 6 months. Protests are erupting, and social unrest is growing.",
        categoryName: "Social Unrest",
        political: -15,
        economic: -20,
        infrastructure: 0,
        society: -25,
        environment: 0,
        timeLimit: 1,
        status: "Active",
        responseOptions: [
            { text: "Implement universal basic income program", politicalEffect: 10, economicEffect: -15, infrastructureEffect: 0, societyEffect: 25, environmentEffect: 0, score: 20 },
            { text: "Launch massive job retraining and education initiative", politicalEffect: 15, economicEffect: 10, infrastructureEffect: 5, societyEffect: 20, environmentEffect: 0, score: 50 },
            { text: "Tax automation and redistribute to affected workers", politicalEffect: -10, economicEffect: 5, infrastructureEffect: 0, societyEffect: 15, environmentEffect: 0, score: 10 }
        ]
    },
    {
        title: "Nuclear Plant Meltdown Risk",
        description: "A nuclear power plant's cooling system has failed. Radiation leak is imminent. 500,000 people live within the danger zone.",
        categoryName: "Technology Crisis",
        political: -20,
        economic: -15,
        infrastructure: -20,
        society: -25,
        environment: -30,
        timeLimit: 1,
        status: "Active",
        responseOptions: [
            { text: "Immediate evacuation of all surrounding areas", politicalEffect: 10, economicEffect: -20, infrastructureEffect: -10, societyEffect: 15, environmentEffect: 10, score: 5 },
            { text: "Deploy emergency cooling and containment teams", politicalEffect: 15, economicEffect: -10, infrastructureEffect: 15, societyEffect: 10, environmentEffect: 20, score: 50 }
        ]
    },
    {
        title: "Food Supply Chain Collapse",
        description: "A combination of droughts, pests, and logistics failures has created severe food shortages. Prices have tripled in weeks.",
        categoryName: "Economic Crisis",
        political: -15,
        economic: -25,
        infrastructure: -10,
        society: -20,
        environment: -15,
        timeLimit: 1,
        status: "Active",
        responseOptions: [
            { text: "Implement food rationing and price controls", politicalEffect: -10, economicEffect: -5, infrastructureEffect: 0, societyEffect: 10, environmentEffect: 0, score: -5 },
            { text: "Emergency import agreements and strategic reserves release", politicalEffect: 10, economicEffect: 15, infrastructureEffect: 5, societyEffect: 20, environmentEffect: 0, score: 50 },
            { text: "Fast-track sustainable agriculture programs", politicalEffect: 15, economicEffect: 5, infrastructureEffect: 10, societyEffect: 15, environmentEffect: 25, score: 70 }
        ]
    }
];

console.log('📋 This script will reset all crisis cards.');
console.log('⚠️  Please delete existing cards manually via the admin panel first.');
console.log('\n📝 10 new crisis cards ready to create:');
newCards.forEach((card, i) => {
    console.log(`  ${i + 1}. ${card.title} (${card.responseOptions.length} options, ${card.timeLimit} min)`);
});

console.log('\n💡 To create these cards:');
console.log('   1. Go to http://localhost:3000/admin/cards/list');
console.log('   2. Delete all existing cards');
console.log('   3. Use the "Create Card" button to add each card manually');
console.log('   4. Or use the admin API endpoints to bulk create');
console.log('\n✅ Card data is ready above!');
