describe("JQtree", () => {
    before(() => {
        cy.visit("http://localhost:8080");
    });

    it("Displays the tree", () => {
        cy.contains("Saurischia");
        cy.contains("Ornithischians");
        cy.contains("Herrerasaurians").should("be.not.visible");
    });

    it("Selects an node", () => {
        cy.contains("Saurischia").click();
        cy.contains("li", "Saurischia").should("have.class", "jqtree-selected");
    });
});
