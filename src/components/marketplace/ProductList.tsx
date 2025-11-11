"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  stock: number;
  featured?: boolean;
}

interface ProductListProps {
  products: Product[];
  onAddToCart?: (productId: string) => void;
  addingToCart?: string | null;
  user?: { id: string } | null;
}

export function ProductList({ products, onAddToCart, addingToCart, user }: ProductListProps) {
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card 
          key={product._id} 
          variant="premium"
          className="group hover:shadow-xl transition-all duration-300 overflow-hidden"
        >
          <div className="relative">
            {/* Product Image */}
            <Link href={`/marketplace/product/${product._id}`}>
              <div className="relative h-64 bg-white/5 overflow-hidden">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="h-16 w-16 text-white/20" />
                  </div>
                )}
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </Link>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.featured && (
                <Badge variant="accent" className="backdrop-blur-sm">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              {product.stock === 0 && (
                <Badge variant="standard" className="bg-red-500/20 border-red-500/30 text-red-400">
                  Out of Stock
                </Badge>
              )}
            </div>

            {/* Wishlist Button */}
            <Button
              variant="tertiary"
              size="icon"
              className="absolute top-4 right-4 h-9 w-9 rounded-full backdrop-blur-sm"
              onClick={() => toggleWishlist(product._id)}
            >
              <Heart 
                className={`h-4 w-4 transition-colors ${
                  wishlist.has(product._id) ? "fill-red-500 text-red-500" : "text-white/70"
                }`} 
              />
            </Button>
          </div>

          <CardContent className="p-6">
            {/* Category */}
            <div className="mb-2">
              <Badge variant="standard" className="text-xs">
                {product.category}
              </Badge>
            </div>

            {/* Product Name */}
            <Link href={`/marketplace/product/${product._id}`}>
              <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 hover:text-white/80 transition-colors">
                {product.name}
              </h3>
            </Link>

            {/* Description */}
            <p className="text-white/60 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
              {product.description}
            </p>

            {/* Separator */}
            <div className="h-px bg-white/10 my-4" />

            {/* Price and Stock */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-2xl font-bold text-white mb-1">
                  {formatPrice(product.price)}
                </div>
                <p className="text-xs text-white/50">
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </p>
              </div>
            </div>

            {/* Add to Cart Button */}
            {user ? (
              <Button
                variant="primary"
                className="w-full"
                onClick={() => onAddToCart?.(product._id)}
                disabled={product.stock === 0 || addingToCart === product._id}
              >
                {addingToCart === product._id ? (
                  <>
                    <div className="h-4 w-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
            ) : (
              <Button variant="primary" className="w-full" asChild>
                <Link href="/sign-in">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Sign In to Buy
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}