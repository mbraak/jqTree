const getRect = (el) => el[0].getBoundingClientRect();

describe("JQtree", () => {
    before(() => {
        cy.visit("http://localhost:8080");
    });

    it("Displays the tree", () => {
        cy.contains("Saurischia").should("be.visible");
        cy.contains("Ornithischians").should("be.visible");
        cy.contains("Coelophysoids").should("be.not.visible");
        cy.compareSnapshot("display tree");
    });

    it("Selects an node", () => {
        cy.contains("Saurischia").click();
        cy.contains("li", "Saurischia").should("have.class", "jqtree-selected");
    });

    it("Opens a node", () => {
        cy.contains("Coelophysoids").should("not.be.visible");
        cy.contains(".jqtree-title", "Theropods")
            .prev(".jqtree-toggler")
            .click();
        cy.contains("Coelophysoids").should("be.visible");
    });
    it("Moves a node", () => {
        cy.contains(".jqtree-title", "Herrerasaurians")
            .then(getRect)
            .then((rect1) => {
                cy.contains(".jqtree-title", "Heterodontosaurids")
                    .should("be.visible")
                    .then(getRect)
                    .then((rect2) => [rect1, rect2]);
            })
            .then(([rect1, rect2]) => {
                cy.contains(".jqtree-title", "Herrerasaurians")
                    .trigger("mousedown", {
                        which: 1,
                        pageX: rect1.x,
                        pageY: rect1.y,
                    })
                    .trigger("mousemove", {
                        which: 1,
                        pageX: rect2.x,
                        pageY: rect2.y,
                    })
                    .trigger("mouseup");
            })
            .then(() => {
                cy.contains("li", "Herrerasaurians")
                    .should("not.have.class", "jqtree-moving")
                    .parents("li")
                    .first()
                    .contains("Heterodontosaurids");
            });
    });
});
