const prisma = require('../src/utils/prisma');

async function main() {
    console.log('Seeding database...');

    // Create Sectors
    const sectorData = [
        {
            name: 'Vital Statistics',
            description: 'Birth, Marriage, and Death certifications.',
            icon: 'User',
            services: [
                { name: 'Birth Certificate', mode: 'QUEUE', availability: 'Mon-Fri' },
                { name: 'Marriage Registration', mode: 'APPOINTMENT', availability: 'Mon-Fri' },
                { name: 'ID Card Renewal', mode: 'QUEUE', availability: 'Daily' },
            ]
        },
        {
            name: 'Land Management',
            description: 'Property registration and title deeds.',
            icon: 'Map',
            services: [
                { name: 'Land Title Transfer', mode: 'ONLINE', availability: '24/7' },
                { name: 'Property Valuation', mode: 'APPOINTMENT', availability: 'Tue, Thu' },
            ]
        }
    ];

    for (const s of sectorData) {
        await prisma.serviceSector.upsert({
            where: { name: s.name },
            update: {
                description: s.description,
                icon: s.icon,
            },
            create: {
                name: s.name,
                description: s.description,
                icon: s.icon,
                services: {
                    create: s.services
                }
            }
        });
    }

    // Create Admin and Officer
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const officerPassword = await bcrypt.hash('officer123', 10);

    const users = await Promise.all([
        prisma.user.upsert({
            where: { phoneNumber: '0911000000' },
            update: {},
            create: {
                name: 'System Admin',
                phoneNumber: '0911000000',
                password: adminPassword,
                role: 'ADMIN',
                identificationNumber: 'ADM-001'
            }
        }),
        prisma.user.upsert({
            where: { phoneNumber: '0922000000' },
            update: {},
            create: {
                name: 'Service Officer',
                phoneNumber: '0922000000',
                password: officerPassword,
                role: 'OFFICER',
                identificationNumber: 'OFF-001'
            }
        })
    ]);

    console.log('Seeding completed:', sectors.length, 'sectors and', users.length, 'users created');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
