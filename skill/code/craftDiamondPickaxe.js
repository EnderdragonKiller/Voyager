// main function after the helper functions
async function craftDiamondPickaxe(bot) {
  const diamondPickaxeName = "diamond_pickaxe";
  const diamondCount = 3;
  const stickName = "stick";
  const stickCount = 2;
  const craftingTableName = "crafting_table";

  // Check if we already have a diamond pickaxe
  const diamondPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName[diamondPickaxeName].id);
  if (diamondPickaxe) {
    bot.chat("Already have a diamond pickaxe!");
    return;
  }

  // Check if we have enough diamonds
  const diamonds = bot.inventory.findInventoryItem(mcData.itemsByName["diamond"].id);
  if (!diamonds || diamonds.count < diamondCount) {
    // We don't have enough diamonds, so we need to collect them
    await mineBlock(bot, "diamond_ore", diamondCount);
  }

  // Check if we have enough sticks
  const sticks = bot.inventory.findInventoryItem(mcData.itemsByName[stickName].id);
  if (!sticks || sticks.count < stickCount) {
    // We don't have enough sticks, so we need to collect them
    await mineBlock(bot, "oak_log", 1);
    await craftItem(bot, stickName, stickCount);
  }

  // Check if we have a crafting table in our inventory
  const craftingTable = bot.inventory.findInventoryItem(mcData.itemsByName[craftingTableName].id);
  if (!craftingTable) {
    // We don't have a crafting table, so we need to craft one
    await craftItem(bot, craftingTableName);
  }

  // Place the crafting table down near our current position
  const craftingTablePosition = bot.entity.position.offset(1, 0, 0);
  await placeItem(bot, craftingTableName, craftingTablePosition);

  // Craft sticks
  await craftItem(bot, stickName, stickCount);

  // Craft the diamond pickaxe
  await craftItem(bot, diamondPickaxeName);

  // Task complete
  bot.chat("Crafted a diamond pickaxe!");
}

// Call the main function