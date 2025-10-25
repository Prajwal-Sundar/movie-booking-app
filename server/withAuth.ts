import jwt from 'jsonwebtoken';
import { Role } from './models/user';

interface AuthOptions {
  roles?: Role[]; // allowed roles
}

export function withAuth(handler: Function, options?: AuthOptions) {
  return async (event: any, context: any) => {
    try {
      const authHeader = event.headers.authorization;
      if (!authHeader) {
        return { statusCode: 401, body: 'Unauthorized: No token' };
      }

      const token = authHeader.split(' ')[1];
      const user = jwt.verify(token, process.env.JWT_SECRET!) as any;

      // Role check
      if (options?.roles && !options.roles.includes(user.role)) {
        return { statusCode: 403, body: 'Forbidden: Insufficient role' };
      }

      // Attach user to event for use inside handler
      event.user = user;

      return await handler(event, context);
    } catch (err) {
      return { statusCode: 401, body: 'Unauthorized: Invalid token' };
    }
  };
}
