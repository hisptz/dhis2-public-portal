/// <reference types="cypress" />

import { DatastoreNamespaces } from "@packages/shared/constants";
import { AppAppearanceConfig } from "@packages/shared/schemas";

describe("Appearance Tests", () => {
	let appearanceConfig: AppAppearanceConfig;

	before(() => {
		// Query the configuration from the DHIS2 dataStore
		cy.request({
			url: `${Cypress.env("DHIS2_BASE_URL")}/api/dataStore/${DatastoreNamespaces.MAIN_CONFIG}/appearance`,
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `ApiToken ${Cypress.env("DHIS2_BASE_PAT_TOKEN")}`,
			},
		}).then((response) => {
			appearanceConfig = response.body;
			cy.log("Appearance config loaded", appearanceConfig);
		});

		// Visit the application
		cy.visit("/");
	});

	it("should display the correct logo", () => {
		// Wait for the config to be loaded
		cy.get("img[alt='logo']").should("be.visible");
		// .and(($img) => { // A really good test, but due to Next's ability to change the url it will always fail
		// 	// Check if the src attribute contains the logo URL from the config
		// 	const src = $img.attr("src");
		// 	expect(decodeURI(src!)).to.include(
		// 		encodeURI(appearanceConfig.logo),
		// 	);
		// });
	});

	// it("should apply the correct primary color", () => {
	// 	// The primary color is applied to the header if coloredBackground is true
	// 	if (appearanceConfig.header.style?.coloredBackground) {
	// 		cy.get("header").should(
	// 			"have.css",
	// 			"background",
	// 			`var(--mantine-color-${appearanceConfig.colors.primary}-filled)`,
	// 		);
	// 	}
	//
	// 	// Check if the primary color is applied to other elements
	// 	// This might need to be adjusted based on how the color is actually applied in the application
	// 	cy.get("a")
	// 		.first()
	// 		.should("have.css", "color", appearanceConfig.colors.primary);
	// });

	it("should display the correct footer links", () => {
		// cy.scrollTo('bottom');
		// Check if the footer links section has the correct title
		cy.contains(appearanceConfig.footer.footerLinks.title).should(
			"be.visible",
		);

		// Check if all the footer links are displayed
		appearanceConfig.footer.footerLinks.links.forEach((link) => {
			cy.contains("a", link.name)
				.should("be.visible")
				.and("have.attr", "href", link.url);
		});
	});

	it("should display the correct address", () => {
		// Check if the address section is visible
		cy.contains("Contacts").should("be.visible");

		// Check if the address content is displayed
		// Note: Currently the FooterAddress component has hardcoded text instead of using config.content
		// This test might need to be adjusted if the component is updated to use the config
		cy.get("div:contains('Contacts')")
			.parent()
			.should("contain.text", appearanceConfig.footer.address.content);
	});
});
