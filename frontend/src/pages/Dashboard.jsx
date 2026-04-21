import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../axiosConfig';

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchMyPosts();
    }
  }, [navigate]);

  const fetchMyPosts = async () => {
    try {
      const res = await API.get('/posts/me');
      if (res.data.success) {
        setPosts(res.data.data);
      }
    } catch (err) {
      showMessage('error', 'Failed to fetch your posts');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/posts/${editingId}`, { title, content });
        showMessage('success', 'Post updated successfully');
      } else {
        await API.post('/posts', { title, content });
        showMessage('success', 'Post created successfully');
      }
      setTitle('');
      setContent('');
      setEditingId(null);
      fetchMyPosts();
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Error saving post');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await API.delete(`/posts/${id}`);
        showMessage('success', 'Post deleted');
        fetchMyPosts();
      } catch (err) {
        showMessage('error', 'Failed to delete post');
      }
    }
  };

  const handlePublishToggle = async (post) => {
    try {
      if (post.status === 'draft') {
        await API.patch(`/posts/${post._id}/publish`);
        showMessage('success', 'Post published');
      } else {
        await API.patch(`/posts/${post._id}/unpublish`);
        showMessage('success', 'Post unpublished');
      }
      fetchMyPosts();
    } catch (err) {
      showMessage('error', 'Failed to change post status');
    }
  };

  const handleEdit = (post) => {
    setEditingId(post._id);
    setTitle(post.title);
    setContent(post.content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container">
      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h1 className="title">Dashboard</h1>
        <p className="subtitle">Manage your blog posts</p>
      </div>

      {message.text && (
        <div className={message.type === 'error' ? 'error-message' : 'success-message'}>
          {message.text}
        </div>
      )}

      {/* Editor Section */}
      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h2 className="title" style={{ fontSize: '1.5rem' }}>
          {editingId ? 'Edit Post' : 'Create New Post'}
        </h2>
        <form onSubmit={handleCreateOrUpdate}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Post Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea 
              className="form-control" 
              placeholder="Write your post content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required 
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update Post' : 'Save as Draft'}
            </button>
            {editingId && (
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={() => {
                  setEditingId(null);
                  setTitle('');
                  setContent('');
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Posts List */}
      <div className="glass-panel">
        <h2 className="title" style={{ fontSize: '1.5rem' }}>Your Posts</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="post-grid">
            {posts.map(post => (
              <div key={post._id} className="post-card" style={{ border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'rgba(255,255,255,0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 className="post-title" style={{ marginBottom: '0.2rem' }}>{post.title}</h3>
                  <span className={`badge ${post.status === 'published' ? 'badge-published' : 'badge-draft'}`}>
                    {post.status}
                  </span>
                </div>
                <div className="post-meta" style={{ marginBottom: '0.5rem' }}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
                <p className="post-content" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                  {post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content}
                </p>
                <div className="post-actions">
                  <button onClick={() => handleEdit(post)} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>Edit</button>
                  <button onClick={() => handlePublishToggle(post)} className={`btn ${post.status === 'draft' ? 'btn-success' : 'btn-outline'}`} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                    {post.status === 'draft' ? 'Publish' : 'Unpublish'}
                  </button>
                  <button onClick={() => handleDelete(post._id)} className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', marginLeft: 'auto' }}>Delete</button>
                </div>
              </div>
            ))}
            {posts.length === 0 && <p>You haven't created any posts yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
