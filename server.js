const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const cron = require("node-cron");
const url = "https://www.dzrt.com/en/our-products.html";

const getProductData = async () => {
  
  try {
    
    const browser = await puppeteer.launch({
      headless: true, 
      args: ["--no-sandbox", "--disable-setuid-sandbox"], 
    });
    const page = await browser.newPage();

    console.log("Navigating to the URL...");
    await page.goto(url, { waitUntil: "networkidle2" }); 

    console.log("Waiting for the product list to load...");
    await page.waitForSelector("li.item.product.product-item"); 

    const html = await page.content();
    const $ = cheerio.load(html);

    const product_data = [];


    $("li.item.product.product-item.unavailable").each(
      (index, element) => {
        const title = $(element).find(".product-item-name a").text().trim();
        const availability = $(element)
          .find(".product.actions .stock")
          .text()
          .trim();
        const imageUrl = $(element).find(".product-image-photo").attr("src");

        product_data.push({ title, availability, imageUrl });
      }
    );

    console.log("Scraped product data:", product_data);

    await browser.close();
  } catch (err) {
    console.error("Error fetching or parsing data:", err);
  }
};

cron.schedule("* * * * *", () => {
  console.log("Running cron job...");
  getProductData();
});

console.log("Cron job scheduled. Waiting for the next run...");
