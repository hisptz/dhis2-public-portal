/// <reference types="cypress" />

describe("Menu Tests", () => {
	//Test are disabled until a solution for mocking next js is okay
	it("Should just pass", () => {
		cy.visit("/");
	});

	// Now these tests work with server side data fetch using cypress-ssr-localhost-mocker
	// context("Header Menu", () => {
	// 	beforeEach(() => {
	// 		// Load the header menu fixture
	// 		// cy.mockBackendRequest({
	// 		// 	port: 8080,
	// 		// 	routeMock: {
	// 		// 		method: "GET",
	// 		// 		path: "**/dataStore/**/menu",
	// 		// 		response: {
	// 		// 			statusCode: 200,
	// 		// 		},
	// 		// 	},
	// 		// 	fixturePath: "menu-header.json",
	// 		// });
	//
	// 		// Visit the application
	// 		cy.visit("/");
	// 	});
	//
	// 	it("should render the menu in the header", () => {
	// 		// Check if the menu is in the header
	// 		cy.get("header").find("[role='tablist']").should("be.visible");
	//
	// 		// The sidebar menu should be collapsed on desktop
	// 		cy.get(".mantine-AppShell-navbar").should("not.be.visible");
	// 	});
	//
	// 	it("should display all menu items correctly", () => {
	// 		// Check if all top-level items are displayed
	// 		cy.get("[role='tablist']").within(() => {
	// 			cy.contains("Home").should("be.visible");
	// 			cy.contains("About").should("be.visible");
	// 			cy.contains("Services").should("be.visible");
	// 		});
	// 	});
	//
	// 	it("should display dropdown menu for group items", () => {
	// 		// Click on the Services tab to open the dropdown
	// 		cy.contains("Services").click();
	//
	// 		// Check if the dropdown menu is displayed
	// 		cy.get(".mantine-Menu-dropdown").should("be.visible");
	//
	// 		// Check if all items in the dropdown are displayed
	// 		cy.get(".mantine-Menu-dropdown").within(() => {
	// 			cy.contains("Service 1").should("be.visible");
	// 			cy.contains("Service 2").should("be.visible");
	// 		});
	// 	});
	//
	// 	it("should navigate to the correct page when clicking on a menu item", () => {
	// 		// Click on the About tab
	// 		cy.contains("About").click();
	//
	// 		// Check if the URL has changed to the About page
	// 		cy.url().should("include", "/about");
	//
	// 		// The About tab should be active
	// 		cy.contains("About").should("have.attr", "data-active");
	// 	});
	// });

	// context("Sidebar Menu", () => {
	// 	beforeEach(() => {
	// 		// Load the sidebar menu fixture
	// 		cy.fixture("menu-sidebar.json").then(
	// 			(menuConfig: AppMenuConfig) => {
	// 				// Mock the server-side API request and return our fixture
	// 				cy.mockNextApi("**/dataStore/**/menu", {
	// 					statusCode: 200,
	// 					body: menuConfig,
	// 				});
	//
	// 				// Visit the application
	// 				cy.visit("/");
	// 			},
	// 		);
	// 	});
	//
	// 	it("should render the menu in the sidebar", () => {
	// 		// Check if the menu is in the sidebar
	// 		cy.get(".mantine-AppShell-navbar").should("be.visible");
	//
	// 		// The header should not contain the menu
	// 		cy.get("header").find("[role='tablist']").should("not.exist");
	// 	});
	//
	// 	it("should display all menu items correctly", () => {
	// 		// Check if all top-level items are displayed in the sidebar
	// 		cy.get(".mantine-AppShell-navbar").within(() => {
	// 			cy.contains("Home").should("be.visible");
	// 			cy.contains("About").should("be.visible");
	// 			cy.contains("Services").should("be.visible");
	// 		});
	// 	});
	//
	// 	it("should display grouped items correctly", () => {
	// 		// Check if the Services group is displayed
	// 		cy.get(".mantine-AppShell-navbar").within(() => {
	// 			cy.contains("Services").should("be.visible");
	//
	// 			// Check if the group items are displayed
	// 			cy.contains("Service 1").should("be.visible");
	// 			cy.contains("Service 2").should("be.visible");
	// 		});
	// 	});
	//
	// 	it("should navigate to the correct page when clicking on a menu item", () => {
	// 		// Click on the About link
	// 		cy.contains("About").click();
	//
	// 		// Check if the URL has changed to the About page
	// 		cy.url().should("include", "/about");
	//
	// 		// The About link should be active
	// 		cy.contains("About").parent().should("have.attr", "data-active");
	// 	});
	// });
	//
	// context("Sidebar Menu with Dropdown", () => {
	// 	beforeEach(() => {
	// 		// Load the sidebar menu with dropdown fixture
	// 		cy.fixture("menu-sidebar-dropdown.json").then(
	// 			(menuConfig: AppMenuConfig) => {
	// 				// Mock the server-side API request and return our fixture
	// 				cy.mockNextApi("**/dataStore/**/menu", {
	// 					statusCode: 200,
	// 					body: menuConfig,
	// 				});
	//
	// 				// Visit the application
	// 				cy.visit("/");
	// 			},
	// 		);
	// 	});
	//
	// 	it("should render the menu in the sidebar", () => {
	// 		// Check if the menu is in the sidebar
	// 		cy.get(".mantine-AppShell-navbar").should("be.visible");
	// 	});
	//
	// 	it("should display dropdown for group items", () => {
	// 		// Check if the Services group is displayed as a dropdown
	// 		cy.get(".mantine-AppShell-navbar").within(() => {
	// 			cy.contains("Services").should("be.visible");
	//
	// 			// Initially, the dropdown items should not be visible
	// 			cy.contains("Service 1").should("not.be.visible");
	//
	// 			// Click on the Services group to expand the dropdown
	// 			cy.contains("Services").click();
	//
	// 			// Now the dropdown items should be visible
	// 			cy.contains("Service 1").should("be.visible");
	// 			cy.contains("Service 2").should("be.visible");
	// 		});
	// 	});
	// });
	//
	// context("Complex Menu", () => {
	// 	beforeEach(() => {
	// 		// Load the complex menu fixture
	// 		cy.fixture("menu-complex.json").then(
	// 			(menuConfig: AppMenuConfig) => {
	// 				// Mock the server-side API request and return our fixture
	// 				cy.mockNextApi("**/dataStore/**/menu", {
	// 					statusCode: 200,
	// 					body: menuConfig,
	// 				});
	//
	// 				// Visit the application
	// 				cy.visit("/");
	// 			},
	// 		);
	// 	});
	//
	// 	it("should render all menu items correctly", () => {
	// 		// Check if all top-level items are displayed
	// 		cy.get("[role='tablist']").within(() => {
	// 			cy.contains("Home").should("be.visible");
	// 			cy.contains("About Us").should("be.visible");
	// 			cy.contains("Services").should("be.visible");
	// 			cy.contains("Contact").should("be.visible");
	// 		});
	// 	});
	//
	// 	it("should display dropdown menus for all group items", () => {
	// 		// Click on the About Us tab to open the dropdown
	// 		cy.contains("About Us").click();
	//
	// 		// Check if the dropdown menu is displayed
	// 		cy.get(".mantine-Menu-dropdown").should("be.visible");
	//
	// 		// Check if all items in the dropdown are displayed
	// 		cy.get(".mantine-Menu-dropdown").within(() => {
	// 			cy.contains("Our Mission").should("be.visible");
	// 			cy.contains("Our Team").should("be.visible");
	// 			cy.contains("History").should("be.visible");
	// 		});
	//
	// 		// Close the About Us dropdown
	// 		cy.contains("About Us").click();
	//
	// 		// Click on the Services tab to open the dropdown
	// 		cy.contains("Services").click();
	//
	// 		// Check if the dropdown menu is displayed
	// 		cy.get(".mantine-Menu-dropdown").should("be.visible");
	//
	// 		// Check if all items in the dropdown are displayed
	// 		cy.get(".mantine-Menu-dropdown").within(() => {
	// 			cy.contains("Health Services").should("be.visible");
	// 			cy.contains("Education").should("be.visible");
	// 		});
	// 	});
	//
	// 	it("should navigate to the correct page when clicking on a dropdown item", () => {
	// 		// Click on the About Us tab to open the dropdown
	// 		cy.contains("About Us").click();
	//
	// 		// Click on the Our Team item
	// 		cy.contains("Our Team").click();
	//
	// 		// Check if the URL has changed to the Team page
	// 		cy.url().should("include", "/team");
	// 	});
	// });
});
