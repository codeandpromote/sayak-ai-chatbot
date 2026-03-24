import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';

@Injectable()
export class UrlScraperProcessor {
  private readonly logger = new Logger(UrlScraperProcessor.name);

  async scrape(url: string): Promise<string> {
    this.logger.log(`Scraping URL: ${url}`);

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SayakChatBot/1.0)' },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove non-content elements
    $('script, style, nav, header, footer, iframe, noscript, svg, form').remove();
    $('[role="navigation"], [role="banner"], [role="contentinfo"]').remove();
    $('.sidebar, .menu, .nav, .footer, .header, .ad, .advertisement').remove();

    // Extract main content
    let content = '';
    const mainContent = $('main, article, [role="main"], .content, .post-content, .entry-content');
    if (mainContent.length > 0) {
      content = mainContent.first().text();
    } else {
      content = $('body').text();
    }

    content = content.replace(/\s+/g, ' ').replace(/\n\s*\n/g, '\n').trim();
    this.logger.log(`Scraped ${content.length} characters from ${url}`);
    return content;
  }
}
