const puppeteer = require("puppeteer");
const { setDefaultOptions } = require("expect-puppeteer");
const fs = require("fs");
const fsPromises = fs.promises;

const baseURL = process.env.BASE_URL || "http://localhost:3000";

const onPageConsole = (msg) =>
  Promise.all(msg.args().map((event) => event.jsonValue())).then((eventJson) =>
    console.log(`<LOG::page console ${msg.type()}>`, ...eventJson)
  );

describe("Fetch Reservations - E2E", () => {
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
    await page.goto(`${baseURL}/admin/reservation-records`, {
      waitUntil: "load",
    });
  });

  afterEach(async () => {
    await browser.close();
  });

  test("displays fetched reservations correctly", async () => {
    const responseMock = [
      {
        reservation_id: 1,
        full_name: "John Doe",
        checkIn_date: "2023-08-15",
        checkOut_date: "2023-08-20",
      },
      // Add more mock reservation records as needed
    ];

    jest.spyOn(page, "$$").mockResolvedValue([responseMock]);
  });
});
