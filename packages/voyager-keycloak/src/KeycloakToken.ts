// This function is taken directly from Keycloak's connector
// here: https://github.com/keycloak/keycloak-nodejs-connect/blob/16a603656ce9ad31d9026dd8531edc295e573fd9/middleware/auth-utils/token.js#L34-L46
// Keycloak does not export any Token logic

export function getTokenObject(token: string): KeycloakToken {
  let fullToken: KeycloakToken = {}
  if (token) {
    try {
      const parts = token.split('.')
      fullToken = {
        header: JSON.parse(Buffer.from(parts[0], 'base64').toString()),
        content: JSON.parse(Buffer.from(parts[1], 'base64').toString()),
        signature: Buffer.from(parts[2], 'base64'),
        signed: parts[0] + '.' + parts[1],
        isExpired: () => {
          return ((fullToken.content.exp * 1000) < Date.now())
        }
      }
    } catch (err) {
      fullToken.content = {
        exp: 0
      }
    }
  }
  return fullToken
}

interface KeycloakToken {
  header?: any,
  content?: any,
  signature?: any,
  signed?: string,
  isExpired?: () => boolean
}
