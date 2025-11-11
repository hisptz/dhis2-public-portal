
import { appMenus } from "../../src/shared/constants/menu"
describe("App Menu Section", () => {
	const appMenu = appMenus.find((menu) => menu.label === "Import/Export Configuration");

	if (!appMenu) {
		throw new Error("App Menu item not found in appMenus");
	}

	beforeEach(() => {
		cy.visit("/");
	});

    // should observe if the ui is visible
    it("should observe if the ui is visible", () => {
        cy.contains("a", appMenu.label).click();
        cy.get('.text-2xl').should("be.visible");  
        cy.get(':nth-child(1) > .mb-6 > .text-base').should("be.visible");
        cy.get(':nth-child(2) > .mb-6 > .text-base').should("be.visible");
        cy.get("button").contains("Export configurations to ZIP").should("be.visible");
    });

	it("should  export file", () => {
		cy.contains("a", appMenu.label).click();
		cy.get("button").contains("Export configurations to ZIP").click();
	});

});