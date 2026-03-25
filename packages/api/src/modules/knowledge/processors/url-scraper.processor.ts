import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import axios from 'axios';

@Injectable()
export class UrlScraperProcessor {
  private readonly logger = new Logger(UrlScraperProcessor.name);

  /** Crawl a website starting from the given URL, following internal links */
  async scrapeWebsite(url: string, maxPages: number = 20): Promise<string> {
    const baseUrl = new URL(url);
    const visited = new Set<string>();
    const toVisit = [url];
    const allContent: string[] = [];

    while (toVisit.length > 0 && visited.size < maxPages) {
      const currentUrl = toVisit.shift()!;
      const normalized = this.normalizeUrl(currentUrl);
      if (visited.has(normalized)) continue;
      visited.add(normalized);

      try {
        this.logger.log(`Crawling (${visited.size}/${maxPages}): ${currentUrl}`);
        const { content, links } = await this.scrapePage(currentUrl);
        if (content) allContent.push(`--- Page: ${currentUrl} ---\n${content}`);

        // Add internal links to crawl queue
        for (const link of links) {
          try {
            const linkUrl = new URL(link, currentUrl);
            // Only follow same-domain links
            if (linkUrl.hostname === baseUrl.hostname && !visited.has(this.normalizeUrl(linkUrl.href))) {
              toVisit.push(linkUrl.href);
            }
          } catch { /* skip invalid URLs */ }
        }
      } catch (err: any) {
        this.logger.warn(`Failed to scrape ${currentUrl}: ${err.message}`);
      }
    }

    const fullContent = allContent.join('\n\n');
    this.logger.log(`Crawled ${visited.size} pages, ${fullContent.length} total characters`);

    if (!fullContent.length) {
      throw new Error('No text content found on the website');
    }
    return fullContent;
  }

  /** Scrape a single page — returns content and discovered links */
  async scrape(url: string): Promise<string> {
    const { content } = await this.scrapePage(url);
    if (!content.length) throw new Error('No text content found on the page');
    return content;
  }

  private async scrapePage(url: string): Promise<{ content: string; links: string[] }> {
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SayakChatBot/1.0)' },
      timeout: 30000,
      maxRedirects: 5,
      responseType: 'text',
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Collect internal links before cleaning
    const links: string[] = [];
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('javascript:')) {
        links.push(href);
      }
    });

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

    return { content, links };
  }

  private normalizeUrl(url: string): string {
    try {
      const u = new URL(url);
      return `${u.origin}${u.pathname}`.replace(/\/+$/, '');
    } catch {
      return url;
    }
  }
}
