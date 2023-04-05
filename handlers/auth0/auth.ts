import jwt, {JwtPayload, Secret} from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import util from 'util';
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

const client = jwksClient({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
  jwksUri: process.env.AUTH0_JWKS_URI || ''
});

interface ISingingKeys {
  publicKey?: string;
  rsaPublicKey?: string;
}


export const auth: APIGatewayTokenAuthorizerHandler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult>  => {
  const token = getAuthToken(event);
  const decoded = jwt.decode(token, {complete: true});
  if (!decoded || !decoded.header || !decoded.header.kid) {
    throw new Error('Auth token is invalid');
  }
  try {
    const getSigningKey = util.promisify(client.getSigningKey);
    const signingKeys = await getSigningKey(decoded.header.kid) as ISingingKeys;
    const signingKey = (signingKeys.publicKey || signingKeys.rsaPublicKey) as Secret;
    const jwtOptions = {
      audience: process.env.AUTH0_API_ID,
      issuer: process.env.AUTH0_DOMAIN
    };
    const claims = (jwt.verify(token, signingKey, jwtOptions)) as JwtPayload;
    const policy = generatePolicy(claims?.sub || '', event.methodArn);

    return {
      ...policy,
      // context: claims
      context: {scope: claims.scope}
    };
  } catch (error) {
    console.log(error);
    throw 'Unauthorized';
  }
};
