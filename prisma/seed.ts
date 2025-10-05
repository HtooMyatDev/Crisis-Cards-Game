import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { resolve } from 'path';

const prisma = new PrismaClient();

config({ path: resolve(__dirname, '../.env') });


const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

const SALT_ROUNDS = 10;

async function main() {
    if (!email || !password) {
        throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment variables.');
    }
    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

        const existingAdmin = await prisma.user.findUnique({
            where: { email }
        })

        if (existingAdmin) {
            await prisma.user.update({
                where: { email },
                data: {
                    password: hashedPassword,
                }
            })
        }
        else {
            await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: 'Super Admin',
                    role: 'ADMIN',
                    isActive: true,
                }
            })
        }
    }

    catch (error) {
        console.error("❌ Error during seeding", error)
        throw error;
    }
}

main().then(async () => {
    await prisma.$disconnect();
}).catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
})
