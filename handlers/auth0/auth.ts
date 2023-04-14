import jwt, {JwtPayload} from 'jsonwebtoken';
import { JwtRsaVerifier } from 'aws-jwt-verify';
import type {APIGatewayTokenAuthorizerHandler} from 'aws-lambda';
import {APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerEvent} from 'aws-lambda/trigger/api-gateway-authorizer';
const generatePolicy = (principalId: string, methodArn: string) => {
  const apiGatewayWildcard = methodArn.split('/', 2).join('/') + '/*';

  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: apiGatewayWildcard,
        },
      ],
    },
  };
};

const getAuthToken = (params: APIGatewayTokenAuthorizerEvent): string => {
  if (!params.type || params.type !== 'TOKEN') {
    throw new Error('Expected "event.type" parameter to have value "TOKEN"');
  }

  const tokenString = params.authorizationToken;
  if (!tokenString) {
    throw new Error('Expected "event.authorizationToken" parameter to be set');
  }
  const match = tokenString.match(/^Bearer (.*)$/);
  if (!match || match.length < 2) {
    throw new Error('Invalid Authorization token - token does not match "Bearer .*"');
  }
  return match[1];
};


const verifier = JwtRsaVerifier.create({
  audience: process.env.AUTH0_API_ID || '',
  issuer: process.env.AUTH0_DOMAIN || '',
  jwksUri: process.env.AUTH0_JWKS_URI || ''
});


// TODO: fix access this lambda to internet
const validateWithJwks = async (token: string): Promise<JwtPayload> => {
  const decoded = jwt.decode(token, {complete: true});
  if (!decoded || !decoded.header || !decoded.header.kid) {
    throw new Error('Auth token is invalid');
  }
  // TODO: timeout error
  // TODO: maybe need cache
  const claims = await verifier.verify(token) ;
  return claims as JwtPayload;
};


const validateWithPem = (token: string): JwtPayload => {
  const publicKey = process.env.AUTH0_PUBLIC_PEM || '';
  const claims = jwt.verify(token, publicKey);
  return claims as JwtPayload;
};
export const auth: APIGatewayTokenAuthorizerHandler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult>  => {
  try {

    const token = getAuthToken(event);
    // const claims = await validateWithJwks(token);
    const claims = validateWithPem(token);
    const policy = generatePolicy(claims?.sub || '', event.methodArn);

    return {
      ...policy,
      // context: claims
      context: {scope: claims.scope}
    };
  } catch (error) {
    console.log('AUTH ERROR =====>: ', error);
    throw 'Unauthorized';
  }
};
