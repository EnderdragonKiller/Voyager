async function craftWoodenPickaxe(bot) {
  const plankName = "spruce_planks";
  const plankCount = 2;
  const stickName = "stick";
  const stickCount = 3;
  const pickaxeName = "wooden_pickaxe";
  const craftingTableName = "crafting_table";

  // Check if there is a crafting table in the inventory
  const craftingTableItem = bot.inventory.findInventoryItem(mcData.itemsByName[craftingTableName].id);
  if (!craftingTableItem) {
    // We don't have a crafting table, so we need to collect the required items and craft it
    await mineBlock(bot, "oak_log", 1);
    await craftItem(bot, craftingTableName);
  }

  // Check if there is a crafting table nearby
  const craftingTable = bot.findBlock({
    matching: mcData.blocksByName[craftingTableName].id,
    maxDistance: 32
  });
  if (!craftingTable) {
    // Place a crafting table near the player
    await placeItem(bot, craftingTableName, bot.entity.position.offset(1, 0, 0));
  }

  // Check if we have enough wooden planks in our inventory
  const planks = bot.inventory.findInventoryItem(mcData.itemsByName[plankName].id);
  if (!planks || planks.count < plankCount) {
    // We don't have enough wooden planks, so we need to collect more spruce logs and craft them
    await mineBlock(bot, "spruce_log", 1);
    await craftItem(bot, plankName, plankCount);
  }

  // Check if we have enough sticks in our inventory
  const sticks = bot.inventory.findInventoryItem(mcData.itemsByName[stickName].id);
  if (!sticks || sticks.count < stickCount) {
    // We don't have enough sticks, so we need to collect more spruce logs and craft them
    await mineBlock(bot, "spruce_log", 1);
    await craftItem(bot, stickName, stickCount);
  }

  // Craft the wooden pickaxe
  await craftItem(bot, pickaxeName);

  // Task complete
  bot.chat("Crafted a wooden pickaxe!");
}

// Call the main function