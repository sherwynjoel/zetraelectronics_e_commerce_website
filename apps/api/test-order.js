
const axios = require('axios');

async function testOrder() {
    try {
        // 1. Login as Admin to get token
        const loginRes = await axios.post('http://localhost:4000/auth/login', {
            email: 'admin@zetraelectronics.com',
            password: 'admin123'
        });
        const token = loginRes.data.access_token;
        console.log('Got token:', token ? 'Yes' : 'No');

        // 2. Create Order with Payment Method
        const orderData = {
            items: [
                { productId: 1, quantity: 1, price: 1999.99 } // Assuming product 1 exists
            ],
            total: 1999.99,
            paymentMethod: 'card'
        };

        const orderRes = await axios.post('http://localhost:4000/orders', orderData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Order Created:', orderRes.data.id);
        console.log('Payment Method:', orderRes.data.paymentMethod);

        if (orderRes.data.paymentMethod === 'card') {
            console.log('✅ Payment Method Saved Correctly');
        } else {
            console.error('❌ Payment Method NOT Saved Correctly');
        }

    } catch (e) {
        console.error('Error:', e.response ? e.response.data : e.message);
    }
}

testOrder();
