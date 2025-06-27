import { appMenus } from "../../src/shared/constants/menu";

describe("App Menu Section", () => {
	const appMenu = appMenus.find((menu) => menu.label === "App Menu");

	if (!appMenu) {
		throw new Error("App Menu item not found in appMenus");
	}

	beforeEach(() => {
		cy.visit("/");
	});


	// Done for  showing ui of the app menu configuration
	  it("should display App Menu configuration UI", () => {

		const home = "Home";
	    cy.contains("a", appMenu.label).click();
		//showing app menu title is showing
		cy.get('.text-2xl').should('be.visible');

		cy.get('[data-test="menu-position-config"]').should('be.visible');
		// showing app menu title is showing

		// collapse button should be visible
		cy.get('[data-test="dhis2-uicore-checkbox"]').should('be.visible');
        //  menu items should be visible
		cy.get('h4').should('be.visible');

		//sort items button should be visible
		cy.get('[data-test="sort-menu-items-button"]').should('be.visible');

		//add item button should be visible
		cy.get('[data-test="add-menu-item-button"]').should('be.visible');

		// should observe is table is shown
		cy.get('table').should('be.visible');

		// should observe if table body is shown
		cy.get('table tbody').should('be.visible');

		// should observe if table header is shown
		cy.get('table thead').should('be.visible');
		// should observe if table row is shown
		cy.get('table tbody tr').should('be.visible');
		// should observe if table column is shown
		cy.get('table tbody tr td').should('be.visible');
		// should observe if the edit and delete button is shown on the table
		cy.get('table tbody ').contains("td", home).parent("tr").within(() => {
			cy.get('[data-test="edit-menu-item-button"]').should('be.visible');
			cy.get('[data-test="delete-menu-item-button"]').should('be.visible');
		});


     // This is done for switching sidebar to header and header to sidebar
	// should observe if sidebar is clicked and switched 
	it("should observe if sidebar is clicked and switched", () => {
		cy.contains("a", appMenu.label).click();

		// should check if the sidebar visible
		cy.get('[data-test="menu-position-sidebar"]').should('be.visible');

		// should check if the header visible
		cy.get('[data-test="menu-position-header"]').should('be.visible');

		// should switch  to the header
		cy.get('[data-test="menu-position-header"]').click();


			// should return to the sidebar
	    cy.get('[data-test="menu-position-sidebar"]').click();

		// should save changes
		cy.get('[data-test="save-menu-config-changes-button"]').click();

	

	
	})

	// should add new item to the menu
	it("should add new item to the menu", () => {
		const modules  = appMenus.find((menu) => menu.label === "Modules");
		const moduleConfiguration = {
			label : "Test Module For App Menu",
			type : "Section",

		}
		cy.contains("a", modules.label ).click();
		cy.get('.pl-4 > [data-test="dhis2-uicore-button"]').click();
		// type on the label input
	

	  });
	});
});
