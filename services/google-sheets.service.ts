import { google } from 'googleapis';

export class GoogleSheetsService {
  private sheets;
  private spreadsheetId: string;

  constructor(spreadsheetId: string) {
    this.spreadsheetId = spreadsheetId;

    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!email || !privateKey) {
      throw new Error('Google Service Account credentials missing in environment variables');
    }

    const auth = new google.auth.JWT({
      email,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
  }

  async appendOverview(data: any) {
    try {
      const row = [
        new Date().toISOString().split('T')[0], // Date
        data.followerCount || 0,
        data.mediaCount || 0,
        data.totalViews || 0,
        data.totalInteractions || 0,
        data.profileViews || 0
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'RAW_OVERVIEW!A:F',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [row]
        }
      });
      console.log('Successfully appended overview to Google Sheets');
    } catch (e: any) {
      console.error('Google Sheets appendOverview error:', e.message);
      // We don't throw to prevent breaking the rest of the sync
    }
  }

  async updatePosts(posts: any[]) {
    try {
      // Clear existing RAW_POSTS and rewrite to keep it fresh
      try {
        await this.sheets.spreadsheets.values.clear({
          spreadsheetId: this.spreadsheetId,
          range: 'RAW_POSTS!A:H'
        });
      } catch (e) {
        // Ignore if sheet doesn't exist
      }

      const header = ['Post ID', 'Date', 'Type', 'Caption', 'Likes', 'Comments', 'Views', 'Permalink'];
      const rows = posts.map(p => [
        p.id,
        new Date(p.timestamp).toISOString().split('T')[0],
        p.mediaType,
        (p.caption || '').substring(0, 50),
        p.likeCount || 0,
        p.commentsCount || 0,
        p.viewCount || p.playCount || 0,
        p.permalink
      ]);

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'RAW_POSTS!A:H',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [header, ...rows]
        }
      });
      console.log('Successfully updated posts to Google Sheets');
    } catch (e: any) {
      console.error('Google Sheets updatePosts error:', e.message);
    }
  }
}
