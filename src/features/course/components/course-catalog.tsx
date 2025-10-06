'use client';

import { useState } from 'react';
import { useCoursesQuery } from '../hooks/use-course';
import { CourseCard } from './course-card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';

const categories = [
  'Development',
  'Design',
  'Business',
  'Marketing',
  'Data Science',
  'Artificial Intelligence',
];

const difficultyLevels = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
];

export default function CourseCatalogPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [difficultyLevel, setDifficultyLevel] = useState<string>('');
  const [sort, setSort] = useState<'latest' | 'popular'>('latest');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isLoading, isError, error } = useCoursesQuery({
    search,
    category,
    difficulty_level: difficultyLevel,
    sort,
    page,
    limit,
  });

  if (isError) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="p-6 text-center text-destructive">
            <p>Error loading courses: {error?.message || 'Unknown error'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Course Catalog</h1>
        <p className="text-muted-foreground mt-2">
          Browse and enroll in courses that match your interests and skill level
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
          <SelectTrigger>
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            {difficultyLevels.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v: 'latest' | 'popular') => setSort(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Newest</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      {data && data.data && (
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {data.data.length} of {data.pagination.total} courses
        </div>
      )}

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="p-6 space-y-4">
                <div className="h-5 w-3/4 bg-muted rounded"></div>
                <div className="h-4 w-full bg-muted rounded"></div>
                <div className="h-4 w-2/3 bg-muted rounded"></div>
                <div className="flex space-x-2">
                  <div className="h-6 w-16 bg-muted rounded"></div>
                  <div className="h-6 w-16 bg-muted rounded"></div>
                </div>
              </div>
              <div className="p-6 pt-0 space-y-3">
                <div className="h-10 w-full bg-muted rounded"></div>
                <div className="h-10 w-full bg-muted rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : data && data.data && data.data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.data.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No courses found. Try adjusting your filters.</p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {data && data.pagination && data.pagination.total_pages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, data.pagination.total_pages) }, (_, i) => {
              let pageNum;
              if (data.pagination.total_pages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= data.pagination.total_pages - 2) {
                pageNum = data.pagination.total_pages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            disabled={page >= data.pagination.total_pages}
            onClick={() => setPage(prev => Math.min(prev + 1, data.pagination.total_pages))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}