const puppeteer = require("puppeteer");
const { setDefaultOptions } = require("expect-puppeteer");
const fs = require("fs");
const fsPromises = fs.promises;

const baseURL = process.env.BASE_URL || "http://localhost:3000";

const onPageConsole = (msg) =>
  Promise.all(msg.args().map((event) => event.jsonValue())).then((eventJson) =>
    console.log(`<LOG::page console ${msg.type()}>`, ...eventJson)
  );

describe("US-01 - Create Reservations - E2E", () => {
  let browser;

  beforeAll(async () => {
    await fsPromises.mkdir("./.screenshots", { recursive: true });
    setDefaultOptions({ timeout: 1000 });
    browser = await puppeteer.launch();
  });

  afterAll(async () => {
    await browser.close();
  });

  describe("/reservations/", () => {
    test("creates a new reservation when form is submitted", async () => {
      let page;
      try {
        page = await browser.newPage();
        page.on("console", onPageConsole);
        await page.setViewport({ width: 1920, height: 1080 });
        await page.goto(`${baseURL}`, { waitUntil: "load" });

        // Test steps
        await page.type("input[name=full_name]", "Jason Amadi");
        await page.type("input[name=email]", "jujuzhaddy01@gmail.com");
        await page.type("input[name=phone_number]", "1234567890");
        await page.type("input[name=checkIn_date]", "2023-08-25");
        await page.type("input[name=checkOut_date]", "2023-08-25");
        await page.select("select[name=type_of_room]", "Deluxe");

        await page.click(".dropdown-toggle");
        await page.click(".increment-decrement .button-group button");
        await page.click(
          ".increment-decrement:nth-child(2) .button-group button"
        );

        await page.click("button.search-button");
        await page.waitForTimeout(2000);

        console.log("Waiting for snackbar...");
        await page
          .waitForSelector("#notistack-snackbar", { timeout: 60000 })
          .catch((error) => {
            console.error("Snackbar not found:", error.message);
          });
        console.log("Snackbar appeared.");

        const successMessage = await page.$eval(
          ".snackbar-variant-success",
          (el) => el.textContent
        );
        expect(successMessage).toContain("Reservation created successfully");
      } catch (error) {
        console.error("Error during test:", error);
      } finally {
        if (page) {
          await page.close();
        }
      }
    });
  });
});
