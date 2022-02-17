import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const GetUser = createParamDecorator((data, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest();
    if (!req.body.hasOwnProperty('userId') && !req.cookies['userId']) {
        throw new UnauthorizedException('The request must contain userId');
    }
    return req.body.userId || req.cookies['userId'];
});
