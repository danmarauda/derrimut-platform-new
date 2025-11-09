"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { ProductDetail } from "@/components/marketplace/ProductDetail";

const ProductDetailPage = () => {
  const { user } = useUser();
  const params = useParams();
  const productId = params.id as string;
  const [addingToCart, setAddingToCart] = useState(false);

  const product = useQuery(api.marketplace.getMarketplaceItemById, {
    itemId: productId as any,
  });

  const relatedProducts = useQuery(
    api.marketplace.getMarketplaceItems,
    product ? { category: product.category } : "skip"
  );

  const addToCart = useMutation(api.cart.addToCart);

  const handleAddToCart = async (quantity: number) => {
    if (!user?.id || !product) return;

    setAddingToCart(true);
    try {
      await addToCart({
        clerkId: user.id,
        productId: product._id as any,
        quantity,
      });
      alert(`Added ${quantity} ${product.name}(s) to cart!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Error adding item to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 border-4 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Filter out current product from related products
  const filteredRelated = relatedProducts?.filter(p => p._id !== product._id) || [];

  return (
    <ProductDetail
      product={product}
      relatedProducts={filteredRelated}
      onAddToCart={handleAddToCart}
      addingToCart={addingToCart}
      user={user}
    />
  );
};

export default ProductDetailPage;