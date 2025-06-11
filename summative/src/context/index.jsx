import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, firestore } from '../firebase/index.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const StoreContext = createContext();

export function StoreProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [selectedGenres, setSelected] = useState([]);
    const [previousPurchases, setPurchases] = useState([]);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [cart, setCart] = useState([]);
    const [cartLoaded, setCartLoaded] = useState(false);

    useEffect(() => {
        if (cartLoaded && user && user.uid) {
            const userCartKey = `cart_${user.uid}`;
            console.log(`Saving cart for user ${user.uid} with ${cart.length} items`);
            localStorage.setItem(userCartKey, JSON.stringify(cart));
        }
    }, [cart, user, cartLoaded]);

    useEffect(() => {
        if (!isAuthReady || !user || !user.uid) return;

        const userCartKey = `cart_${user.uid}`;
        const savedCart = localStorage.getItem(userCartKey);

        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                console.log(`Loading cart for user ${user.uid} with ${parsedCart.length} items`);
                setCart(parsedCart);
            } catch (error) {
                console.error("Error parsing user cart from localStorage:", error);
                setCart([]);
            }
        } else {
            console.log(`No existing cart found for user ${user.uid}`);
            setCart([]);
        }

        setCartLoaded(true);
    }, [user, isAuthReady]);

    useEffect(() => {
        console.log("Setting up auth state listener");
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            console.log("Auth state changed:", currentUser ? `User: ${currentUser.uid}` : "No user");

            if (currentUser) {
                setUser(currentUser);

                try {
                    const userDoc = await getDoc(doc(firestore, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setUserData(data);
                        setSelected(data.selectedGenres || []);
                        setPurchases(data.purchases || []);
                    }
                } catch (error) {
                    console.error("Error loading user data:", error);
                }
            } else {
                setUser(null);
                setUserData(null);
                setSelected([]);
                setPurchases([]);
                setCart([]);
                setCartLoaded(false);
            }

            setIsAuthReady(true);
        });

        return () => unsubscribe();
    }, []);

    const updateUserProfile = async (userId, updates) => {
        if (!userId) return;

        try {
            const userDocRef = doc(firestore, "users", userId);
            await updateDoc(userDocRef, updates);

            if (updates) {
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const updatedData = userDoc.data();
                    setUserData(updatedData);

                    if (updates.selectedGenres) setSelected(updates.selectedGenres);
                    if (updates.purchases) setPurchases(updates.purchases);
                }
            }

            return true;
        } catch (error) {
            console.error("Error updating user profile:", error);
            return false;
        }
    };

    const handleCheckout = async () => {
        if (!user || cart.length === 0) return false;

        try {
            const userDocRef = doc(firestore, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const data = userDoc.data();
                const updatedPurchases = [...(data.purchases || []), ...cart];

                await updateDoc(userDocRef, {
                    purchases: updatedPurchases
                });

                setPurchases(updatedPurchases);
                setCart([]);

                if (user.uid) {
                    localStorage.removeItem(`cart_${user.uid}`);
                }

                return true;
            }
            return false;
        } catch (error) {
            console.error("Error processing checkout:", error);
            return false;
        }
    };

    const value = {
        user,
        userData,
        selectedGenres,
        previousPurchases,
        cart,
        isAuthReady,
        setUser,
        setSelected,
        setPurchases,
        setCart,
        updateUserProfile,
        handleCheckout
    };

    if (!isAuthReady) {
        return (
            <StoreContext.Provider value={value}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    background: '#1d1e22',
                    color: '#00ff88'
                }}>
                    <h2>Loading...</h2>
                </div>
            </StoreContext.Provider>
        );
    }

    return (
        <StoreContext.Provider value={value}>
            {children}
        </StoreContext.Provider>
    );
}

export function useStoreContext() {
    return useContext(StoreContext);
}