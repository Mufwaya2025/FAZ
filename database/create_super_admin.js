const axios = require('axios');

const createSuperAdmin = async () => {
    try {
        const response = await axios.post('http://localhost:5001/api/v1/users/register', {
            email: 'admin@example.com',
            password: 'password123',
            name: 'Super Admin',
            role: 'super_admin',
        });
        console.log('Super Admin created:', response.data);
    } catch (error) {
        console.error('Error creating Super Admin:', error.response ? error.response.data : error.message);
    }
};

createSuperAdmin();