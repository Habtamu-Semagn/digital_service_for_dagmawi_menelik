const bcrypt = require('bcryptjs');

async function check() {
    const password123 = '$2b$10$VzRtjpgP6JZ7tlZTl.i5reUqPWDYOnmF5NaaPRkAZVcxvA841tIZ2';
    const officer123 = '$2b$10$THSM7IuM/1zyLUUWaePDdOG71rZUfEJePXRBdIaax0ptfkcMtn9SS';
    const admin123 = '$2b$10$N4tWNGR4sPecwZAFVtrj5OcaitRAkSZS6KyOzZw12yTBo0hSmtm2G';

    console.log('CITIZEN (password123):', await bcrypt.compare('password123', password123));
    console.log('OFFICER (officer123):', await bcrypt.compare('officer123', officer123));
    console.log('ADMIN (admin123):', await bcrypt.compare('admin123', admin123));
}

check();
