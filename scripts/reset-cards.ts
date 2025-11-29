import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
      {
        text: "Shut down all affected systems immediately",
        politicalEffect: 5,
        economicEffect: -15,
        infrastructureEffect: -10,
        societyEffect: -5,
        environmentEffect: 0,
        score: -25
      },
      {
        text: "Deploy emergency backup systems while investigating",
        politicalEffect: 10,
        economicEffect: -5,
        infrastructureEffect: 15,
        societyEffect: 10,
        environmentEffect: 0,
        score: 30
      },
      {
        text: "Request international cybersecurity assistance",
        politicalEffect: -5,
        economicEffect: 0,
        infrastructureEffect: 10,
        societyEffect: 5,
        environmentEffect: 0,
        score: 10
      }
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
      {
        text: "Implement immediate lockdown measures",
        politicalEffect: -10,
        economicEffect: -20,
        infrastructureEffect: 0,
        societyEffect: 15,
        environmentEffect: 5,
        score: -10
      },
      {
        text: "Mass vaccination campaign with emergency protocols",
        politicalEffect: 15,
        economicEffect: -10,
        infrastructureEffect: 5,
        societyEffect: 20,
        environmentEffect: 0,
        score: 30
      }
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
      {
        text: "Emergency government bailout of banks",
        politicalEffect: -15,
        economicEffect: 20,
        infrastructureEffect: 0,
        societyEffect: -10,
        environmentEffect: 0,
        score: -5
      },
      {
        text: "Implement strict capital controls and freeze withdrawals",
        politicalEffect: -20,
        economicEffect: 10,
        infrastructureEffect: 0,
        societyEffect: -15,
        environmentEffect: 0,
        score: -25
      },
      {
        text: "Create national economic stimulus package",
        politicalEffect: 10,
        economicEffect: 15,
        infrastructureEffect: 5,
        societyEffect: 10,
        environmentEffect: 0,
        score: 40
      }
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
      {
        text: "Deploy all emergency services for search and rescue",
        politicalEffect: 15,
        economicEffect: -10,
        infrastructureEffect: 5,
        societyEffect: 20,
        environmentEffect: 0,
        score: 30
      },
      {
        text: "Evacuate the city and establish temporary shelters",
        politicalEffect: 5,
        economicEffect: -15,
        infrastructureEffect: -5,
        societyEffect: 10,
        environmentEffect: -5,
        score: -10
      }
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
      {
        text: "Open borders and provide humanitarian aid",
        politicalEffect: -10,
        economicEffect: -15,
        infrastructureEffect: -10,
        societyEffect: 20,
        environmentEffect: 10,
        score: -5
      },
      {
        text: "Build sustainable refugee settlements with green technology",
        politicalEffect: 10,
        economicEffect: -5,
        infrastructureEffect: 15,
        societyEffect: 15,
        environmentEffect: 20,
        score: 55
      },
      {
        text: "Close borders and redirect to other nations",
        politicalEffect: -20,
        economicEffect: 5,
        infrastructureEffect: 0,
        societyEffect: -25,
        environmentEffect: -10,
        score: -50
      }
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
      {
        text: "Negotiate peaceful transition with coup leaders",
        politicalEffect: -15,
        economicEffect: -5,
        infrastructureEffect: 0,
        societyEffect: 10,
        environmentEffect: 0,
        score: -10
      },
      {
        text: "Deploy loyal forces to retake government buildings",
        politicalEffect: 15,
        economicEffect: -10,
        infrastructureEffect: -5,
        societyEffect: -10,
        environmentEffect: 0,
        score: -10
      },
      {
        text: "Call for international mediation and peacekeepers",
        politicalEffect: 20,
        economicEffect: 0,
        infrastructureEffect: 0,
        societyEffect: 15,
        environmentEffect: 0,
        score: 35
      }
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
      {
        text: "Distribute bottled water and shut down contaminated systems",
        politicalEffect: 10,
        economicEffect: -20,
        infrastructureEffect: -10,
        societyEffect: 15,
        environmentEffect: 5,
        score: 0
      },
      {
        text: "Fast-track emergency water purification infrastructure",
        politicalEffect: 15,
        economicEffect: -10,
        infrastructureEffect: 20,
        societyEffect: 20,
        environmentEffect: 15,
        score: 60
      }
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
      {
        text: "Implement universal basic income program",
        politicalEffect: 10,
        economicEffect: -15,
        infrastructureEffect: 0,
        societyEffect: 25,
        environmentEffect: 0,
        score: 20
      },
      {
        text: "Launch massive job retraining and education initiative",
        politicalEffect: 15,
        economicEffect: 10,
        infrastructureEffect: 5,
        societyEffect: 20,
        environmentEffect: 0,
        score: 50
      },
      {
        text: "Tax automation and redistribute to affected workers",
        politicalEffect: -10,
        economicEffect: 5,
        infrastructureEffect: 0,
        societyEffect: 15,
        environmentEffect: 0,
        score: 10
      }
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
      {
        text: "Immediate evacuation of all surrounding areas",
        politicalEffect: 10,
        economicEffect: -20,
        infrastructureEffect: -10,
        societyEffect: 15,
        environmentEffect: 10,
        score: 5
      },
      {
        text: "Deploy emergency cooling and containment teams",
        politicalEffect: 15,
        economicEffect: -10,
        infrastructureEffect: 15,
        societyEffect: 10,
        environmentEffect: 20,
        score: 50
      }
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
      {
        text: "Implement food rationing and price controls",
        politicalEffect: -10,
        economicEffect: -5,
        infrastructureEffect: 0,
        societyEffect: 10,
        environmentEffect: 0,
        score: -5
      },
      {
        text: "Emergency import agreements and strategic reserves release",
        politicalEffect: 10,
        economicEffect: 15,
        infrastructureEffect: 5,
        societyEffect: 20,
        environmentEffect: 0,
        score: 50
      },
      {
        text: "Fast-track sustainable agriculture programs",
        politicalEffect: 15,
        economicEffect: 5,
        infrastructureEffect: 10,
        societyEffect: 15,
        environmentEffect: 25,
        score: 70
      }
    ]
  }
];

