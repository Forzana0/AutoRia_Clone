import { useState, useEffect, useCallback } from 'react';
import type { MouseEvent } from 'react';
import axios from 'axios';

const API = 'http://localhost:5174';
const FAVORITES_KEY = 'autly_favorites_ids';

const getToken = () => localStorage.getItem('token');

export const useFavorites = () => {
    const [favoriteIds, setFavoriteIds] = useState<number[]>(() => {
        try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'); }
        catch { return []; }
    });

    const fetchIds = useCallback(async () => {
        const token = getToken();
        if (!token) return;
        try {
            const res = await axios.get(`${API}/api/Favorites/ids`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const ids: number[] = res.data || [];
            setFavoriteIds(ids);
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
        } catch (e) {
            console.error('fetchIds error', e);
        }
    }, []);

    useEffect(() => {
        void fetchIds();
    }, [fetchIds]);

    const isFavorite = (id: number) => favoriteIds.includes(id);

    const toggleFavorite = async (id: number, e?: MouseEvent) => {
        e?.stopPropagation();
        e?.preventDefault();

        const token = getToken();
        if (!token) return;

        const wasFavorite = favoriteIds.includes(id);
        const updated = wasFavorite
            ? favoriteIds.filter(f => f !== id)
            : [...favoriteIds, id];

        setFavoriteIds(updated);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));

        try {
            if (wasFavorite) {
                await axios.delete(`${API}/api/Favorites/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API}/api/Favorites/${id}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (e) {
            console.error('toggleFavorite error', e);
            setFavoriteIds(favoriteIds);
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds));
        }
    };

    const removeFavorite = async (id: number) => {
        const token = getToken();
        if (!token) return;
        const updated = favoriteIds.filter(f => f !== id);
        setFavoriteIds(updated);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
        try {
            await axios.delete(`${API}/api/Favorites/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch {
            setFavoriteIds(favoriteIds);
        }
    };

    return { favoriteIds, isFavorite, toggleFavorite, removeFavorite, refetch: fetchIds };
};