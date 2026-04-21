import { useState, useEffect } from 'react';
import API from '../axiosConfig';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await API.get('/posts');
      if (res.data.success) {
        setPosts(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublish = async (id) => {
    try {
      await API.patch(`/posts/${id}/unpublish`);
      // Remove from UI
      setPosts(posts.filter(p => p._id !== id));
    } catch (err) {
      alert('Failed to unpublish post');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to completely delete this post?')) {
      try {
        await API.delete(`/posts/${id}`);
        // Remove from UI
        setPosts(posts.filter(p => p._id !== id));
      } catch (err) {
        alert('Failed to delete post');
      }
    }
  };

  return (
    <div className="container">
      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h1 className="title">Latest Articles</h1>
        <p className="subtitle">Read the latest published thoughts and updates.</p>
      </div>

      {loading && <p>Loading posts...</p>}
      {error && <div className="error-message">{error}</div>}

      <div className="post-grid">
        {posts.map(post => (
          <div key={post._id} className="glass-panel post-card">
            <h2 className="post-title">{post.title}</h2>
            <div className="post-meta">
              By {post.author.name} • {new Date(post.createdAt).toLocaleDateString()}
            </div>
            <p className="post-content">
              {post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content}
            </p>
            {isAdmin && (
               <div className="post-actions" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                 <strong style={{ fontSize: '0.8rem', color: 'var(--danger)', marginRight: 'auto', display: 'flex', alignItems: 'center' }}>Moderator Tools</strong>
                 <button onClick={() => handleUnpublish(post._id)} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>Unpublish</button>
                 <button onClick={() => handleDelete(post._id)} className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>Delete</button>
               </div>
            )}
          </div>
        ))}

        {!loading && posts.length === 0 && (
          <p>No published posts available.</p>
        )}
      </div>
    </div>
  );
}
