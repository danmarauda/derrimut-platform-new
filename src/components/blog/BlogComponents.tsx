"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Clock, 
  Eye, 
  Heart, 
  User, 
  BookOpen,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  slug: string;
  category: string;
  featuredImage?: string;
  readTime: number;
  views: number;
  likes: number;
  authorName: string;
  featured?: boolean;
}

interface BlogGridProps {
  posts: BlogPost[];
  featured?: boolean;
}

export function BlogCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <Card 
        variant={featured ? "premium" : "standard"}
        className="group hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col"
      >
        {post.featuredImage && (
          <div className="relative h-64 bg-white/5 overflow-hidden">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {featured && (
              <div className="absolute top-4 left-4">
                <Badge variant="accent" className="backdrop-blur-sm">
                  Featured
                </Badge>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}
        
        <CardContent className="p-6 flex flex-col flex-1">
          <div className="mb-3">
            <Badge variant="standard" className="text-xs">
              {post.category}
            </Badge>
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-3 line-clamp-2 group-hover:text-white/80 transition-colors">
            {post.title}
          </h3>
          
          <p className="text-white/60 text-sm mb-6 line-clamp-3 flex-1 leading-relaxed">
            {post.excerpt}
          </p>
          
          <div className="flex items-center justify-between text-xs text-white/50 pt-4 border-t border-white/10">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {post.readTime}m
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {post.views}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {post.likes}
              </span>
            </div>
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {post.authorName}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function BlogGrid({ posts, featured = false }: BlogGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <BlogCard key={post._id} post={post} featured={featured} />
      ))}
    </div>
  );
}

export function BlogSearch({ 
  searchTerm, 
  onSearchChange 
}: { 
  searchTerm: string; 
  onSearchChange: (value: string) => void;
}) {
  return (
    <div className="max-w-2xl mx-auto mb-12">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 h-5 w-5" />
        <Input
          type="text"
          placeholder="Search articles..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 pr-4 py-6 text-lg bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:ring-white/20"
        />
      </div>
    </div>
  );
}

export function BlogCategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
}: {
  categories: Array<{ value: string; label: string; icon: React.ElementType }>;
  selectedCategory?: string;
  onCategoryChange: (category?: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3 justify-center mb-12">
      <Button
        variant={selectedCategory === undefined ? "primary" : "tertiary"}
        size="sm"
        onClick={() => onCategoryChange(undefined)}
      >
        All Categories
      </Button>
      {categories.map((category) => {
        const Icon = category.icon;
        return (
          <Button
            key={category.value}
            variant={selectedCategory === category.value ? "primary" : "tertiary"}
            size="sm"
            onClick={() => onCategoryChange(category.value)}
          >
            <Icon className="h-4 w-4 mr-2" />
            {category.label}
          </Button>
        );
      })}
    </div>
  );
}

export function BlogEmptyState({ 
  searchTerm, 
  onClearSearch 
}: { 
  searchTerm?: string; 
  onClearSearch?: () => void;
}) {
  return (
    <div className="text-center py-24">
      <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/10">
        <BookOpen className="h-12 w-12 text-white/30" />
      </div>
      <h3 className="text-2xl font-semibold text-white mb-3">
        {searchTerm ? "No Articles Found" : "No Articles Yet"}
      </h3>
      <p className="text-white/60 mb-8 max-w-md mx-auto">
        {searchTerm 
          ? "Try adjusting your search terms or browse our categories" 
          : "Check back soon for new content"}
      </p>
      {searchTerm && onClearSearch && (
        <Button variant="primary" onClick={onClearSearch}>
          Clear Search
        </Button>
      )}
    </div>
  );
}