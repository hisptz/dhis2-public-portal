import { appMenus } from "../../src/shared/constants/menu";

describe("Navigation", () => {
	beforeEach(() => {
		cy.visit("/");
	});

	it("should have all menu items in the side navigation", () => {
		// Check if all menu items are visible in the side navigation
		appMenus.forEach((menu) => {
			cy.contains("a", menu.label).should("be.visible");
		});
	});

	appMenus.forEach((menu) => {
		it(`should navigate to ${menu.label} page and verify header`, () => {
			// Click on the menu item
			cy.contains("a", menu.label).click();

			// Verify URL matches the href
			cy.url().should("include", menu.href);

			// Verify the page has an h2 header with the menu item label
			cy.get("h2").contains(menu.label).should("be.visible");
		});
	});
});
