import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * Extracts the authenticated user's id from the request.
 * Throws 401 if the request is unauthenticated (defensive — JwtGuard
 * should have already rejected it).
 */
export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<{ user?: { userId?: string } }>();
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException();
    return userId;
  },
);
