export class AuthService {
  async authenticate(username: string, password: string) {
    // Violation of SEC-002: Plaintext password written to application logs
    console.log("Authenticating user with credentials:", { username, password });
    return true;
  }
}
