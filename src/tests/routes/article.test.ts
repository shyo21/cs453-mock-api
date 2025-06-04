import request from 'supertest';
import express from 'express';
import router from '../../app/routes/article/article.controller'; // 실제 router 파일 경로로 수정
import * as articleService from '../../app/routes/article/article.service';

jest.mock('../../app/routes/article/article.service', () => ({
  getArticles: jest.fn().mockResolvedValue([{ slug: 'foo-article', title: 'Foo Title' }]),
  getFeed: jest.fn().mockResolvedValue([{ slug: 'feed-article', title: 'Feed Title' }]),
  createArticle: jest.fn().mockResolvedValue({ slug: 'new-article', title: 'New Article', body: 'Test Body' }),
  getArticle: jest.fn().mockResolvedValue({ slug: 'foo-article', title: 'Foo Title' }),
  updateArticle: jest.fn().mockResolvedValue({ slug: 'foo-article', title: 'Updated Title' }),
  deleteArticle: jest.fn().mockResolvedValue(undefined),
  getCommentsByArticle: jest.fn().mockResolvedValue([
    { id: 1, body: 'Test comment', author: { username: 'johndoe' } }
  ]),
  addComment: jest.fn().mockResolvedValue({ id: 2, body: 'Great article!', author: { username: 'janedoe' } }),
  deleteComment: jest.fn().mockResolvedValue(undefined),
  favoriteArticle: jest.fn().mockResolvedValue({ slug: 'fav-article', favorited: true }),
  unfavoriteArticle: jest.fn().mockResolvedValue({ slug: 'fav-article', favorited: false }),
}));

const fakeAuth = (userId = 1) => (req, res, next) => {
  req.auth = { user: { id: userId } };
  next();
};

