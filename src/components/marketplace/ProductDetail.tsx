"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Check,
  Plus,
  Minus
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ProductDetailProps {
  product: {
    _id: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    category: string;
    stock: number;
    featured?: boolean;
  };
  relatedProducts?: Array<{
    _id: string;
    name: string;
    price: number;
    imageUrl?: string;
    category: string;
  }>;
  onAddToCart: (quantity: number) => Promise<void>;
  addingToCart: boolean;
  user?: { id: string } | null;
}

export function ProductDetail({ 
  product, 
  relatedProducts = [], 
  onAddToCart, 
  addingToCart,
  user 
}: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [wishlist, setWishlist] = useState(false);

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const productImages = [
    product.imageUrl || "/placeholder-product.jpg",
  ];

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-sm text-white/60">
            <Link href="/marketplace" className="hover:text-white transition-colors">
              Marketplace
            </Link>
            <span>/</span>
            <Link href={`/marketplace?category=${product.category}`} className="hover:text-white transition-colors capitalize">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-white">{product.name}</span>
          </nav>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            <Card variant="premium" className="overflow-hidden">
              <div className="relative aspect-square bg-white/5">
                {productImages[selectedImageIndex] && (
                  <Image
                    src={productImages[selectedImageIndex]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                )}
                {product.featured && (
                  <div className="absolute top-4 left-4">
                    <Badge variant="accent" className="backdrop-blur-sm">
                      Featured
                    </Badge>
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <Badge variant="standard" className="bg-red-500/20 border-red-500/30 text-red-400 text-lg px-6 py-3">
                      Out of Stock
                    </Badge>
                  </div>
                )}
              </div>
            </Card>
            
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index 
                        ? "border-white/40" 
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <Image src={img} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="standard" className="mb-4">
                {product.category}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4 tracking-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-3xl font-bold text-white">
                  {formatPrice(product.price)}
                </div>
                {product.stock > 0 && (
                  <Badge variant="accent" className="text-sm">
                    <Check className="h-3 w-3 mr-1" />
                    In Stock ({product.stock} available)
                  </Badge>
                )}
              </div>
            </div>

            <Card variant="premium">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Description</h2>
                <p className="text-white/70 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </CardContent>
            </Card>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <Card variant="standard">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-white font-medium">Quantity</span>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="tertiary"
                        size="icon"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-white font-semibold text-lg w-12 text-center">
                        {quantity}
                      </span>
                      <Button
                        variant="tertiary"
                        size="icon"
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {user ? (
                    <Button
                      variant="primary"
                      className="w-full"
                      size="lg"
                      onClick={() => onAddToCart(quantity)}
                      disabled={addingToCart || product.stock === 0}
                    >
                      {addingToCart ? (
                        <>
                          <div className="h-4 w-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mr-2" />
                          Adding to Cart...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-5 w-5 mr-2" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button variant="primary" className="w-full" size="lg" asChild>
                      <Link href="/sign-in">
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Sign In to Purchase
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Features */}
            <Card variant="standard">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-3 text-white/70">
                    <Truck className="h-5 w-5 text-white/50" />
                    <span className="text-sm">Free shipping on orders over $200</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/70">
                    <Shield className="h-5 w-5 text-white/50" />
                    <span className="text-sm">Secure payment processing</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/70">
                    <RotateCcw className="h-5 w-5 text-white/50" />
                    <span className="text-sm">30-day return policy</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-semibold text-white mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((related) => (
                <Link key={related._id} href={`/marketplace/product/${related._id}`}>
                  <Card variant="premium" className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                    {related.imageUrl && (
                      <div className="relative h-48 bg-white/5 overflow-hidden">
                        <Image
                          src={related.imageUrl}
                          alt={related.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-white/80 transition-colors">
                        {related.name}
                      </h3>
                      <div className="text-lg font-bold text-white">
                        {formatPrice(related.price)}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}