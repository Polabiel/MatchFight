import { db } from './client';
import { close } from './client';
import * as schema from './schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

const fighterNames = [
  { name: 'Silva Santos', nickname: 'Silva' },
  { name: 'Pereira Lima', nickname: 'Pereira' },
  { name: 'Costa Oliveira', nickname: 'Costa' },
  { name: 'Almeida Ferreira', nickname: 'Almeida' },
  { name: 'Gomes Rocha', nickname: 'Gomes' },
  { name: 'Martins Alves', nickname: 'Martins' },
  { name: 'Moreira Diniz', nickname: 'Moreira' },
  { name: 'Barros Castro', nickname: 'Barros' },
  { name: 'Moraes Ramos', nickname: 'Moraes' },
  { name: 'Vargas Lopes', nickname: 'Vargas' },
  { name: 'Nunes Mendes', nickname: 'Nunes' },
  { name: 'Carvalho Araujo', nickname: 'Carvalho' },
  { name: 'Freitas Barbosa', nickname: 'Freitas' },
  { name: 'Monteiro Paiva', nickname: 'Monteiro' },
  { name: 'Cavalcanti Ximenes', nickname: 'Cavalcanti' },
];

const judgeNames = [
  { name: 'Juiz Silva', nickname: 'Juiz Silva' },
  { name: 'Juiz Pereira', nickname: 'Juiz Pereira' },
  { name: 'Juiz Costa', nickname: 'Juiz Costa' },
];

const weightClasses = [
  'flyweight',
  'bantamweight',
  'featherweight',
  'lightweight',
  'welterweight',
  'middleweight',
  'light_heavyweight',
  'heavyweight',
] as const;

const locations = [
  'São Paulo, SP',
  'Rio de Janeiro, RJ',
  'Belo Horizonte, MG',
  'Salvador, BA',
  'Fortaleza, CE',
  'Brasília, DF',
  'Manaus, AM',
  'Curitiba, PR',
  'Recife, PE',
  'Porto Alegre, RS',
];

function randomWeightClass() {
  return weightClasses[Math.floor(Math.random() * weightClasses.length)];
}

function randomLocation() {
  return locations[Math.floor(Math.random() * locations.length)];
}

function randomWinLoss() {
  return Math.floor(Math.random() * 10); // 0-9 wins/losses
}

export async function seedDatabase(db: PostgresJsDatabase<typeof schema>) {
  // Clear existing data
  await db.delete(schema.Profile);
  await db.delete(schema.user);

  const now = new Date();

  // Insert users and profiles for fighters
  for (const [index, { name, nickname }] of fighterNames.entries()) {
    const userId = `fighter-${index + 1}`;
    const email = `fighter${index + 1}@example.com`;

    // Insert user
    await db.insert(schema.user).values({
      id: userId,
      name,
      email,
      emailVerified: true,
      image: null,
      createdAt: now,
      updatedAt: now,
    });

    // Insert profile
    await db.insert(schema.Profile).values({
      userId,
      nickname,
      bio: `Bio de ${nickname}`,
      role: 'fighter',
      weightClass: randomWeightClass(),
      wins: randomWinLoss(),
      losses: randomWinLoss(),
      location: randomLocation(),
      createdAt: now,
      updatedAt: now,
    });
  }

  // Insert users and profiles for judges
  for (const [index, { name, nickname }] of judgeNames.entries()) {
    const userId = `judge-${index + 1}`;
    const email = `judge${index + 1}@example.com`;

    // Insert user
    await db.insert(schema.user).values({
      id: userId,
      name,
      email,
      emailVerified: true,
      image: null,
      createdAt: now,
      updatedAt: now,
    });

    // Insert profile
    await db.insert(schema.Profile).values({
      userId,
      nickname,
      bio: `Bio de ${nickname}`,
      role: 'judge',
      weightClass: undefined, // Judges don't have weight class
      wins: 0,
      losses: 0,
      location: randomLocation(),
      createdAt: now,
      updatedAt: now,
    });
  }
}

// Main function to run the seed
async function main() {
  await seedDatabase(db);
  console.log('Database seeded successfully');
  await close();
}

if (process.argv[1]?.endsWith('seed.ts')) {
  main().catch((err) => {
    console.error('Error seeding database:', err);
    process.exit(1);
  });
}