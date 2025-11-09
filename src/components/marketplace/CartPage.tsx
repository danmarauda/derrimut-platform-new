"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart,
  Plus,
  Minus,
  X,
  Package,
  Trash2,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface CartItem {
  _id: any;
  productId: any;
  quantity: number;
  priceAtTime?: number;
  product?: {
    _id: any;
    name: string;
    price: number;
    imageUrl?: string;
    stock: number;
    category?: string;
  } | null;
}

interface CartSummary {
  totalItems: number;
  subtotal?: number;
  totalPrice: number;
  itemCount?: number;
}

interface CartPageProps {
  cartItems: CartItem[];
  cartSummary: CartSummary;
  onQuantityUpdate: (cartItemId: string, quantity: number) => Promise<void>;
  onRemoveItem: (cartItemId: string) => Promise<void>;
  onClearCart: () => Promise<void>;
  updatingQuantity?: string | null;
  removingItem?: string | null;
}

export function CartPage({
  cartItems,
  cartSummary,
  onQuantityUpdate,
  onRemoveItem,
  onClearCart,
  updatingQuantity,
  removingItem,
}: CartPageProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const calculateShipping = (subtotal: number) => {
    return subtotal >= 200 ? 0 : 10;
  };

  const calculateTax = (subtotal: number) => {
    return Math.round(subtotal * 0.10);
  };

  const shipping = calculateShipping(cartSummary.subtotal || cartSummary.totalPrice || 0);
  const tax = calculateTax(cartSummary.subtotal || cartSummary.totalPrice || 0);
  const total = (cartSummary.subtotal || cartSummary.totalPrice || 0) + shipping + tax;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-950 py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card variant="premium">
            <CardContent className="py-24 text-center">
              <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/10">
                <ShoppingCart className="h-12 w-12 text-white/30" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-3">Your Cart is Empty</h2>
              <p className="text-white/60 mb-8 max-w-md mx-auto">
                Start shopping to add items to your cart
              </p>
              <Button variant="primary" asChild>
                <Link href="/marketplace">
                  Browse Marketplace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-white mb-2">Shopping Cart</h1>
          <p className="text-white/60">{cartSummary.totalItems} item{cartSummary.totalItems !== 1 ? "s" : ""}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const product = item.product || item.productId;
              const productId = product?._id || item.productId;
              const productName = product?.name || "Unknown Product";
              const productPrice = item.priceAtTime || product?.price || 0;
              const productImage = product?.imageUrl;
              const productStock = product?.stock || 0;
              
              return (
                <Card key={String(item._id)} variant="premium">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {productImage && (
                        <Link href={`/marketplace/product/${productId}`}>
                          <div className="relative h-24 w-24 rounded-xl bg-white/5 overflow-hidden border border-white/10 flex-shrink-0">
                            <Image
                              src={productImage}
                              alt={productName}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </Link>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <Link href={`/marketplace/product/${productId}`}>
                              <h3 className="text-white font-semibold mb-1 hover:text-white/80 transition-colors">
                                {productName}
                              </h3>
                            </Link>
                            <p className="text-white/60 text-sm">
                              Stock: {productStock} available
                            </p>
                          </div>
                          <Button
                            variant="tertiary"
                            size="icon"
                            onClick={() => onRemoveItem(String(item._id))}
                            disabled={removingItem === String(item._id)}
                            className="text-white/60 hover:text-white hover:bg-white/10"
                          >
                            {removingItem === String(item._id) ? (
                              <div className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="tertiary"
                              size="icon"
                              onClick={() => onQuantityUpdate(String(item._id), Math.max(1, item.quantity - 1))}
                              disabled={updatingQuantity === String(item._id) || item.quantity <= 1}
                              className="h-8 w-8"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-white font-semibold w-12 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="tertiary"
                              size="icon"
                              onClick={() => onQuantityUpdate(String(item._id), item.quantity + 1)}
                              disabled={updatingQuantity === String(item._id) || item.quantity >= productStock}
                              className="h-8 w-8"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-semibold text-lg">
                              {formatPrice(productPrice * item.quantity)}
                            </p>
                            <p className="text-white/60 text-sm">
                              {formatPrice(productPrice)} each
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <Button
              variant="tertiary"
              onClick={onClearCart}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card variant="premium" className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-white">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-white/60">
                    <span>Subtotal</span>
                    <span>{formatPrice(cartSummary.subtotal || cartSummary.totalPrice || 0)}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-emerald-400">Free</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-white/50">
                      Free shipping on orders over $200
                    </p>
                  )}
                  <div className="flex justify-between text-white/60">
                    <span>Tax (GST)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between text-white font-semibold text-lg">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                <Button variant="primary" className="w-full" size="lg" asChild>
                  <Link href="/marketplace/checkout">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Link href="/marketplace">
                  <Button variant="secondary" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}