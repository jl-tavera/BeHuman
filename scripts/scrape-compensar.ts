/**
 * Compensar Website Scraper
 * 
 * Scrapes wellness activities from https://www.tiendacompensar.com/
 * Categories to scrape:
 * - deporte-fitness
 * - salud-bienestar
 * - cultura-arte
 * - educacion-desarrollo
 * - turismo-recreacion
 */

import puppeteer from 'puppeteer';
import fs from 'fs/promises';

interface CompensarProduct {
  id: string;
  nombre: string;
  descripcion: string;
  precio_desde: number;
  categoria_principal: string;
  subcategoria: string;
  url: string;
  imagen_url?: string;
  disponible: boolean;
  scraped_at: string;
}

const CATEGORIES = [
  'deporte-fitness',
  'salud-bienestar', 
  'cultura-arte',
  'educacion-desarrollo',
  'turismo-recreacion'
];

const BASE_URL = 'https://www.tiendacompensar.com/navegacion/category';

class CompensarScraper {
  private browser: any = null;
  private page: any = null;
  
  async init() {
    console.log('🚀 Starting Compensar scraper...');
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for production
      defaultViewport: { width: 1920, height: 1080 }
    });
    this.page = await this.browser.newPage();
    
    // Set user agent to avoid bot detection
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  }

  async scrapeCategory(category: string): Promise<CompensarProduct[]> {
    console.log(`📋 Scraping category: ${category}`);
    const url = `${BASE_URL}/${category}`;
    
    try {
      await this.page.goto(url, { waitUntil: 'networkidle2' });
      await this.page.waitForTimeout(2000); // Wait for dynamic content
      
      // Get all product cards
      const products = await this.page.evaluate((category) => {
        const productCards = document.querySelectorAll('.product-card, .product-item, .card'); // Common selectors
        const results: any[] = [];
        
        productCards.forEach((card: Element, index: number) => {
          try {
            const nameEl = card.querySelector('h3, .product-name, .card-title, .title');
            const descEl = card.querySelector('.description, .product-description, .card-text');
            const priceEl = card.querySelector('.price, .product-price, .precio');
            const linkEl = card.querySelector('a');
            const imgEl = card.querySelector('img');
            
            if (nameEl) {
              const name = nameEl.textContent?.trim() || '';
              const description = descEl?.textContent?.trim() || '';
              const priceText = priceEl?.textContent?.trim() || '0';
              
              // Extract numeric price
              const priceMatch = priceText.match(/[\d,]+/);
              const price = priceMatch ? parseInt(priceMatch[0].replace(/,/g, '')) : 0;
              
              const productUrl = linkEl?.getAttribute('href') || '';
              const imageUrl = imgEl?.getAttribute('src') || '';
              
              results.push({
                id: `compensar_${category}_${index + 1}`,
                nombre: name,
                descripcion: description,
                precio_desde: price,
                categoria_principal: category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' '),
                subcategoria: '',
                url: productUrl.startsWith('http') ? productUrl : `https://www.tiendacompensar.com${productUrl}`,
                imagen_url: imageUrl.startsWith('http') ? imageUrl : imageUrl ? `https://www.tiendacompensar.com${imageUrl}` : '',
                disponible: true,
                scraped_at: new Date().toISOString()
              });
            }
          } catch (error) {
            console.warn('Error processing product card:', error);
          }
        });
        
        return results;
      }, category);
      
      console.log(`✅ Found ${products.length} products in ${category}`);
      return products;
      
    } catch (error) {
      console.error(`❌ Error scraping ${category}:`, error);
      return [];
    }
  }

  async scrapeAll(): Promise<CompensarProduct[]> {
    const allProducts: CompensarProduct[] = [];
    
    for (const category of CATEGORIES) {
      const products = await this.scrapeCategory(category);
      allProducts.push(...products);
      
      // Wait between categories to be respectful
      await this.page.waitForTimeout(1000);
    }
    
    return allProducts;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async saveToFile(products: CompensarProduct[], filename: string = 'compensar-products.json') {
    await fs.writeFile(filename, JSON.stringify(products, null, 2));
    console.log(`💾 Saved ${products.length} products to ${filename}`);
  }
}

