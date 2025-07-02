import api from '../utils/api';
import type { ApiResponse, Blog, BlogCreationRequest, PaginatedResponse, PaginationParams } from '../types';

const blogService = {
  /**
   * Get all active blogs for public viewing
   */
  getPublicBlogs: async (params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Blog>>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
      if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    }
    
    const endpoint = `/blogs/public?${queryParams.toString()}`;
    return api.get<PaginatedResponse<Blog>>(endpoint);
  },
  
  /**
   * Get all blogs (including inactive ones) for admin/manager
   */
  getAllBlogs: async (params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Blog>>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
      if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    }
    
    const endpoint = `/blogs?${queryParams.toString()}`;
    return api.get<PaginatedResponse<Blog>>(endpoint);
  },
  
  /**
   * Get a specific blog by ID
   */
  getBlog: async (blogId: string): Promise<ApiResponse<Blog>> => {
    return api.get<Blog>(`/blogs/${blogId}`);
  },
  
  /**
   * Create a new blog
   */
  createBlog: async (blogData: BlogCreationRequest): Promise<ApiResponse<Blog>> => {
    return api.post<Blog>('/blogs', blogData);
  },
  
  /**
   * Update a blog
   */
  updateBlog: async (blogId: string, blogData: Partial<BlogCreationRequest>): Promise<ApiResponse<Blog>> => {
    return api.put<Blog>(`/blogs/${blogId}`, blogData);
  },
  
  /**
   * Upload an image for a blog
   */
  uploadBlogImage: async (file: File): Promise<ApiResponse<{fileUrl: string}>> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.uploadFile(file, '/blogs/upload-image');
  },
  
  /**
   * Activate a blog
   */
  activateBlog: async (blogId: string): Promise<ApiResponse<Blog>> => {
    return api.put<Blog>(`/blogs/${blogId}/activate`, {});
  },
  
  /**
   * Deactivate a blog
   */
  deactivateBlog: async (blogId: string): Promise<ApiResponse<Blog>> => {
    return api.put<Blog>(`/blogs/${blogId}/deactivate`, {});
  },
  
  /**
   * Delete a blog
   */
  deleteBlog: async (blogId: string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/blogs/${blogId}`);
  },
};

export default blogService; 