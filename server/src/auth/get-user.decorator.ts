import {
    createParamDecorator,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { KeyPair } from 'near-api-js';

export const GetUser = createParamDecorator(
    (data, ctx: ExecutionContext): string => {
        const req = ctx.switchToHttp().getRequest();
        try {
            return KeyPair.fromString(req.body.privateKey)
                .getPublicKey()
                .toString();
        } catch (e) {
            throw new UnauthorizedException('Invalid private key');
        }
    },
);
