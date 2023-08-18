const puppeteer = require("puppeteer");
const { setDefaultOptions } = require("expect-puppeteer");
const fs = require("fs");
const fsPromises = fs.promises;

const baseURL = process.env.BASE_URL || "http://localhost:3000";

const onPageConsole = (msg) =>
  Promise.all(msg.args().map((event) => event.jsonValue())).then((eventJson) =>
    console.log(`<LOG::page console ${msg.type()}>`, ...eventJson)
  );

describe("US-02 - Check Reservations - E2E", () => {
  let page;
  let browser;

  beforeAll(async () => {
    await fsPromises.mkdir("./.screenshots", { recursive: true });
    setDefaultOptions({ timeout: 1000 });
  });

  beforeEach(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    page.on("console", onPageConsole);
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(`${baseURL}/user-management`, { waitUntil: "load" });
  });

  afterEach(async () => {
    await browser.close();
  });

  describe("/user-management", () => {
    test("displays an error message if search results are empty", async () => {
      await page.type("input[name=name]", "John");
      await page.type("input[name=number]", "1234567890");

      await page.screenshot({
        path: ".screenshots/us-02-empty-results-before.png",
      });

      await page.click(".btn-booknow");

      await page.screenshot({
        path: ".screenshots/us-02-empty-results-after.png",
      });
    });

    test("displays search results when reservations are found", async () => {
      const responseMock = [
        { full_name: "John Doe", phone_number: "1234567890" },
      ];

      jest.spyOn(page, "$$").mockResolvedValue([responseMock]);

      await page.type("input[name=name]", "John");
      await page.type("input[name=number]", "1234567890");

      await page.screenshot({
        path: ".screenshots/us-02-search-results-before.png",
      });

      await page.click(".btn-booknow");

      await page.screenshot({
        path: ".screenshots/us-02-search-results-after.png",
      });

      const searchResults = await page.$$(".reservation-list");
      expect(searchResults.length).toBeGreaterThan(0);
    });
  });
});
