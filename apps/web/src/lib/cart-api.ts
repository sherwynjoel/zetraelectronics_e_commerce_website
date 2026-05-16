import { API_URL } from './api';
import { CartItem } from './store';

export async function syncCartToBackend(token: string, items: CartItem[]) {
    const payload = items.map((i) => ({ productId: i.id, quantity: i.quantity }));
    const res = await fetch(`${API_URL}/cart/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items: payload }),
    });
    if (!res.ok) return null;
    return res.json();
}

export async function fetchBackendCart(token: string) {
    const res = await fetch(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return res.json();
}

export async function addItemToBackend(token: string, productId: number, quantity: number) {
    fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId, quantity }),
    }).catch(() => {});
}

export async function removeItemFromBackend(token: string, productId: number) {
    fetch(`${API_URL}/cart/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
}

export async function clearBackendCart(token: string) {
    fetch(`${API_URL}/cart/clear`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
}
