---
sidebar_position: 1
---


# Section Module

This guide explains how to create and configure a **Section Module** within the FlexiPortal Manager app. A Section Module groups multiple subsections under one modular structure.

## What is a Section Module?
A **Section Module** lets administrators display items in a structured layout. Each section can be configured as one of the following types:

- **Flexible Layout** – Add multiple items with full control over layout via drag, resize, and screen size breakpoints.
- **Grid Layout** – Similar to Flexible but with a fixed, non-editable grid layout.
- **Single Item** – Displays one single item without layout customization.

> 💡 Choose the layout type that best fits the content and design needs of your section module.


## Creating a Section Module

### 1. Navigate to the Modules Page

- Open the FlexiPortal manager app and go to `Modules` page
- Click the **Create a new module** button

### 2. Provide Section Module Details

Fill in the form:

- **Label** (required): Name of the module as it appears in the navigation
- **Type** (required): Select the type of module. In this case, choose **Section Module**
- **ID**: Unique identifier for the module (auto-generated). This will be a part of the url. It should not contain spaces

Click **Create module** to proceed


---


## Adding Sections to the Module

Once the module is created, you’ll be directed to the edit page of the module. Here you can edit the module details, select the display type of the module and add sections.

### 1. Edit Module Details

- **Label**: Changing the label will update the name in the navigation
- **Display Type (Required)**: Choose how the module will be displayed. Options include:
  - **Vertical**: Sections are displayed vertically
  - **Horizontal**: Sections are displayed horizontally

To save changes made, click the **Save Changes** button
  
### 2. Delete Module

- To delete the module, click the **Delete Module** button. An Alert will appear to confirm the deletion. This action is irreversible and will remove all sections and data associated with the module.

> 💡 To go back to the modules list page, click the **Back to Modules** button.

### 3. Add Sections

To add sections to the module, click the **Add Section** button. This will open a new section configuration form.

Fill in the form:

- **ID** (required): Unique identifier for the section (auto-generated).
- **Title** (required): Name of the section as it appears in the Module page 
- **Type**: Select the type of section.

  | Type | Description |
  |----------------|-----------------------------------------------------------------------------|
  | **Flexible Layout** | - This section type allows admin to add multiple visualizations such as charts and maps and to configure the layout of how the visualizations will be displayed in various screen sizes|
  | **Grid Layout** | - This section type allows admin to add multiple visualizations such as charts and maps but the layout of the visualizations can not be configured, it will be in a grid layout by default.|
  | **Single Item** | - This section type allows admin to add only one item in the section, this item can be either of type Rich Text, Visualization, Single Value or Feedback |
 

Click the **Create section** button to proceed

---


## Configuring a Flexible Layout Section

This guide explains how to configure a **Flexible Layout Section** in your section module.


### 1. Enter Section Details

- **Title**: Enter a name for your section (e.g., `Flexible Section`).
- **Type**: This is the type of section, it will be `Flexible Layout`. It can not be changed after the section is created.


### 2. Add Visualizations

- Click **`+ Add visualizations`**.
- Select the type of item you want to add (e.g., **Visualization**, **Map**).

  - **Visualization**:
    - **Visualization Type**: Choose the type of visualization (e.g., Line, Bar, Pie, Gauge, Single Value).
    - **Visualization**: Select the specific visualization you want to include.
    - **Caption**: (Optional) Enter a caption for the visualization.

  - **Map**:
    - **Map**: Select the specific map you want to include.
    - **Caption**: (Optional) Enter a caption for the map.

- Click **`Add`** to include the selected item in the section.
- The added **Visualization** or **Map** will appear in the **Items** table.


### 3. Manage Items

Each row in the **Items** table shows:

| Column   | Description                      |
|----------|----------------------------------|
| **ID**   | Unique ID of the visualization.  |
| **Type** | Type of visualization (e.g., CHART, MAP). |
| **Caption** | Caption for the visualization.                               |
| **Actions** | Edit (✏️) or Delete (🗑️) icons to modify or remove the item. |


### 4. Configure Layout

- Click **`Configure layout`** to open the layout editor where you can visually arrange visualizations within a grid.
- You will see:
  - A **Size** dropdown to select the screen breakpoint for layout configuration:
    - Options: `sm` (small), `md` (medium), `lg` (large)
    - This lets you define how the layout should behave on different screen sizes.
  - A visual **drag-and-drop canvas** where you can:
    - **Drag** items to rearrange their position.
    - **Resize** items by adjusting their width/height directly within the grid.
  - Action buttons:
    - **`Cancel`** – Discards any changes made in the layout editor.
    - **`Update Layout`** – Saves and applies your layout changes.

