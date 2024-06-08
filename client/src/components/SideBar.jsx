import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";

const SideBar = () => {
  return (
    <>
      <h1>SideBar</h1>
      <Menu>
        <MenuList>
          <MenuButton as={Button}>Actions</MenuButton>
          <MenuItem>Download</MenuItem>
          <MenuItem>Create a Copy</MenuItem>
          <MenuItem>Mark as Draft</MenuItem>
          <MenuItem>Delete</MenuItem>
          <MenuItem>Attend a Workshop</MenuItem>
        </MenuList>
      </Menu>
    </>
  );
};

export default SideBar;