describe('Article API', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  // GET /articles
  it('GET /articles returns articles list (unauthenticated, optional auth)', async () => {
    app.use('/', router);
    const res = await request(app).get('/articles');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ slug: 'foo-article', title: 'Foo Title' }]);
  });

  it('GET /articles error handling (service throws error)', async () => {
    jest.mocked(articleService.getArticles).mockRejectedValueOnce(new Error('Service failure'));
    app.use('/', router);
    app.use((err, req, res, next) => res.status(500).json({ error: err.message }));
    const res = await request(app).get('/articles');
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Service failure');
  });

  // GET /articles/feed
  it('GET /articles/feed requires authentication', async () => {
    app.use(fakeAuth(123));
    app.use('/', router);
    const res = await request(app).get('/articles/feed?offset=0&limit=5');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ slug: 'feed-article', title: 'Feed Title' }]);
  });

  it('GET /articles/feed returns 401 if not authenticated', async () => {
    app.use('/', router);
    app.use((err, req, res, next) => res.status(401).json({ error: 'Unauthorized' }));
    const res = await request(app).get('/articles/feed');
    expect(res.statusCode).toBe(401);
  });

  // POST /articles
  it('POST /articles creates a new article (authenticated, valid body)', async () => {
    app.use(fakeAuth(111));
    app.use('/', router);
    const res = await request(app)
      .post('/articles')
      .send({ article: { title: 'New Article', body: 'Test Body' } });
    expect(res.statusCode).toBe(201);
    expect(res.body.article.title).toBe('New Article');
    expect(res.body.article.body).toBe('Test Body');
  });

  it('POST /articles returns 400 on missing article body', async () => {
    app.use(fakeAuth(112));
    app.use('/', router);
    app.use((err, req, res, next) => res.status(400).json({ error: err.message }));
    const res = await request(app).post('/articles').send({});
    expect(res.statusCode).toBe(400);
  });

  // GET /articles/:slug
  it('GET /articles/:slug returns single article', async () => {
    app.use('/', router);
    const res = await request(app).get('/articles/foo-article');
    expect(res.statusCode).toBe(200);
    expect(res.body.article.slug).toBe('foo-article');
    expect(res.body.article.title).toBe('Foo Title');
  });

  it('GET /articles/:slug returns 404 if not found', async () => {
    jest.mocked(articleService.getArticle).mockResolvedValueOnce(null);
    app.use('/', router);
    app.use((err, req, res, next) => res.status(404).json({ error: 'Article not found' }));
    const res = await request(app).get('/articles/not-existing');
    expect(res.statusCode).toBe(404);
  });

  // PUT /articles/:slug
  it('PUT /articles/:slug updates an article (authenticated)', async () => {
    app.use(fakeAuth(222));
    app.use('/', router);
    const res = await request(app)
      .put('/articles/foo-article')
      .send({ article: { title: 'Updated Title' } });
    expect(res.statusCode).toBe(200);
    expect(res.body.article.slug).toBe('foo-article');
    expect(res.body.article.title).toBe('Updated Title');
  });

  it('PUT /articles/:slug returns 403 for unauthorized user', async () => {
    jest.mocked(articleService.updateArticle).mockImplementationOnce(() => { throw new Error('Forbidden'); });
    app.use(fakeAuth(999));
    app.use('/', router);
    app.use((err, req, res, next) => res.status(403).json({ error: 'Forbidden' }));
    const res = await request(app).put('/articles/foo-article').send({ article: { title: 'X' } });
    expect(res.statusCode).toBe(403);
  });

  // DELETE /articles/:slug
  it('DELETE /articles/:slug deletes an article (authenticated)', async () => {
    app.use(fakeAuth(333));
    app.use('/', router);
    const res = await request(app).delete('/articles/foo-article');
    expect(res.statusCode).toBe(204);
  });

  // GET /articles/:slug/comments
  it('GET /articles/:slug/comments gets article comments', async () => {
    app.use('/', router);
    const res = await request(app).get('/articles/foo-article/comments');
    expect(res.statusCode).toBe(200);
    expect(res.body.comments).toHaveLength(1);
    expect(res.body.comments[0].body).toBe('Test comment');
  });

  // POST /articles/:slug/comments
  it('POST /articles/:slug/comments adds a comment (authenticated)', async () => {
    app.use(fakeAuth(444));
    app.use('/', router);
    const res = await request(app)
      .post('/articles/foo-article/comments')
      .send({ comment: { body: 'Great article!' } });
    expect(res.statusCode).toBe(200);
    expect(res.body.comment.body).toBe('Great article!');
    expect(res.body.comment.author.username).toBe('janedoe');
  });

  it('POST /articles/:slug/comments returns 400 on missing comment body', async () => {
    app.use(fakeAuth(445));
    app.use('/', router);
    app.use((err, req, res, next) => res.status(400).json({ error: 'Missing comment body' }));
    const res = await request(app).post('/articles/foo-article/comments').send({});
    expect(res.statusCode).toBe(400);
  });

  // DELETE /articles/:slug/comments/:id
  it('DELETE /articles/:slug/comments/:id deletes a comment (authenticated)', async () => {
    app.use(fakeAuth(555));
    app.use('/', router);
    const res = await request(app).delete('/articles/foo-article/comments/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({});
  });

  // POST /articles/:slug/favorite
  it('POST /articles/:slug/favorite favorites an article (authenticated)', async () => {
    app.use(fakeAuth(666));
    app.use('/', router);
    const res = await request(app).post('/articles/fav-article/favorite');
    expect(res.statusCode).toBe(200);
    expect(res.body.article.favorited).toBe(true);
  });

  // DELETE /articles/:slug/favorite
  it('DELETE /articles/:slug/favorite unfavorites an article (authenticated)', async () => {
    app.use(fakeAuth(777));
    app.use('/', router);
    const res = await request(app).delete('/articles/fav-article/favorite');
    expect(res.statusCode).toBe(200);
    expect(res.body.article.favorited).toBe(false);
  });
});