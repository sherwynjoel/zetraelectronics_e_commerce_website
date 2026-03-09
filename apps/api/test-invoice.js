const fs = require('fs');

async function test() {
    try {
        const res = await fetch("http://127.0.0.1:4000/auth/login", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@zetraelectronics.com', password: 'Zetra@13122024' })
        });
        const data = await res.json();

        if (!data.access_token) {
            console.log("Login failed");
            return;
        }

        const orderRes = await fetch("http://127.0.0.1:4000/orders", {
            headers: { 'Authorization': `Bearer ${data.access_token}` }
        });
        const orders = await orderRes.json();

        if (orders.length > 0) {
            const invoiceRes = await fetch(`http://127.0.0.1:4000/orders/${orders[0].id}/invoice`, {
                headers: { 'Authorization': `Bearer ${data.access_token}` }
            });
            const buffer = await invoiceRes.arrayBuffer();
            fs.writeFileSync('test_invoice.pdf', Buffer.from(buffer));
            console.log('Success! Saved invoice for Order #' + orders[0].id + ' to apps/api/test_invoice.pdf');
        } else {
            console.log('No orders to generate an invoice for.');
        }
    } catch (err) {
        console.error("Test failed:", err);
    }
}
test();
