---
sidebar_position: 5
---
# App Menu Configuration

The App Menu Configuration section allows you to customize the navigation menu of your DHIS2 Public Portal. These settings control the position, structure, and content of the menu that users will use to navigate through your portal.

## Accessing App Menu Configuration

1. Log in to the Manager App
2. Navigate to the "Menu" section in the sidebar menu

## Available Configuration Options

### Menu Position

Determines where the navigation menu appears in your portal.

- **Field**: Position
- **Type**: Dropdown
- **Options**:
  - **Header**: Menu appears at the top of the page as a horizontal menu
  - **Sidebar**: Menu appears on the side of the page as a vertical menu
- **Default**: Sidebar

### Collapsible Menu

Determines whether the menu can be collapsed (minimized) by users.

- **Field**: Collapsible
- **Type**: Toggle
- **Default**: Enabled (only applicable for sidebar position)

### Menu Items

Configure the items that appear in your navigation menu. Each menu item can be one of the following types:

#### Module Menu Item

A direct link to a specific module in your portal.

- **Type**: Module
- **Fields**:
  - **Label**: The text displayed for this menu item
  - **Icon**: An optional icon to display next to the label
  - **Sort Order**: The position of this item in the menu (lower numbers appear first)
  - **Path**: The URL path for this item (max 50 characters)
  - **Module ID**: The ID of the module this item links to

#### Group Menu Item

A group of related module menu items.

- **Type**: Group
- **Fields**:
  - **Label**: The text displayed for this group
  - **Icon**: An optional icon to display next to the label
  - **Sort Order**: The position of this group in the menu (lower numbers appear first)
  - **Path**: The URL path for this group (max 50 characters)
  - **Items**: A list of module menu items in this group (minimum 2 items)
  - **Items Display**: How the items in this group are displayed
    - **Grouped**: Items are displayed as a group
    - **Dropdown**: Items are displayed in a dropdown menu

## How to Configure

1. **Menu Position**:
   - Select either "Header" or "Sidebar" based on your preference
   - If you choose "Sidebar", you can also configure whether it's collapsible

2. **Menu Items**:
   - To add a new menu item, click the "Add Item" button
   - Select the type of item (Module or Group)
   - Fill in the required fields for the selected item type
   - For Group items, add at least 2 module items to the group
   - Arrange items by setting their Sort Order values

3. **Save Changes**:
   - After configuring your menu, click the "Save" button to apply the changes

## Best Practices

- Keep your menu structure simple and intuitive
- Use clear and concise labels for menu items
- Organize related items into groups to reduce clutter
- Consider the user experience when choosing between header and sidebar menu positions
- For sidebar menus, enable the collapsible option to give users more screen space when needed
- Use consistent icons that clearly represent the content they link to
- Ensure that all modules referenced in menu items actually exist in your portal
