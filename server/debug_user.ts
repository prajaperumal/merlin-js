
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const email = 'prasanna.raj.usa@gmail.com';
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        console.log('User not found');
        return;
    }
    console.log('User found:', user.id, user.email);

    const memberships = await prisma.circleMember.findMany({
        where: { userId: user.id },
        include: { circle: true }
    });

    console.log('Memberships:', JSON.stringify(memberships, null, 2));

    const externalInvites = await (prisma as any).circleInvitation.findMany({
        where: { email }
    });
    console.log('External Invites:', JSON.stringify(externalInvites, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