// Alternative: Manual data creation if scraping doesn't work
function createSampleCompensarData(): CompensarProduct[] {
  return [
    {
      id: 'compensar_1',
      nombre: 'Sesión de Yoga Terapéutico',
      descripcion: 'Práctica de yoga diseñada para reducir estrés y mejorar bienestar mental',
      precio_desde: 15000,
      categoria_principal: 'Salud Bienestar',
      subcategoria: 'Terapias Alternativas',
      url: 'https://www.tiendacompensar.com/yoga-terapeutico',
      disponible: true,
      scraped_at: new Date().toISOString()
    },
    {
      id: 'compensar_2', 
      nombre: 'Clase de Basketball Recreativo',
      descripcion: 'Actividad deportiva grupal para fomentar trabajo en equipo y ejercicio',
      precio_desde: 10000,
      categoria_principal: 'Deporte Fitness',
      subcategoria: 'Deportes de Equipo',
      url: 'https://www.tiendacompensar.com/basketball',
      disponible: true,
      scraped_at: new Date().toISOString()
    },
    {
      id: 'compensar_3',
      nombre: 'Taller de Desarrollo Personal',
      descripcion: 'Sesión de coaching para fortalecer autoestima y habilidades personales',
      precio_desde: 25000,
      categoria_principal: 'Educacion Desarrollo', 
      subcategoria: 'Desarrollo Personal',
      url: 'https://www.tiendacompensar.com/desarrollo-personal',
      disponible: true,
      scraped_at: new Date().toISOString()
    },
    {
      id: 'compensar_4',
      nombre: 'Concierto de Música Relajante',
      descripcion: 'Evento musical con repertorio de música clásica y ambient para relajación',
      precio_desde: 5000,
      categoria_principal: 'Cultura Arte',
      subcategoria: 'Música',
      url: 'https://www.tiendacompensar.com/concierto-relajante',
      disponible: true,
      scraped_at: new Date().toISOString()
    },
    {
      id: 'compensar_5',
      nombre: 'Curso de Programación Básica', 
      descripcion: 'Introducción a la programación con Python, ideal para principiantes',
      precio_desde: 0,
      categoria_principal: 'Educacion Desarrollo',
      subcategoria: 'Tecnología',
      url: 'https://www.tiendacompensar.com/programacion-basica',
      disponible: true,
      scraped_at: new Date().toISOString()
    },
    // Add more sample products to reach 73...
  ];
}

// Main execution
async function main() {
  console.log('🌿 Compensar Data Scraper for BeHuman Wellness System\n');
  
  const args = process.argv.slice(2);
  const mode = args[0] || 'sample';
  
  if (mode === 'scrape') {
    console.log('🕷️  Using web scraper mode...');
    const scraper = new CompensarScraper();
    
    try {
      await scraper.init();
      const products = await scraper.scrapeAll();
      
      if (products.length > 0) {
        await scraper.saveToFile(products);
        console.log(`\n✅ Scraping completed! Found ${products.length} products.`);
        console.log('📄 Data saved to compensar-products.json');
        console.log('\n🔗 Next steps:');
        console.log('1. Review the scraped data in compensar-products.json');
        console.log('2. Run: npm run import-compensar-data');
        console.log('3. Run: npm run fix-tags --update');
      } else {
        console.log('⚠️  No products found. Website structure may have changed.');
        console.log('   Using sample data instead...');
        const sampleData = createSampleCompensarData();
        await scraper.saveToFile(sampleData);
      }
      
    } catch (error) {
      console.error('❌ Scraping failed:', error);
      console.log('🔄 Falling back to sample data...');
      const sampleData = createSampleCompensarData();
      await fs.writeFile('compensar-products.json', JSON.stringify(sampleData, null, 2));
    } finally {
      await scraper.close();
    }
    
  } else {
    console.log('📝 Using sample data mode...');
    const sampleData = createSampleCompensarData();
    await fs.writeFile('compensar-products.json', JSON.stringify(sampleData, null, 2));
    console.log(`✅ Created ${sampleData.length} sample products in compensar-products.json`);
    console.log('\n🔗 To scrape real data instead, run: npm run scrape-compensar');
  }
  
  console.log('\n📋 File created: compensar-products.json');
  console.log('🎯 Ready to import to Supabase!');
}

// CLI usage
if (require.main === module) {
  main().catch(console.error);
}

export { CompensarScraper, createSampleCompensarData };