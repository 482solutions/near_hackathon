import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "./user.entity";
import { KeyPair } from 'near-api-js';

export const GetUser = createParamDecorator((data, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest();
    const keyPair = KeyPair.fromString(req.body.privateKey);
    return keyPair.getPublicKey().toString();
});
