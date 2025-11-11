import { appMenus } from "../../src/shared/constants/menu";

describe("App Menu Section", () => {
	const appMenu = appMenus.find((menu) => menu.label === "App Menu");

	if (!appMenu) {
		throw new Error("App Menu item not found in appMenus");
	}

	beforeEach(() => {
		cy.visit("/");
	});


	  it("should display App Menu configuration UI", () => {

		const home = "Home";
	    cy.contains("a", appMenu.label).click();
		cy.get('.text-2xl').should('be.visible');

		cy.get('[data-test="menu-position-config"]').should('be.visible');

		cy.get('[data-test="dhis2-uicore-checkbox"]').should('be.visible');
		cy.get('h4').should('be.visible');

		cy.get('[data-test="sort-menu-items-button"]').should('be.visible');

		cy.get('[data-test="add-menu-item-button"]').should('be.visible');

		cy.get('table').should('be.visible');

		cy.get('table tbody').should('be.visible');

		cy.get('table thead').should('be.visible');
		cy.get('table tbody tr').should('be.visible');
		cy.get('table tbody tr td').should('be.visible');
		cy.get('table tbody ').contains("td", home).parent("tr").within(() => {
			cy.get('[data-test="edit-menu-item-button"]').should('be.visible');
			cy.get('[data-test="delete-menu-item-button"]').should('be.visible');
		});

	it("should observe if sidebar is clicked and switched", () => {
		cy.contains("a", appMenu.label).click();

		cy.get('[data-test="menu-position-sidebar"]').should('be.visible');

		cy.get('[data-test="menu-position-header"]').should('be.visible');

		cy.get('[data-test="menu-position-header"]').click();


	    cy.get('[data-test="menu-position-sidebar"]').click();

		cy.get('[data-test="save-menu-config-changes-button"]').click();
	
	})

	it("should add new module for testing app menu", () => {
		const modules  = appMenus.find((menu) => menu.label === "Modules");
		if (!modules) {
			throw new Error("Modules item not found in appMenus");
		}
		cy.contains("a", modules.label).click();
		
		const moduleConfiguration = {
			label : "Test Module For App Menu",
			type : "Static",

		}
		cy.get('.pl-4 > [data-test="dhis2-uicore-button"]').click();
		cy.get('#label').clear().type(moduleConfiguration.label);
		cy.get('[data-test="add-module-type"]').click();
		cy.get('#filter').clear();
		cy.get('#filter').type(moduleConfiguration.type);
	
		cy.get('[data-test="dhis2-uicore-singleselectoption"]').click();

		cy.get('[data-test="dhis2-uicore-buttonstrip"] > :nth-child(2) > [data-test="dhis2-uicore-button"]').click();
	  });


	it("should add new module for testing app menu", () => {
		cy.contains("a", appMenu.label).click();
		cy.get('[data-test="add-menu-item-button"]').click();
		cy.get('[data-test="dhis2-uicore-select-input"]').click();
		cy.get('#filter').clear();
		cy.get('#filter').type("Test Module For App Menu");
		cy.get('[data-test="dhis2-uicore-singleselectoption"]').click();
		cy.get('[data-test="save-menu-item-button"]').click();
		cy.get('[data-test="save-menu-config-changes-button"]').click();
		
	});

	it("should edit the app menu added", () => {
		const updatedModule = "Updated Test Module For App Menu";
		cy.contains("a", appMenu.label).click();
		cy.get('table tbody tr').contains("td", "Test Module For App Menu").parent("tr").within(() => {
			cy.get('[data-test="edit-menu-item-button"]').click();
		});
		cy.get('[data-test="dhis2-uicore-field-content"] > .flex > :nth-child(2)').click();
		cy.get('#label').clear().type(updatedModule);
		cy.get("button").contains("Add sub item").click();
		cy.get('[data-test="dhis2-uicore-select-input"]').click();
		cy.get('[data-value="blog"]').click();
		cy.get("button").contains("Create").click();
		cy.get("button").contains("Add sub item").click();
		cy.get('[data-test="dhis2-uicore-select-input"]').click();
		cy.get('[data-value="charts"]').click();
		cy.get("button").contains("Create").click();
		cy.get("button").contains("Update").click();
		cy.get("button").contains("Save changes").click();
		});


  it("should delete the app menu added", () => {
	cy.contains("a", appMenu.label).click();
	cy.get('table tbody tr').contains("td", "Test Module For App Menu").parent("tr").within(() => {
		cy.get('[data-test="delete-menu-item-button"]').click();
	});
	cy.get("button").contains("Delete").click();
	cy.get("button").contains("Save changes").click();
  });
});
});
