import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(undefined);
const CUSTOMER_CART_CACHE_KEY = 'customer_cart_cache_v1';

const readCachedCart = () => {
    try {
        const raw = localStorage.getItem(CUSTOMER_CART_CACHE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        const items = Array.isArray(parsed?.items) ? parsed.items : [];
        const summary = parsed?.summary && typeof parsed.summary === 'object' ? parsed.summary : null;
        return { items, summary };
    } catch {
        return { items: [], summary: null };
    }
};

const persistCachedCart = (items, summary) => {
    try {
        localStorage.setItem(CUSTOMER_CART_CACHE_KEY, JSON.stringify({ items, summary }));
    } catch {
        // Ignore storage failures (private mode/quota issues).
    }
};

const clearCachedCart = () => {
    try {
        localStorage.removeItem(CUSTOMER_CART_CACHE_KEY);
    } catch {
        // Ignore storage failures.
    }
};

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeItem = (item) => ({
    ...item,
    id: toNumber(item?.id),
    product_id: toNumber(item?.product_id),
    quantity: Math.max(0, toNumber(item?.quantity)),
    product: {
        ...(item?.product || {}),
        id: toNumber(item?.product?.id || item?.product_id),
        name: String(item?.product?.name || item?.name || 'Product'),
        brand: item?.product?.brand || item?.brand,
        price: toNumber(item?.product?.price || item?.price),
        images: item?.product?.images || item?.images || [],
    },
});

export const CartProvider = ({ children }) => {
    const { isAuthenticated, isAdmin } = useAuth();
    const [cartItems, setCartItems] = useState(() => readCachedCart().items);
    const [cartSummary, setCartSummary] = useState(() => readCachedCart().summary);
    const [loading, setLoading] = useState(false);
    const syncTimerRef = useRef(null);
    const optimisticCartItemIdRef = useRef(-1);
    const retryFetchTimerRef = useRef(null);

    useEffect(() => {
        let frameId = null;

        const runBootstrap = () => {
            if (isAdmin) {
                setCartItems([]);
                setCartSummary(null);
                clearCachedCart();
                return;
            }

            if (isAuthenticated) {
                fetchCart();
            } else {
                setCartItems([]);
                setCartSummary(null);
                clearCachedCart();
            }
        };

        frameId = window.requestAnimationFrame(runBootstrap);

        return () => {
            if (frameId !== null) {
                window.cancelAnimationFrame(frameId);
            }
            if (syncTimerRef.current !== null) {
                window.clearTimeout(syncTimerRef.current);
                syncTimerRef.current = null;
            }
            if (retryFetchTimerRef.current !== null) {
                window.clearTimeout(retryFetchTimerRef.current);
                retryFetchTimerRef.current = null;
            }
        };
    }, [isAuthenticated, isAdmin]);

    const buildSummaryFromItems = (items) => {
        const subtotal = items.reduce((total, item) => {
            const price = toNumber(item?.product?.price || 0);
            const quantity = toNumber(item?.quantity || 0);
            return total + (price * quantity);
        }, 0);
        const totalQuantity = items.reduce((total, item) => total + toNumber(item?.quantity || 0), 0);

        const tax = subtotal * 0.1;
        const shipping = items.length > 0 ? 50 : 0;
        const total = subtotal + tax + shipping;

        return {
            items,
            subtotal,
            tax,
            shipping,
            total,
            item_count: totalQuantity,
        };
    };

    const syncCartInBackground = () => {
        if (syncTimerRef.current !== null) {
            window.clearTimeout(syncTimerRef.current);
        }

        syncTimerRef.current = window.setTimeout(() => {
            fetchCart({ silent: true }).catch(() => {
                // Ignore sync failures; local state remains usable.
            });
            syncTimerRef.current = null;
        }, 650);
    };

    const fetchCart = async (options = {}) => {
        const silent = Boolean(options?.silent);
        const timeoutMs = Number(options?.timeoutMs || 6000);
        const isTimeoutError = (error) => {
            const code = String(error?.code || '').toUpperCase();
            const message = String(error?.message || '').toLowerCase();
            return code === 'ECONNABORTED' || message.includes('timeout');
        };

        try {
            if (!silent) {
                setLoading(true);
            }

            try {
                const summaryRes = await cartService.getSummary({ timeout: timeoutMs });
                const summaryData = summaryRes?.data?.data || null;
                const nextItems = Array.isArray(summaryData?.items) ? summaryData.items.map(normalizeItem) : [];
                const nextSummary = summaryData
                    ? {
                        ...summaryData,
                        items: nextItems,
                        subtotal: toNumber(summaryData.subtotal),
                        tax: toNumber(summaryData.tax),
                        shipping: toNumber(summaryData.shipping),
                        total: toNumber(summaryData.total),
                        item_count: toNumber(summaryData.item_count),
                    }
                    : buildSummaryFromItems(nextItems);

                setCartItems(nextItems);
                setCartSummary(nextSummary);
                persistCachedCart(nextItems, nextSummary);
                return;
            } catch {
                // Fallback to cart endpoint if summary endpoint is slow/unavailable.
            }

            const cartRes = await cartService.getCart({ timeout: timeoutMs });
            const rawItems = cartRes?.data?.data;
            const nextItems = (Array.isArray(rawItems) ? rawItems : []).map(normalizeItem);
            const nextSummary = buildSummaryFromItems(nextItems);
            setCartItems(nextItems);
            setCartSummary(nextSummary);
            persistCachedCart(nextItems, nextSummary);
        } catch (error) {
            const timedOut = isTimeoutError(error);
            if (timedOut) {
                console.warn('Cart request timed out. Using cached cart and retrying in background.');
            } else {
                console.error('Failed to fetch cart:', error);
            }

            const cached = readCachedCart();
            if (cached.items.length > 0 || cached.summary) {
                const normalizedCachedItems = cached.items.map(normalizeItem);
                setCartItems(normalizedCachedItems);
                setCartSummary(cached.summary || buildSummaryFromItems(normalizedCachedItems));
            } else {
                const emptySummary = buildSummaryFromItems([]);
                setCartItems([]);
                setCartSummary(emptySummary);
                persistCachedCart([], emptySummary);
            }

            if (timedOut && retryFetchTimerRef.current === null) {
                retryFetchTimerRef.current = window.setTimeout(() => {
                    fetchCart({ silent: true, timeoutMs: 12000 }).catch(() => {
                        // Keep cached cart state if retry still fails.
                    });
                    retryFetchTimerRef.current = null;
                }, 1800);
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    };

    const addItem = async (productId, quantity, optimisticProduct) => {
        let insertedOptimisticItemId = null;
        let incrementedExistingItem = false;

        if (optimisticProduct) {
            setCartItems((previous) => {
                const next = [...previous];
                const matchIndex = next.findIndex((item) => {
                    const candidateProductId = toNumber(item?.product?.id || item?.product_id || 0);
                    return candidateProductId === toNumber(productId);
                });

                if (matchIndex >= 0) {
                    const current = next[matchIndex];
                    next[matchIndex] = {
                        ...current,
                        quantity: toNumber(current?.quantity || 0) + toNumber(quantity || 0),
                    };
                    incrementedExistingItem = true;
                } else {
                    const optimisticItemId = optimisticCartItemIdRef.current;
                    optimisticCartItemIdRef.current -= 1;
                    insertedOptimisticItemId = optimisticItemId;

                    const optimisticItem = {
                        id: optimisticItemId,
                        product_id: toNumber(productId),
                        quantity: toNumber(quantity || 0),
                        product: {
                            id: toNumber(productId),
                            name: String(optimisticProduct?.name || 'Product'),
                            brand: optimisticProduct?.brand,
                            price: toNumber(optimisticProduct?.price || 0),
                            images: optimisticProduct?.images,
                        },
                    };

                    next.unshift(optimisticItem);
                }

                const summary = buildSummaryFromItems(next);
                setCartSummary(summary);
                persistCachedCart(next, summary);
                return next;
            });

            window.dispatchEvent(new CustomEvent('carvex:cart-item-added'));
        }

        try {
            const response = await cartService.addItem({ product_id: productId, quantity }, { timeout: 6000 });
            const added = response?.data?.data ? normalizeItem(response.data.data) : null;

            setCartItems((previous) => {
                const next = [...previous];
                const matchIndex = next.findIndex((item) => {
                    const candidateProductId = toNumber(item?.product?.id || item?.product_id || 0);
                    return candidateProductId === toNumber(productId);
                });

                if (matchIndex >= 0) {
                    const current = next[matchIndex];
                    if (added) {
                        next[matchIndex] = {
                            ...current,
                            ...added,
                            product: added.product || current.product,
                            quantity: toNumber(added?.quantity || current?.quantity || 0),
                        };
                    } else if (!optimisticProduct || !incrementedExistingItem) {
                        next[matchIndex] = {
                            ...current,
                            quantity: toNumber(current?.quantity || 0) + toNumber(quantity || 0),
                        };
                    }
                } else if (added) {
                    next.unshift(added);
                }

                const summary = buildSummaryFromItems(next);
                setCartSummary(summary);
                persistCachedCart(next, summary);
                return next;
            });

            if (!optimisticProduct) {
                window.dispatchEvent(new CustomEvent('carvex:cart-item-added'));
            }

            syncCartInBackground();
            return true;
        } catch (error) {
            if (optimisticProduct) {
                setCartItems((previous) => {
                    let next = [...previous];

                    if (insertedOptimisticItemId !== null) {
                        next = next.filter((item) => toNumber(item?.id) !== toNumber(insertedOptimisticItemId));
                    } else {
                        const matchIndex = next.findIndex((item) => {
                            const candidateProductId = toNumber(item?.product?.id || item?.product_id || 0);
                            return candidateProductId === toNumber(productId);
                        });

                        if (matchIndex >= 0) {
                            const current = next[matchIndex];
                            const restoredQuantity = toNumber(current?.quantity || 0) - toNumber(quantity || 0);

                            if (restoredQuantity <= 0) {
                                next.splice(matchIndex, 1);
                            } else {
                                next[matchIndex] = {
                                    ...current,
                                    quantity: restoredQuantity,
                                };
                            }
                        }
                    }

                    const summary = buildSummaryFromItems(next);
                    setCartSummary(summary);
                    persistCachedCart(next, summary);
                    return next;
                });
            }

            throw error;
        }
    };

    const updateItem = async (cartItemId, quantity) => {
        try {
            if (quantity <= 0) {
                await cartService.removeItem(cartItemId);
                setCartItems((previous) => {
                    const next = previous.filter((item) => toNumber(item?.id) !== toNumber(cartItemId));
                    const summary = buildSummaryFromItems(next);
                    setCartSummary(summary);
                    persistCachedCart(next, summary);
                    return next;
                });
                syncCartInBackground();
                return true;
            }

            await cartService.updateItem(cartItemId, { quantity });

            setCartItems((previous) => {
                const next = previous.map((item) => (
                    toNumber(item?.id) === toNumber(cartItemId)
                        ? { ...item, quantity: toNumber(quantity || 0) }
                        : item
                ));

                const summary = buildSummaryFromItems(next);
                setCartSummary(summary);
                persistCachedCart(next, summary);
                return next;
            });

            syncCartInBackground();
            return true;
        } catch (error) {
            throw error;
        }
    };

    const removeItem = async (cartItemId) => {
        try {
            await cartService.removeItem(cartItemId);

            setCartItems((previous) => {
                const next = previous.filter((item) => toNumber(item?.id) !== toNumber(cartItemId));
                const summary = buildSummaryFromItems(next);
                setCartSummary(summary);
                persistCachedCart(next, summary);
                return next;
            });

            syncCartInBackground();
            return true;
        } catch (error) {
            throw error;
        }
    };

    const clearCart = async () => {
        try {
            await cartService.clearCart();
            setCartItems([]);
            setCartSummary(buildSummaryFromItems([]));
            clearCachedCart();
            return true;
        } catch (error) {
            throw error;
        }
    };

    const cartCount = cartItems.reduce((total, item) => total + toNumber(item?.quantity || 0), 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                cartSummary,
                cartCount,
                loading,
                addItem,
                updateItem,
                removeItem,
                clearCart,
                fetchCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
