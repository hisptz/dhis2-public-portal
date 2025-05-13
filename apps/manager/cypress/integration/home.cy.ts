import { appMenus } from "../../src/shared/constants/menu";

describe("home", () => {
	it("should display welcome header", () => {
		cy.visit("/");
		cy.get("h1")
			.contains("Welcome to the public portal manager!")
			.should("be.visible");
	});

	appMenus.forEach((menu) => {
		it(`should have a nav card with title ${menu.label} page, description, and link to ${menu.href}`, () => {
			// Click on the menu item
			cy.contains("h3", menu.label).should("be.visible");
			cy.contains("p", menu.description).should("be.visible");
			cy.contains("a", menu.action).should("be.visible");
			// Verify the page has an h2 header with the menu item label
		});
	});
});
