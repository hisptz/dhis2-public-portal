import { appMenus } from "../../src/shared/constants/menu";

describe("Appearance Page", () => {	let appColorConfig: any;
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

	//This is done
	it("It should  show the appearance page UI elements", () => {
		cy.contains("a", appearanceMenu.label).click();
		//should observe the color config is shown
		cy.get('[data-test="configuration-title-Application colors"]').should(
			"be.visible",
		);
		cy.get('[data-test="configuration-title-Header configuration"]').should(
			"be.visible",
		);
		cy.get('[data-test="configuration-title-Footer configuration"]').should(
			"be.visible",
		);
	});

	it("It should open the color configuration modal and close it", () => {
		cy.contains("a", appearanceMenu.label).click();
		cy.get('[data-test="configuration-title-Application colors"]')
			.should("be.visible")
			.click();
		cy.get('[data-test="update-app-color-button"]')
			.should("be.visible")
			.click();

		cy.get('[data-test="dhis2-uicore-modaltitle"]').should("be.visible");
		cy.get('[data-test="dhis2-uicore-button"]').contains("Cancel").click();
		cy.get('[data-test="dhis2-uicore-modaltitle"]').should("not.exist");
	});

	it("It should add primary color and background color and update the colors", () => {
		cy.contains("a", appearanceMenu.label).click();
		cy.get('[data-test="configuration-title-Application colors"]')
			.should("be.visible")
			.click();
		cy.get('[data-test="update-app-color-button"]')
			.should("be.visible")
			.click();
		cy.get('input[name="primary"]')
			.should("be.visible")
			.type(appColorConfig.primary);
		cy.get('input[name="background"]')
			.should("be.visible")
			.type(appColorConfig.background);
		cy.get('[data-test="update-appearance-button"]')
			.should("be.visible")
			.click();
	});

	it("It should add chart colors and update the colors", () => {
		cy.contains("a", appearanceMenu.label).click();
		cy.get('[data-test="configuration-title-Application colors"]')
			.should("be.visible")
			.click();
		cy.get('[data-test="update-app-color-button"]')
			.should("be.visible")
			.click();
		cy.get('[data-test="add-color-button"]').should("be.visible").click();
		cy.get(':nth-child(2) > [data-test="dhis2-uicore-button"]')
			.should("be.visible")
			.click();
		cy.get('[data-test="update-appearance-button"]')
			.should("be.visible")
			.click();
	});

	it("It should ensure the modal for header configuration is open and closed", () => {
		cy.contains("a", appearanceMenu.label).click();
		cy.get('[data-test="configuration-title-Header configuration"]')
			.should("be.visible")
			.click();
		cy.get('[data-test="update-header-button"]')
			.should("be.visible")
			.click();
		cy.get('[data-test="dhis2-uicore-modaltitle"]').should("be.visible");
		cy.get('[data-test="dhis2-uicore-button"]').contains("Cancel").click();
		cy.get('[data-test="dhis2-uicore-modaltitle"]').should("not.exist");
	});

	it("It should update the header configuration", () => {
		cy.contains("a", appearanceMenu.label).click();
		cy.get('[data-test="configuration-title-Header configuration"]')
			.should("be.visible")
			.click();
		cy.get('[data-test="update-header-button"]');
		cy.get('[data-test="update-header-button"]').click();
		cy.get('[data-test="dhis2-uicore-modaltitle"]').should("be.visible");
		cy.get('input[name="header.title.text"]')
			.clear()
			.type(headerConfig.title.text);
		cy.get('input[name="header.subtitle.text"]')
			.clear()
			.type(headerConfig.subtitle.text);
		cy.get('[data-test="toggle-logo-checkbox"]').click();
		cy.get('[data-test="toggle-logo-checkbox"]').click();
		cy.get('input[name="header.style.leadingLogo.width"]')
			.clear()
			.type(headerConfig.style.leadingLogo.width.toString());
		cy.get('input[name="header.style.leadingLogo.height"]')
			.clear()
			.type(headerConfig.style.leadingLogo.height.toString());
		cy.get(".flex > span").click();
		cy.get('input[name="header.style.trailingLogo.show"]').click();

		cy.get('input[name="header.style.trailingLogo.width"]')
			.clear()
			.type(headerConfig.style.trailingLogo.width.toString());
		cy.get('input[name="header.style.trailingLogo.height"]')
			.clear()
			.type(headerConfig.style.trailingLogo.height.toString());

		cy.get('input[name="header.style.containerHeight"]')
			.clear()
			.type(headerConfig.style.containerHeight.toString());
		cy.get('input[name="header.title.style.textSize"]')
			.clear()
			.type(headerConfig.title.style.textSize.toString());
		cy.get('input[name="header.title.style.textColor"]').type(
			headerConfig.title.style.textColor,
		);
		cy.get(
			'[data-test="header-style-align-input-header.title.style"]',
		).click();
		cy.get("#filter").type("right");
		cy.get('[data-test="dhis2-uicore-singleselectoption"]')
			.contains("Right")
			.click();

		cy.get('input[name="header.subtitle.style.textSize"]')
			.clear()
			.type(headerConfig.subtitle.style.textSize.toString());
		cy.get('input[name="header.subtitle.style.textColor"]').type(
			headerConfig.subtitle.style.textColor,
		);
		cy.get(
			'[data-test="header-style-align-input-header.subtitle.style"]',
		).click();
		cy.get("#filter").type("Center");
		cy.get('[data-test="dhis2-uicore-singleselectoption"]')
			.contains("Center")
			.click();
	});

	it("should edit footer configurations for static content", () => {
		cy.contains("a", appearanceMenu.label).click();

		cy.get('[data-test="configuration-title-Footer configuration"]')
			.parent()
			.within(() => {
				cy.contains("button", "Update").click();
			});

		const staticItem = footerConfig.footerItems.find(
			(item) => item.type === "static",
		);
		if (staticItem) {
			cy.get('[data-test="add-footer-item-button"]')
				.should("exist")
				.click();

			cy.get('[name="title"]')
				.should("be.visible")
				.type(staticItem.title);
			cy.get('[data-test="dhis2-uicore-select-input"]')
				.should("be.visible")
				.click();
			cy.contains("Static Content").click();
			cy.get(".jodit-wysiwyg")
				.should("be.visible")
				.type(staticItem.staticContent);
			cy.get('[data-test="footer-item-add-button"]')
				.should("be.visible")
				.click();
			cy.get('[data-test="footer-config-update-button"]')
				.should("be.visible")
				.click();
		}
	});

	//this is done
	it("It should update the static content configuration", () => {
		cy.contains("a", appearanceMenu.label).click();
		cy.get('[data-test="configuration-title-Footer configuration"]')
			.should("be.visible")
			.click();
		cy.get('[data-test="dhis2-uicore-button"]').click();
		const newTitle = "Company Address For Testing";
		const updatedTitle = "Company Address For Testing Updated";
		const updatedContent = "Company Address For Testing Updated Content";
		cy.get("table tbody ")
			.contains("td", newTitle)
			.parent("tr")
			.within(() => {
				cy.get('[data-test="edit-footer-item-button"]').click();
			});
		cy.get("#title").clear().type(updatedTitle);
		cy.get(".jodit-wysiwyg").clear().type(updatedContent);
		cy.get('[data-test="footer-item-add-button"]').click();
		cy.get('[data-test="footer-config-update-button"]').click();
	});

	// this is done for deleting static content
	it("should delete the footer  static content", () => {
		const updatedTitle = "Company Address For Testing Updated";
		cy.contains("a", appearanceMenu.label).click();
		cy.get('[data-test="configuration-title-Footer configuration"]')
			.should("be.visible")
			.click();
		cy.get('[data-test="dhis2-uicore-button"]').click();
		cy.get("table tbody ")
			.contains("td", updatedTitle)
			.parent("tr")
			.within(() => {
				cy.get('[data-test="delete-footer-item-button"]').click();
			});
		cy.get('[data-test="footer-config-update-button"]').click();
	});

	it("should edit footer configurations for links", () => {
		cy.contains("a", appearanceMenu.label).click();

		cy.get('[data-test="configuration-title-Footer configuration"]')
			.parent()
			.within(() => {
				cy.contains("button", "Update").click();
			});

		cy.contains("Footer configurations").should("be.visible");

		const linkItem = footerConfig.footerItems.find(
			(item) => item.type === "links",
		);

		if (linkItem) {
			cy.get('[data-test="add-footer-item-button"]')
				.should("exist")
				.click();

			cy.get('[name="title"]').should("be.visible").type(linkItem.title);
			cy.get('[data-test="dhis2-uicore-select-input"]')
				.should("be.visible")
				.click();
			cy.get('[data-value="links"]').click();

			linkItem.links.forEach(({ name, url }) => {
				cy.get('[data-test="add-footer-link-button"]').click();
				cy.get("#name").should("be.visible").clear().type(name);
				cy.get("#url").should("be.visible").clear().type(url);
				cy.get('[data-test="footer-link-add-button"]').click();
			});

			cy.get('[data-test="footer-item-add-button"]');
			cy.get('[data-test="footer-item-add-button"]')
				.should("be.visible")
				.click();
			cy.get('[data-test="footer-config-update-button"]')
				.should("be.visible")
				.click();
		}
	});

	// Done editing footer links items
	it("Should edit footer links items", () => {
		const footerLinks = "Important Links For Testing";
		const updatedFooterLinks = "Important Links For Testing Updated";
		const previousFooterLinkTitle = "Test Link 1";
		const updatedFooterLink = "https://www.google.com";
		const updatedFooterTitle = "Testing link update title";
		cy.contains("a", appearanceMenu.label).click();
		cy.get('[data-test="configuration-title-Footer configuration"]')
			.should("be.visible")
			.click();
		cy.get('[data-test="dhis2-uicore-button"]').click();
		cy.get("table tbody ")
			.contains("td", footerLinks)
			.parent("tr")
			.within(() => {
				cy.get('[data-test="edit-footer-item-button"]').click();
			});
		cy.get("#title").clear().type(updatedFooterLinks);

		cy.get("table tbody ")
			.contains("td", previousFooterLinkTitle)
			.parent("tr")
			.within(() => {
				cy.get(
					'[data-test="on-update-edit-footer-link-button"]',
				).click();
			});
		cy.get("#name").clear().type(updatedFooterTitle);
		cy.get("#url").clear().type(updatedFooterLink);
		cy.get('[data-test="footer-link-add-button"]').click();
		cy.get('[data-test="footer-item-add-button"]').click();
		cy.get('[data-test="footer-config-update-button"]').click();
	});

	it("should delete footer links items", () => {
		const updatedFooterLinks = "Important Links For Testing Updated";
		cy.contains("a", appearanceMenu.label).click();
		cy.get('[data-test="configuration-title-Footer configuration"]')
			.should("be.visible")
			.click();
		cy.get('[data-test="dhis2-uicore-button"]').click();
		cy.get("table tbody ")
			.contains("td", updatedFooterLinks)
			.parent("tr")
			.within(() => {
				cy.get('[data-test="delete-footer-item-button"]').click();
			});
		cy.get('[data-test="footer-config-update-button"]').click();
	});
});
