describe("tree", () => {
    beforeAll(async () => {
        await page.goto("http://localhost:8080");
    });

    it("selects a node", async () => {
        await expect(page).toMatch("Saurischia");

        //
    });
});
