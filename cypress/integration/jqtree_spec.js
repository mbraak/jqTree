describe("JQtree", () => {
    before(() => {
        cy.visit("http://localhost:8080");
    });

    it("Displays the tree", () => {
        cy.contains("Saurischia").should("be.visible");
        cy.contains("Ornithischians").should("be.visible");
        cy.contains("Coelophysoids").should("be.not.visible");
    });

    it("Selects an node", () => {
        cy.contains("Saurischia").click();
        cy.contains("li", "Saurischia").should("have.class", "jqtree-selected");
    });
});
