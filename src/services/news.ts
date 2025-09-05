
export type NewsArticle = {
  source: {
    name: string;
  };
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  category?: string;
};

const API_KEY = 'fee27200baf64ea482524e9e28d3ed59';
const keywords = ["disaster", "earthquake", "flood", "cyclone", "storm", "tsunami", "landslide", "wildfire", "hurricane", "volcano", "heatwave", "drought", "weather"];

function getNewsCategory(article: Omit<NewsArticle, 'category'>): string | undefined {
    const content = `${article.title.toLowerCase()} ${article.description.toLowerCase()}`;
    const foundKeyword = keywords.find(keyword => content.includes(keyword));
    if (foundKeyword) {
      if (foundKeyword === 'weather') return 'Weather Alert';
      return foundKeyword.charAt(0).toUpperCase() + foundKeyword.slice(1);
    }
    return undefined;
}

export async function fetchNews(query: string, pageSize: number = 3): Promise<NewsArticle[]> {
  const queryTerms = query.toLowerCase().split(' ').filter(term => keywords.includes(term));
  const searchQuery = queryTerms.length > 0 ? queryTerms.join(' OR ') : keywords.join(' OR ');

  const NEWS_API_URL = `https://newsapi.org/v2/everything?q=${searchQuery}&sortBy=publishedAt&language=en&pageSize=20&apiKey=${API_KEY}`;
  
  try {
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const res = await fetch(`${proxyUrl}${encodeURIComponent(NEWS_API_URL)}`);
    if (!res.ok) {
      const errorText = await res.text();
      console.error('NewsAPI Error Response:', errorText);
      throw new Error(`NewsAPI request failed with status ${res.status}`);
    }
    const data = await res.json();
    
    if (!data.articles) return [];
    
    const validArticles = data.articles.filter(
        (article: NewsArticle) => article.urlToImage && article.description && article.title && article.source.name !== '[Removed]'
    );

    const categorizedArticles: NewsArticle[] = [];
    for (const article of validArticles) {
        const category = getNewsCategory(article);
        if (category) {
            categorizedArticles.push({ ...article, category });
        }
    }
    return categorizedArticles.slice(0, pageSize);

  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
}
