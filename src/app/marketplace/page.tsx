"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ShoppingCart, Package } from "lucide-react";
import Link from "next/link";
import { ProductList } from "@/components/marketplace/ProductList";

const MarketplacePage = () => {
  const { user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [stockFilter, setStockFilter] = useState<"all" | "inStock" | "outOfStock">("all");
  const [sortBy, setSortBy] = useState<"name" | "price" | "newest">("newest");

  const items = useQuery(api.marketplace.getMarketplaceItems, {
    category: selectedCategory,
  });

  const addToCart = useMutation(api.cart.addToCart);

  const categories = [
    { value: undefined, label: "All Products" },
    { value: "supplements", label: "Supplements" },
    { value: "equipment", label: "Equipment" },
    { value: "apparel", label: "Apparel" },
    { value: "accessories", label: "Accessories" },
    { value: "nutrition", label: "Nutrition" },
  ];

  const filteredItems = items?.filter(
    (item) => {
      const matchesCategory = selectedCategory === undefined || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
      const matchesStock = stockFilter === "all" || 
        (stockFilter === "inStock" && item.stock > 0) ||
        (stockFilter === "outOfStock" && item.stock === 0);
      
      return matchesCategory && matchesSearch && matchesPrice && matchesStock;
    }
  )?.sort((a, b) => {
    if (a.featured !== b.featured) {
      return a.featured ? -1 : 1;
    }
    
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "price":
        return a.price - b.price;
      case "newest":
      default:
        return new Date(b._creationTime).getTime() - new Date(a._creationTime).getTime();
    }
  });

  const handleAddToCart = async (productId: string) => {
    if (!user?.id) return;
    
    setAddingToCart(productId);
    try {
      await addToCart({
        clerkId: user.id,
        productId: productId as any,
        quantity: 1,
      });
      alert("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Error adding item to cart. Please try again.");
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4 tracking-tight">
            Marketplace
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Discover premium supplements, equipment, and fitness essentials
          </p>
        </div>

        {/* Search and Filters */}
        <Card variant="premium" className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  <option value="newest">Newest First</option>
                  <option value="price">Price: Low to High</option>
                  <option value="name">Name: A-Z</option>
                </select>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.value || "all"}
                  variant={selectedCategory === category.value ? "primary" : "tertiary"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {filteredItems && filteredItems.length > 0 ? (
          <ProductList
            products={filteredItems}
            onAddToCart={handleAddToCart}
            addingToCart={addingToCart}
            user={user}
          />
        ) : (
          <Card variant="premium">
            <CardContent className="py-24 text-center">
              <Package className="h-20 w-20 text-white/30 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-white mb-3">
                {items?.length === 0 ? "No Products Available" : "No Products Found"}
              </h3>
              <p className="text-white/60 mb-8 max-w-md mx-auto">
                {items?.length === 0
                  ? "Our marketplace is being stocked with amazing products. Check back soon!"
                  : "Try adjusting your search or filter criteria."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MarketplacePage;