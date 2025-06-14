
import { useState, useEffect, useCallback } from "react";
import { Project, FilterState } from "@/types";

// Debounce utility function
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useProjectFilter = (projects: Project[]) => {
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    search: "",
    status: "all",
    minAmount: "",
    maxAmount: "",
    dateFrom: "",
    dateTo: ""
  });

  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);
  const [filterCache, setFilterCache] = useState<Map<string, Project[]>>(new Map());

  // Debounce the filter changes to avoid excessive filtering
  const debouncedFilters = useDebounce(currentFilters, 300);

  // Memoized filter function for better performance
  const applyFilters = useCallback((projectList: Project[], filters: FilterState): Project[] => {
    // Create cache key from filters
    const cacheKey = JSON.stringify(filters);
    
    // Check if we have cached results
    if (filterCache.has(cacheKey)) {
      console.log('Using cached filter results');
      return filterCache.get(cacheKey)!;
    }

    console.log('Computing new filter results');
    let filtered = [...projectList];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(project =>
        project.address.toLowerCase().includes(searchLower) ||
        project.clientName?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter(project => project.status === filters.status);
    }

    // Amount filters
    if (filters.minAmount) {
      const minAmount = parseFloat(filters.minAmount);
      filtered = filtered.filter(project => project.finalPrice >= minAmount);
    }
    if (filters.maxAmount) {
      const maxAmount = parseFloat(filters.maxAmount);
      filtered = filtered.filter(project => project.finalPrice <= maxAmount);
    }

    // Date filters
    if (filters.dateFrom || filters.dateTo) {
      filtered = filtered.filter(project => {
        const projectDate = new Date(project.createdAt);
        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
        const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
        
        if (fromDate && projectDate < fromDate) return false;
        if (toDate && projectDate > toDate) return false;
        return true;
      });
    }

    // Cache the result
    const newCache = new Map(filterCache);
    newCache.set(cacheKey, filtered);
    
    // Limit cache size to prevent memory issues
    if (newCache.size > 10) {
      const firstKey = newCache.keys().next().value;
      newCache.delete(firstKey);
    }
    
    setFilterCache(newCache);
    return filtered;
  }, [filterCache]);

  // Apply filters when debounced filters or projects change
  useEffect(() => {
    const filtered = applyFilters(projects, debouncedFilters);
    setFilteredProjects(filtered);
  }, [projects, debouncedFilters, applyFilters]);

  // Clear cache when projects change significantly
  useEffect(() => {
    setFilterCache(new Map());
  }, [projects.length]);

  const handleFilterChange = useCallback((filters: FilterState) => {
    setCurrentFilters(filters);
  }, []);

  return {
    filteredProjects,
    handleFilterChange
  };
};