> 💡 Use this interface to create responsive, user-friendly section tailored to various device sizes.

### 5. Save Changes
- Click **`Save section changes`** to save your configuration.
- Click **`Cancel`** to discard any unsaved changes.


---


## Configuring a Grid Layout Section

This guide explains how to configure a **Grid Layout Section** in your section module.


### 1. Enter Section Details

- **Title**: Enter a name for your section (e.g., `Grid Section`).
- **Type**: This is the type of section, it will be `Grid Layout`. It can not be changed after the section is created.


### 2. Add Visualizations

- Click **`+ Add visualizations`**.
- Select the type of item you want to add (e.g., **Visualization**).

  - **Visualization**:
    - **Visualization Type**: Choose the type of visualization (e.g., Single Value).
    - **Visualization**: Select the specific visualization you want to include.
    - **Icon**: (Optional) Enter a Icon for the visualization.
    - **Caption**: (Optional) Enter a caption for the visualization.

- Click **`Add`** to include the selected item in the section.
- The added **Visualization** will appear in the **Items** table.


### 3. Manage Items

Each row in the **Items** table shows:

| Column     | Description                                                  |
|------------|--------------------------------------------------------------|
| **ID**     | Unique ID of the visualization.                              |
| **Type**   | Type of visualization (e.g., CHART, MAP).                    |
| **Caption** | Caption for the visualization.                               |
| **Icon**   | Icon for the visualization.                                  |
| **Action** | Delete (🗑️) icon to remove the item. |

### 4. Save Changes
- Click **`Save section changes`** to save your configuration.
- Click **`Cancel`** to discard any unsaved changes.

> 💡 Grid Layout Section does not allow configuration of the visualization layout, it is rendered in a grid layout by default.


---


## Configuring a Single Item Section

This guide explains how to configure a **Single Item Section** in your section module.


### 1. Enter Section Details

- **Title**: Enter a name for your section (e.g., `Single Item Section`).
- **Type**: This is the type of section, it will be `Single Item`. It can not be changed after the section is created.


### 2. Add a single item

- Select the Item type, this can be either of type **Rich Text**, **Visualization**, **Single Value** or **Feedback**.

  - **Rich Text**:
    - **Rich Text**: Enter the rich text content you want to display.

  - **Visualization**:
    - **Visualization**:
      - **Visualization Type**: Choose the type of visualization (e.g., Line, Bar, Pie, Gauge, Single Value).
      - **Visualization**: Select the specific visualization you want to include.
      - **Caption**: (Optional) Enter a caption for the visualization.
    - **Map**:
      - **Map**: Select the specific map you want to include.
      - **Caption**: (Optional) Enter a caption for the map.

  - **Single Value**:
    - **Visualization**: Select the specific single value visualization you want to include.
    - **Icon**: (Optional) Enter a Icon for the single value visualization.
    - **Caption**: (Optional) Enter a caption for the single value visualization.

  - **Feedback**
    - The **Feedback** section allows administrators to manage a list of email addresses that will receive user feedback submitted through the FlexiPortal.
    - #### Adding a Feedback Recipient
      - Click **`Add Feedback Recipient`**.
      - A modal form will appear.
      - Enter a **valid email address** in the input field.
      - Click **`Add`** to save the email.
      - The modal will close, and the email will appear in the **Feedback Recipients** table.
    - #### Managing Feedback Recipients
      - The table displays each added email under the **Email** column.
      - Under the **Actions** column, you can:
        - **Edit** – Update the existing email address.
        - **Delete** – Remove the email from the list.

> 💡 This list ensures the right people are notified whenever feedback is received from FlexiPortal users.

### 3. Save Changes
- Click **`Save section changes`** to save your configuration.
- Click **`Cancel`** to discard any unsaved changes.


---

## Finalizing the Module

When all sections are added and arranged:

- Click **Save Module** to finalize
- The Section Module will now appear in the FlexiPortal

---

##  ✅ Tips

- Use clear, descriptive titles for each section
- Group related content in one module for a better user experience
- Always **save** after updating layouts or visualizations.


