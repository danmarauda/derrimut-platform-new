"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Target,
  Utensils,
  Award,
  Users,
  BookOpen,
  Newspaper,
  Heart
} from "lucide-react";
import { 
  BlogGrid, 
  BlogSearch, 
  BlogCategoryFilter, 
  BlogEmptyState 
} from "@/components/blog/BlogComponents";

const categoryConfig = {
  "workout-tips": { label: "Workout Tips", icon: Target },
  "nutrition": { label: "Nutrition", icon: Utensils },
  "success-stories": { label: "Success Stories", icon: Award },
  "trainer-insights": { label: "Trainer Insights", icon: Users },
  "equipment-guides": { label: "Equipment Guides", icon: BookOpen },
  "wellness": { label: "Wellness", icon: Heart },
  "news": { label: "News", icon: Newspaper },
};

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [mounted, setMounted] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(9);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setDisplayLimit(9);
  }, [selectedCategory, searchTerm]);

  const loadMore = () => {
    setDisplayLimit(prev => prev + 9);
  };

  const featuredPosts = useQuery(api.blog.getBlogPosts, {
    status: "published",
    featured: true,
    limit: 3,
  });

  const allPosts = useQuery(api.blog.getBlogPosts, {
    status: "published",
    category: selectedCategory,
  });

  const searchResults = useQuery(
    api.blog.searchBlogPosts,
    searchTerm.trim() ? {
      searchTerm: searchTerm.trim(),
      category: selectedCategory,
    } : "skip"
  );

  const basePosts = searchTerm.trim() ? searchResults : allPosts;
  const displayPosts = basePosts?.slice(0, displayLimit);
  const hasMore = basePosts && basePosts.length > displayLimit;

  const categories = Object.entries(categoryConfig).map(([value, config]) => ({
    value,
    label: config.label,
    icon: config.icon,
  }));

  if (!mounted) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="animate-pulse max-w-6xl mx-auto px-4">
          <div className="h-16 bg-white/5 rounded-2xl w-2/3 mx-auto mb-12"></div>
          <div className="h-12 bg-white/5 rounded-xl w-1/3 mx-auto mb-16"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/5 h-80 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 py-24 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="accent" className="mb-4">
            Fitness Blog
          </Badge>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4 tracking-tight">
            Expert Insights & Tips
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Expert insights, workout tips, and success stories to power your fitness journey
          </p>
        </div>

        {/* Search */}
        <BlogSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {/* Category Filters */}
        <BlogCategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Featured Posts */}
        {!searchTerm && featuredPosts && featuredPosts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-white mb-6">Featured Articles</h2>
            <BlogGrid posts={featuredPosts} featured={true} />
          </div>
        )}

        {/* Recent/Search Results */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">
            {searchTerm ? `Search Results` : "Recent Articles"}
          </h2>
          
          {displayPosts && displayPosts.length > 0 ? (
            <>
              <BlogGrid posts={displayPosts} />
              {hasMore && (
                <div className="text-center mt-12">
                  <Button variant="primary" onClick={loadMore}>
                    Load More Articles
                  </Button>
                  <p className="text-white/50 mt-4 text-sm">
                    Showing {displayPosts.length} of {basePosts?.length || 0} articles
                  </p>
                </div>
              )}
            </>
          ) : (
            <BlogEmptyState 
              searchTerm={searchTerm} 
              onClearSearch={() => setSearchTerm("")} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;