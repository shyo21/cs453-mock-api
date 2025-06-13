import request from 'supertest';
import { app } from './app'; // Assume your Express app is exported here

describe('Articles API', () => {
  // Helper to test GET endpoints with query params
  const testGetArticles = async (params = {}) => {
    const res = await request(app)
      .get('/articles')
      .query(params);
    return res;
  };

  // Helper to test POST /articles
  const testCreateArticle = async (body = {}) => {
    const res = await request(app)
      .post('/articles')
      .send(body);
    return res;
  };

  // Helper to test GET /articles/feed
  const testGetFeed = async (params = {}) => {
    const res = await request(app)
      .get('/articles/feed')
      .query(params);
    return res;
  };

  // Helper to test GET article by slug
  const testGetArticle = async (slug, params = {}) => {
    const res = await request(app)
      .get(`/articles/${slug}`)
      .query(params);
    return res;
  };

  // Helper to test PUT /articles/:slug
  const testUpdateArticle = async (slug, body = {}) => {
    const res = await request(app)
      .put(`/articles/${slug}`)
      .send(body);
    return res;
  };

  // Helper to test DELETE /articles/:slug
  const testDeleteArticle = async (slug) => {
    const res = await request(app)
      .delete(`/articles/${slug}`);
    return res;
  };

  // Helper to test GET comments
  const testGetComments = async (slug, params = {}) => {
    const res = await request(app)
      .get(`/articles/${slug}/comments`)
      .query(params);
    return res;
  };

  // Helper to test POST comment
  const testPostComment = async (slug, body = {}) => {
    const res = await request(app)
      .post(`/articles/${slug}/comments`)
      .send(body);
    return res;
  };

  // Helper to test DELETE comment
  const testDeleteComment = async (slug, commentId) => {
    const res = await request(app)
      .delete(`/articles/${slug}/comments/${commentId}`);
    return res;
  };

  // Helper to test favorite/unfavorite
  const testFavoriteArticle = async (slug, method = 'POST') => {
    const res = await request(app)
      [method](`/articles/${slug}/favorite`);
    return res;
  };

  // ✅ Test GET /articles
  describe('GET /articles', () => {
    test('should return paginated articles with default offset and limit', async () => {
      const res = await testGetArticles();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('articles');
    });

    test('should return articles with offset and limit', async () => {
      const res = await testGetArticles({ offset: '1', limit: '10' });
      expect(res.status).toBe(200);
    });

    test('should filter by tag', async () => {
      const res = await testGetArticles({ tag: 'tech' });
      expect(res.status).toBe(200);
    });

    test('should filter by author', async () => {
      const res = await testGetArticles({ author: 'john' });
      expect(res.status).toBe(200);
    });

    test('should filter by favorited', async () => {
      const res = await testGetArticles({ favorited: 'true' });
      expect(res.status).toBe(200);
    });

    test('should return 400 for invalid query parameters', async () => {
      const res = await testGetArticles({ offset: 'abc' });
      expect(res.status).toBe(400);
    });
  });

  // ✅ Test POST /articles
  describe('POST /articles', () => {
    test('should create a new article with valid body', async () => {
      const res = await testCreateArticle({
        title: 'Test Article',
        description: 'A test article',
        body: 'This is the body of the article',
        author: 'testuser',
        tagList: ['tech', 'test'],
      });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('article');
    });

    test('should return 400 for missing title', async () => {
      const res = await testCreateArticle({ description: 'A test article' });
      expect(res.status).toBe(400);
    });

    test('should return 400 for invalid JSON body', async () => {
      const res = await testCreateArticle({ title: 'Invalid JSON' });
      expect(res.status).toBe(400);
    });
  });

  // ✅ Test GET /articles/feed
  describe('GET /articles/feed', () => {
    test('should return articles from the feed', async () => {
      const res = await testGetFeed();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('articles');
    });

    test('should return 401 for unauthorized access', async () => {
      const res = await testGetFeed();
      expect(res.status).toBe(401); // Assuming auth is required
    });
  });

  // ✅ Test GET /articles/:slug
  describe('GET /articles/:slug', () => {
    test('should return an article by slug', async () => {
      const res = await testGetArticle('test-slug');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('article');
    });

    test('should return 404 for invalid slug', async () => {
      const res = await testGetArticle('invalid-slug');
      expect(res.status).toBe(404);
    });
  });

  // ✅ Test PUT /articles/:slug
  describe('PUT /articles/:slug', () => {
    test('should update an article with valid data', async () => {
      const res = await testUpdateArticle('test-slug', {
        title: 'Updated Title',
        body: 'Updated body content',
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('article');
    });

    test('should return 404 for invalid slug', async () => {
      const res = await testUpdateArticle('invalid-slug', { title: 'New Title' });
      expect(res.status).toBe(404);
    });

    test('should return 400 for missing required fields', async () => {
      const res = await testUpdateArticle('test-slug', { title: 'New Title' });
      expect(res.status).toBe(400);
    });
  });

  // ✅ Test DELETE /articles/:slug
  describe('DELETE /articles/:slug', () => {
    test('should delete an article by slug', async () => {
      const res = await testDeleteArticle('test-slug');
      expect(res.status).toBe(204);
    });

    test('should return 404 for invalid slug', async () => {
      const res = await testDeleteArticle('invalid-slug');
      expect(res.status).toBe(404);
    });
  });

  // ✅ Test GET /articles/:slug/comments
  describe('GET /articles/:slug/comments', () => {
    test('should return comments for an article', async () => {
      const res = await testGetComments('test-slug');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('comments');
    });

    test('should return 404 for invalid slug', async () => {
      const res = await testGetComments('invalid-slug');
      expect(res.status).toBe(404);
    });
  });

  // ✅ Test POST /articles/:slug/comments
  describe('POST /articles/:slug/comments', () => {
    test('should create a comment for an article', async () => {
      const res = await testPostComment('test-slug', {
        body: 'This is a test comment',
      });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('comment');
    });

    test('should return 404 for invalid slug', async () => {
      const res = await testPostComment('invalid-slug', { body: 'Test comment' });
      expect(res.status).toBe(404);
    });

    test('should return 400 for missing body', async () => {
      const res = await testPostComment('test-slug', {});
      expect(res.status).toBe(400);
    });
  });

  // ✅ Test DELETE /articles/:slug/comments/:id
  describe('DELETE /articles/:slug/comments/:id', () => {
    test('should delete a comment by ID', async () => {
      const res = await testDeleteComment('test-slug', '1');
      expect(res.status).toBe(204);
    });

    test('should return 404 for invalid slug or comment ID', async () => {
      const res = await testDeleteComment('invalid-slug', '1');
      expect(res.status).toBe(404);
    });
  });

  // ✅ Test POST /articles/:slug/favorite
  describe('POST /articles/:slug/favorite', () => {
    test('should favorite an article', async () => {
      const res = await testFavoriteArticle('test-slug');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('article');
    });

    test('should return 404 for invalid slug', async () => {
      const res = await testFavoriteArticle('invalid-slug');
      expect(res.status).toBe(404);
    });
  });

  // ✅ Test DELETE /articles/:slug/favorite
  describe('DELETE /articles/:slug/favorite', () => {
    test('should unfavorite an article', async () => {
      const res = await testFavoriteArticle('test-slug', 'DELETE');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('article');
    });

    test('should return 404 for invalid slug', async () => {
      const res = await testFavoriteArticle('invalid-slug', 'DELETE');
      expect(res.status).toBe(404);
    });
  });
});