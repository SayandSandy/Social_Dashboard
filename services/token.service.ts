import { InstagramService } from './instagram.service';

export class TokenService {
  private igService: InstagramService;

  constructor(token: string, businessAccountId: string) {
    this.igService = new InstagramService(token, businessAccountId);
  }

  async refreshLongLivedToken() {
    return this.igService.refreshToken();
  }
}
