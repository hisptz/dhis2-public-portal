import { appMenus } from "../../src/shared/constants/menu";

describe("App Menu Section", () => {
	const appMenu = appMenus.find((menu) => menu.label === "App Menu");

	if (!appMenu) {
		throw new Error("App Menu item not found in appMenus");
	}

	beforeEach(() => {
		cy.visit("/");
	});

	//   it("should display App Menu configuration UI", () => {
	//     cy.contains("a", appMenu.label).click();
	//     cy.get('[data-test="dhis2-uicore-field-content"] > .flex > :nth-child(1)').should("exist");
	//     cy.get('[data-test="dhis2-uicore-field-content"] > .flex > :nth-child(2)').should("exist");
	//     cy.get('input[type="checkbox"][name="collapsible"]').should("exist");
	//     cy.contains("h4", /Menu items/i).should("exist");
	//     cy.contains("button", /Add menu item/i).should("exist");
	//     cy.contains("button", /Save changes/i).should("exist");
	//     cy.contains("button", /Reset/i).should("exist");
	//     cy.get("table").should("exist");
	//   });

	//   it("Should sort items",()=>{
	//     cy.contains("a", appMenu.label).click();
	//     //i should check if the sort button is present
	//     cy.get('[data-test="sort-menu-items-button"]').should("exist");
	//     //i should click button for sorting
	//     cy.get('[data-test="sort-menu-items-button"]').click();
	//     // if modal open is should drag items and save

	//   })

	// it("should add a new module item", () => {
	// 	cy.contains("a", appMenu.label).click();
	// 	// click add menu item button
	// 	cy.get('[data-test="add-menu-item-button"]').click();
	// 	// i should check if the modal is open
	// 	cy.get('[data-test="dhis2-uicore-modaltitle"]').should("exist");
	// 	cy.get('[data-test="dhis2-uicore-select-input"]').click();
	// 	cy.get("#filter").type("Home (Section)");
	// 	cy.get('[data-test="dhis2-uicore-singleselectoption"]').click();
	// 	//clicking button to update
	// 	cy.get('[data-test="save-menu-item-button"]').click();
	// 	// i should check if the item is added

	// 	// i should save the changes
	// 	cy.get('[data-test="save-menu-config-changes-button"]').click();

	// });

    
	// it("should add the group of items", () => {
    //     cy.contains("a", appMenu.label).click();
    // });

	it("should edit a menu item", () => {
        cy.contains("a", appMenu.label).click();
    });


	// it("should delete a menu item", () => {
    //     cy.contains("a", appMenu.label).click();
    // });
});
