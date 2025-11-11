"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import { CartPage } from "@/components/marketplace/CartPage";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

const CartPageRoute = () => {
  const { user } = useUser();
  const router = useRouter();
  const [updatingQuantity, setUpdatingQuantity] = useState<string | null>(null);
  const [removingItem, setRemovingItem] = useState<string | null>(null);

  const cartItems = useQuery(
    api.cart.getUserCart,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const cartSummary = useQuery(
    api.cart.getCartSummary,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const updateQuantity = useMutation(api.cart.updateCartQuantity);
  const removeFromCart = useMutation(api.cart.removeFromCart);
  const clearCart = useMutation(api.cart.clearCart);

  const handleQuantityUpdate = async (cartItemId: string, quantity: number) => {
    if (!user?.id || quantity < 1) return;
    
    setUpdatingQuantity(cartItemId);
    try {
      await updateQuantity({
        cartItemId: cartItemId as any,
        quantity,
        clerkId: user.id,
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Error updating quantity. Please try again.");
    } finally {
      setUpdatingQuantity(null);
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    if (!user?.id) return;
    
    setRemovingItem(cartItemId);
    try {
      await removeFromCart({
        cartItemId: cartItemId as any,
        clerkId: user.id,
      });
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Error removing item. Please try again.");
    } finally {
      setRemovingItem(null);
    }
  };

  const handleClearCart = async () => {
    if (!user?.id) return;
    
    if (!confirm("Are you sure you want to clear your cart?")) return;
    
    try {
      await clearCart({ clerkId: user.id });
    } catch (error) {
      console.error("Error clearing cart:", error);
      alert("Error clearing cart. Please try again.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/10">
            <ShoppingCart className="h-10 w-10 text-white/30" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-3">Sign In Required</h2>
          <p className="text-white/60 mb-8">Please sign in to view your shopping cart</p>
          <Button variant="primary" onClick={() => router.push("/sign-in")}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (!cartItems || !cartSummary) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 border-4 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <CartPage
      cartItems={cartItems}
      cartSummary={cartSummary}
      onQuantityUpdate={handleQuantityUpdate}
      onRemoveItem={handleRemoveItem}
      onClearCart={handleClearCart}
      updatingQuantity={updatingQuantity}
      removingItem={removingItem}
    />
  );
};

export default CartPageRoute;