import { appMenus } from "../../src/shared/constants/menu";

describe("Appearance Page", () => {
	// Load fixtures
	let appColorConfig: any;
	let headerConfig: any;
	let footerConfig: any;
	let appearanceConfig: any;

	before(() => {
		cy.fixture("appColorConfig.json").then((config) => {
			appColorConfig = config;
		});
		cy.fixture("headerConfig.json").then((config) => {
			headerConfig = config;
		});
		cy.fixture("footerConfig.json").then((config) => {
			footerConfig = config;
		});
		cy.fixture("appearanceConfig.json").then((config) => {
			appearanceConfig = config;
		});
	});
	beforeEach(() => {
		cy.visit("/");
	});

	const appearanceMenu = appMenus.find((menu) => menu.label === "Appearance");

	if (!appearanceMenu) {
		throw new Error("Appearance menu item not found in appMenus");
	}

	it("should navigate to Appearance page via side navigation", () => {
		cy.contains("a", appearanceMenu.label).should("be.visible").click();
		cy.url().should("include", appearanceMenu.href);
		cy.get("h2, h3").contains(appearanceMenu.label).should("be.visible");
	});

	it("should display Appearance page UI elements", () => {
		cy.contains("a", appearanceMenu.label).click();

		// Verify that the AppColorConfig component is rendered
		cy.get('[data-test="configuration-title-Application colors"]')
			.should("contain.text", "Application colors")
			.and("be.visible");

		// Verify that the HeaderConfig component is rendered
		cy.contains(
			'[data-test="configuration-title-Header configuration"]',
			"Header configuration",
		).should("be.visible");

		// Verify that the FooterConfig component is rendered
		cy.contains(
			'[data-test="configuration-title-Footer configuration"]',
			"Footer configuration",
		).should("be.visible");
	});

	it("should open and close the color configuration modal", () => {
		cy.contains("a", appearanceMenu.label).click();
		// Find the section with Application colors
		cy.contains(
			'[data-test="configuration-title-Application colors"]',
			"Application colors",
		)
			.parent()
			.within(() => {
				// Click the Update button
				cy.contains("button", "Update").click();
			});
		cy.contains("Application Color Configurations").should("be.visible");
		cy.contains("button", "Cancel").click();
		cy.contains("Application Color Configurations").should("not.exist");
	});

	it("should edit color configurations", () => {
			cy.contains("a", appearanceMenu.label).click();

			// Open color configuration modal
			cy.contains("h3", "Application colors")
				.parent()
				.within(() => {
					cy.contains("button", "Update").click();
				});

			// Verify modal is open
			cy.contains("Application Color Configurations").should("be.visible");

			// Change primary color
			cy.get('input[type="color"][name="primary"]')
				.invoke("val", appColorConfig.primary)
				.trigger("change");

			// Change background color
			cy.get('input[type="color"][name="background"]')
				.invoke("val", appColorConfig.background)
				.trigger("change");

			// Save changes
	cy.get('[data-test="update-appearance-button"]').click();
			// Verify success message appears
			cy.contains("Color configurations updated successfully").should(
				"be.visible",
			);
		});

	// it("should edit header configurations", () => {
	// 	cy.contains("a", appearanceMenu.label).click();

	// 	// Open header configuration modal (click "Update" inside the "Header configuration" section)
	// 	cy.contains("h3", "Header configuration")
	// 		.parent()
	// 		.within(() => {
	// 			cy.contains("button", "Update").click();
	// 		});
	// 	// Verify modal is open
	// 	cy.get('[data-test="dhis2-uicore-modaltitle"]').should("be.visible");

	// 	// Edit title text
	// 	cy.get('input[name="header.title.text"]')
	// 		.clear()
	// 		.type(headerConfig.title.text);

	// 	// Edit subtitle text
	// 	cy.get('input[name="header.subtitle.text"]')
	// 		.clear()
	// 		.type(headerConfig.subtitle.text);

	// 	//should toggle the checkbox
	// 	cy.get('[data-test="dhis2-uicore-checkbox"]').parent().click();
	// 	//should untogle the checkbox
	// 	cy.get('[data-test="dhis2-uicore-checkbox"]').parent().click();

	// 	// should fill the width and height of the logo
	// 	cy.get('input[name="header.style.leadingLogo.width"]')
	// 		.clear()
	// 		.type(headerConfig.style.leadingLogo.width.toString());
	// 	cy.get('input[name="header.style.leadingLogo.height"]')
	// 		.clear()
	// 		.type(headerConfig.style.leadingLogo.height.toString());

	// 	//click the dropdown button
	// 	cy.get(".flex > span").click();

	// 	//change the size of trailing logo both height and width
	// 	cy.get('input[name="header.style.trailingLogo.width"]')
	// 		.clear()
	// 		.type(headerConfig.style.trailingLogo.width.toString());
	// 	cy.get('input[name="header.style.trailingLogo.height"]')
	// 		.clear()
	// 		.type(headerConfig.style.trailingLogo.height.toString());

	// 	// toggle  colored background
	// 	cy.get('input[name="header.style.coloredBackground"]').parent().click();

	// 	// Edit container height
	// 	cy.get('input[name="header.style.containerHeight"]')
	// 		.clear()
	// 		.type(headerConfig.style.containerHeight.toString());

	// 	//to change syle for title style
	// 	cy.get('input[name="header.title.style.textSize"]')
	// 		.clear()
	// 		.type(headerConfig.title.style.textSize.toString());
	// 	cy.get('input[name="header.title.style.textColor"]').type(
	// 		headerConfig.title.style.textColor,
	// 	);

	// 	// to input according to data test
	// 	cy.get('[data-test="header-style-align-input-header.title.style"]').click();
	// 	cy.get('#filter').type("right");
	// 	cy.get('[data-test="dhis2-uicore-singleselectoption"]').contains("Right").click();

	// 	//to change style for subtitle style

	// 	// this should be similar as on header title style

	// 	cy.get('[data-test="header-style-align-input-header.subtitle.style"]').click();
	// 	cy.get('#filter').type("left");
	// 	cy.get('[data-test="dhis2-uicore-singleselectoption"]').contains("Left").click();
	// 	cy.get('.active > .content').click();
	// 	// i should add scroll to the bottom of the page
	// 	cy.get('input[name="header.subtitle.style.textSize"]').clear().type(headerConfig.subtitle.style.textSize.toString());
	// 	cy.get('input[name="header.subtitle.style.textColor"]').type(
	// 		headerConfig.subtitle.style.textColor,
	// 	);

	// 	cy.get('[data-test="dhis2-uicore-button"]').contains("Update").click();
	// 	cy.contains("Header configurations updated successfully").should("be.visible");
	// 	cy.contains("Header Configurations").should("not.exist");

	// 	// Save changes (if not disabled)
	// });

	it("should edit footer configurations for static content", () => {
		cy.contains("a", appearanceMenu.label).click();

		// Open footer configuration modal
		cy.get('[data-test="configuration-title-Footer configuration"]')
			.parent()
			.within(() => {
				cy.contains("button", "Update").click();
			});

		cy.contains("Footer configurations").should("be.visible");
		const staticItem = footerConfig.footerItems.find(item => item.type === 'static');
		if (staticItem) {
			// Click "Add Footer Item" button
			cy.get('[data-test="add-footer-item-button"]').should('exist').click();

			// Fill in title
			cy.get('[name="title"]').should('be.visible').type(staticItem.title);
			cy.get('[data-test="dhis2-uicore-select-input"]').should('be.visible').click();
			cy.contains("Static Content").click();
			cy.get('.jodit-wysiwyg').should('be.visible').type(staticItem.staticContent);
			cy.get('[data-test="footer-item-add-button"]').should('be.visible').click();
			cy.get('[data-test="footer-config-update-button"]').should('be.visible').click();
		}

	});

	it("should edit footer configurations for links", () => {
		cy.contains("a", appearanceMenu.label).click();

		// Open footer configuration modal
		cy.get('[data-test="configuration-title-Footer configuration"]')
			.parent()
			.within(() => {
				cy.contains("button", "Update").click();
			});

		cy.contains("Footer configurations").should("be.visible");

		const linkItem = footerConfig.footerItems.find(item => item.type === 'links');

		if (linkItem) {
			// Click "Add Footer Item" button
			cy.get('[data-test="add-footer-item-button"]').should('exist').click();

			// Fill in title and type
			cy.get('[name="title"]').should('be.visible').type(linkItem.title);
			cy.get('[data-test="dhis2-uicore-select-input"]').should('be.visible').click();
			cy.get('[data-value="links"]').click();

			// Add each link from the array
			linkItem.links.forEach(({ name, url }) => {
				cy.get('[data-test="add-footer-link-button"]').click();
				cy.get('#name').should('be.visible').clear().type(name);
				cy.get('#url').should('be.visible').clear().type(url);
				cy.get('[data-test="footer-link-add-button"]').click();
			});

			cy.get('[data-test="footer-item-add-button"]')
			// Save footer item and update the config
			cy.get('[data-test="footer-item-add-button"]').should('be.visible').click();
			cy.get('[data-test="footer-config-update-button"]').should('be.visible').click();
		}
	});


});
