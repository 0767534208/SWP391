import React, { useState } from 'react';
import { blogService } from '../../services';
import type { PaginationParams } from '../../types';

const BlogApiTester: React.FC = () => {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Example values
  const paginationExample: PaginationParams = {
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    sortDirection: 'desc',
    searchTerm: ''
  };

  const blogCreationExample = {
    title: "Chăm sóc sức khỏe sinh sản - Những điều cần biết",
    content: `<h2>Chăm sóc sức khỏe sinh sản - Những điều cần biết</h2>
<p>Sức khỏe sinh sản là một phần quan trọng trong đời sống của mỗi người. Bài viết này sẽ cung cấp cho bạn những thông tin cơ bản về chăm sóc sức khỏe sinh sản.</p>
<h3>1. Khám sức khỏe định kỳ</h3>
<p>Việc khám sức khỏe định kỳ giúp phát hiện sớm các vấn đề về sức khỏe sinh sản. Phụ nữ nên đi khám phụ khoa ít nhất mỗi năm một lần.</p>
<h3>2. Dinh dưỡng hợp lý</h3>
<p>Chế độ ăn uống cân đối, đầy đủ chất dinh dưỡng giúp cơ thể khỏe mạnh, hỗ trợ hệ sinh sản hoạt động tốt.</p>
<h3>3. Tập thể dục đều đặn</h3>
<p>Hoạt động thể chất giúp cải thiện tuần hoàn máu, giảm stress, hỗ trợ cân bằng hormone.</p>`,
    summary: "Tìm hiểu về cách chăm sóc sức khỏe sinh sản hiệu quả và những điều cần lưu ý để bảo vệ sức khỏe sinh sản của bạn.",
    imageUrl: "https://example.com/health-reproductive.jpg"
  };

  const blogUpdateExample = {
    blogId: "3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d",
    title: "Chăm sóc sức khỏe sinh sản - Cập nhật mới nhất 2023",
    content: `<h2>Chăm sóc sức khỏe sinh sản - Cập nhật mới nhất 2023</h2>
<p>Sức khỏe sinh sản là một phần quan trọng trong đời sống của mỗi người. Bài viết này cung cấp thông tin mới nhất về chăm sóc sức khỏe sinh sản.</p>
<h3>1. Khám sức khỏe định kỳ</h3>
<p>Việc khám sức khỏe định kỳ giúp phát hiện sớm các vấn đề về sức khỏe sinh sản. Phụ nữ nên đi khám phụ khoa ít nhất mỗi năm một lần.</p>
<h3>2. Dinh dưỡng hợp lý</h3>
<p>Chế độ ăn uống cân đối, đầy đủ chất dinh dưỡng giúp cơ thể khỏe mạnh, hỗ trợ hệ sinh sản hoạt động tốt.</p>
<h3>3. Tập thể dục đều đặn</h3>
<p>Hoạt động thể chất giúp cải thiện tuần hoàn máu, giảm stress, hỗ trợ cân bằng hormone.</p>
<h3>4. Công nghệ mới trong chăm sóc sức khỏe sinh sản</h3>
<p>Năm 2023 đánh dấu nhiều tiến bộ trong công nghệ chẩn đoán và điều trị các vấn đề về sức khỏe sinh sản.</p>`,
    summary: "Cập nhật mới nhất về cách chăm sóc sức khỏe sinh sản hiệu quả và những tiến bộ công nghệ trong lĩnh vực này năm 2023.",
    imageUrl: "https://example.com/health-reproductive-2023.jpg"
  };

  const handleGetPublicBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await blogService.getPublicBlogs(paginationExample);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetAllBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await blogService.getAllBlogs(paginationExample);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetBlog = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await blogService.getBlog(blogUpdateExample.blogId);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBlog = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await blogService.createBlog(blogCreationExample);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBlog = async () => {
    setLoading(true);
    setError(null);
    try {
      const { blogId, ...updateData } = blogUpdateExample;
      const result = await blogService.updateBlog(blogId, updateData);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadBlogImage = async () => {
    setLoading(true);
    setError(null);
    try {
      // Note: In a real implementation, you would get the file from an input element
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.onchange = async (e: any) => {
        if (e.target.files.length > 0) {
          const file = e.target.files[0];
          try {
            const result = await blogService.uploadBlogImage(file);
            setResponse(result);
          } catch (err: any) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        }
      };
      fileInput.click();
      // Note: This is just for demonstration purposes
      // In a real app, you'd integrate with a proper file upload component
      setResponse({
        message: "Upload process initiated. Please select an image file.",
        statusCode: null,
        data: null
      });
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleActivateBlog = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await blogService.activateBlog(blogUpdateExample.blogId);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateBlog = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await blogService.deactivateBlog(blogUpdateExample.blogId);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await blogService.deleteBlog(blogUpdateExample.blogId);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="api-tester">
      <h2>Blog API Tester</h2>
      
      <div className="api-examples">
        <div className="api-example">
          <h3>Get Public Blogs</h3>
          <p>Pagination Parameters:</p>
          <pre>{JSON.stringify(paginationExample, null, 2)}</pre>
          <button onClick={handleGetPublicBlogs} disabled={loading}>
            Test Get Public Blogs
          </button>
        </div>

        <div className="api-example">
          <h3>Get All Blogs (Admin/Manager)</h3>
          <p>Pagination Parameters:</p>
          <pre>{JSON.stringify(paginationExample, null, 2)}</pre>
          <button onClick={handleGetAllBlogs} disabled={loading}>
            Test Get All Blogs
          </button>
        </div>

        <div className="api-example">
          <h3>Get Blog by ID</h3>
          <p>Blog ID: {blogUpdateExample.blogId}</p>
          <button onClick={handleGetBlog} disabled={loading}>
            Test Get Blog
          </button>
        </div>

        <div className="api-example">
          <h3>Create Blog</h3>
          <p>Example blog data (shortened for display):</p>
          <pre>{JSON.stringify({
            title: blogCreationExample.title,
            summary: blogCreationExample.summary,
            content: blogCreationExample.content.substring(0, 100) + "...",
            imageUrl: blogCreationExample.imageUrl
          }, null, 2)}</pre>
          <button onClick={handleCreateBlog} disabled={loading}>
            Test Create Blog
          </button>
        </div>

        <div className="api-example">
          <h3>Update Blog</h3>
          <p>Example blog update data (shortened for display):</p>
          <pre>{JSON.stringify({
            blogId: blogUpdateExample.blogId,
            title: blogUpdateExample.title,
            summary: blogUpdateExample.summary,
            content: blogUpdateExample.content.substring(0, 100) + "...",
            imageUrl: blogUpdateExample.imageUrl
          }, null, 2)}</pre>
          <button onClick={handleUpdateBlog} disabled={loading}>
            Test Update Blog
          </button>
        </div>

        <div className="api-example">
          <h3>Upload Blog Image</h3>
          <p>Upload an image for a blog post (will open file dialog)</p>
          <button onClick={handleUploadBlogImage} disabled={loading}>
            Test Upload Blog Image
          </button>
        </div>

        <div className="api-example">
          <h3>Activate Blog</h3>
          <p>Blog ID: {blogUpdateExample.blogId}</p>
          <button onClick={handleActivateBlog} disabled={loading}>
            Test Activate Blog
          </button>
        </div>

        <div className="api-example">
          <h3>Deactivate Blog</h3>
          <p>Blog ID: {blogUpdateExample.blogId}</p>
          <button onClick={handleDeactivateBlog} disabled={loading}>
            Test Deactivate Blog
          </button>
        </div>

        <div className="api-example">
          <h3>Delete Blog</h3>
          <p>Blog ID: {blogUpdateExample.blogId}</p>
          <button onClick={handleDeleteBlog} disabled={loading}>
            Test Delete Blog
          </button>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <div className="error">Error: {error}</div>}
      
      {response && (
        <div className="response">
          <h3>Response:</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}

      <div className="example-response">
        <h3>Example Blog Response:</h3>
        <pre>{JSON.stringify({
          message: "Success",
          statusCode: 200,
          data: {
            blogId: "3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d",
            title: "Chăm sóc sức khỏe sinh sản - Những điều cần biết",
            content: "HTML content here...",
            summary: "Tìm hiểu về cách chăm sóc sức khỏe sinh sản hiệu quả và những điều cần lưu ý để bảo vệ sức khỏe sinh sản của bạn.",
            imageUrl: "https://example.com/health-reproductive.jpg",
            authorId: "7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b",
            authorName: "Bác sĩ Nguyễn Thị B",
            createdAt: "2023-11-01T08:30:00.000Z",
            updatedAt: "2023-11-01T08:30:00.000Z",
            isActive: true
          }
        }, null, 2)}</pre>
      </div>
    </div>
  );
};

export default BlogApiTester; 