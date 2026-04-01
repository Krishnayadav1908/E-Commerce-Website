const authMiddleware = require('../middleware/authMiddleware');
const { verifyAccessToken } = require('../utils/jwt');

jest.mock('../utils/jwt', () => ({
  verifyAccessToken: jest.fn(),
}));

describe('authMiddleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('returns 401 when authorization header is missing', () => {
    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token, authorization denied' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token is invalid', () => {
    req.headers.authorization = 'Bearer invalid-token';
    verifyAccessToken.mockImplementation(() => {
      throw new Error('bad token');
    });

    authMiddleware(req, res, next);

    expect(verifyAccessToken).toHaveBeenCalledWith('invalid-token');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token is not valid' });
    expect(next).not.toHaveBeenCalled();
  });

  it('sets req.user and calls next for valid token', () => {
    req.headers.authorization = 'Bearer good-token';
    verifyAccessToken.mockReturnValue({ userId: 'user-123' });

    authMiddleware(req, res, next);

    expect(verifyAccessToken).toHaveBeenCalledWith('good-token');
    expect(req.user).toBe('user-123');
    expect(next).toHaveBeenCalledTimes(1);
  });
});