async function main() {
  console.log('🗑️  Deleting all existing crisis cards...');

  // Delete all existing cards
  await prisma.card.deleteMany({});
  console.log('✅ All existing cards deleted');

  // Get or create an admin user for categories
  let adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!adminUser) {
    console.log('⚠️  No admin user found, creating one...');
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@crisiscard.com',
        name: 'System Admin',
        role: 'ADMIN',
        password: 'hashed_password_placeholder' // In a real app, this should be hashed
      }
    });
  }

  console.log('\n📝 Creating 10 new crisis cards with 1-minute time limits...\n');

  for (const cardData of newCards) {
    // Find or create category
    let category = await prisma.category.findFirst({
      where: { name: cardData.categoryName }
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: cardData.categoryName,
          description: `Crisis scenarios related to ${cardData.categoryName.toLowerCase()}`,
          color: getColorForCategory(cardData.categoryName),
          // icon field removed as it doesn't exist in schema
          createdBy: adminUser.id
        }
      });
      console.log(`  Created category: ${category.name}`);
    }

    // Create card with response options
    const card = await prisma.card.create({
      data: {
        title: cardData.title,
        description: cardData.description,
        categoryId: category.id,
        political: cardData.political,
        economic: cardData.economic,
        infrastructure: cardData.infrastructure,
        society: cardData.society,
        environment: cardData.environment,
        timeLimit: cardData.timeLimit,
        status: cardData.status,
        createdBy: adminUser.id,

        cardResponses: {
          create: cardData.responseOptions.map((opt, index) => ({
            text: opt.text,
            politicalEffect: opt.politicalEffect,
            economicEffect: opt.economicEffect,
            infrastructureEffect: opt.infrastructureEffect,
            societyEffect: opt.societyEffect,
            environmentEffect: opt.environmentEffect,
            score: opt.score,
            order: index
          }))
        }
      },
      include: {
        cardResponses: true
      }
    });

    console.log(`  ✅ Created: "${card.title}" (${cardData.responseOptions.length} options, ${cardData.timeLimit} min)`);
  }

  console.log(`\n🎉 Successfully created ${newCards.length} new crisis cards!`);
  console.log('⏱️  All cards have 1-minute time limits');
}

function getColorForCategory(categoryName: string): string {
  const colors: Record<string, string> = {
    'Technology Crisis': '#3b82f6',
    'Health Crisis': '#ef4444',
    'Economic Crisis': '#10b981',
    'Natural Disaster': '#f59e0b',
    'Environmental Crisis': '#22c55e',
    'Political Crisis': '#8b5cf6',
    'Social Unrest': '#f97316'
  };
  return colors[categoryName] || '#6b7280';
}

function getIconForCategory(categoryName: string): string {
  const icons: Record<string, string> = {
    'Technology Crisis': 'Cpu',
    'Health Crisis': 'Heart',
    'Economic Crisis': 'DollarSign',
    'Natural Disaster': 'CloudRain',
    'Environmental Crisis': 'Leaf',
    'Political Crisis': 'Flag',
    'Social Unrest': 'Users'
  };
  return icons[categoryName] || 'AlertCircle';
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
