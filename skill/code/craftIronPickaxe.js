async function craftIronPickaxe(bot) {
  const ironPickaxeName = "iron_pickaxe";
  const ironIngotName = "iron_ingot";
  const ironIngotCount = 3;
  const stickName = "stick";
  const stickCount = 2;
  const craftingTableName = "crafting_table";

  // Check if we already have an iron pickaxe
  const ironPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName[ironPickaxeName].id);
  if (ironPickaxe) {
    bot.chat("Already have an iron pickaxe!");
    return;
  }

  // Check if we have enough iron ingots
  const ironIngots = bot.inventory.findInventoryItem(mcData.itemsByName[ironIngotName].id);
  if (!ironIngots || ironIngots.count < ironIngotCount) {
    // We don't have enough iron ingots, so we need to collect them
    await mineBlock(bot, "iron_ore", ironIngotCount);
    await smeltItem(bot, "raw_iron", "coal", ironIngotCount);
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

  // Craft the iron pickaxe
  await craftItem(bot, ironPickaxeName);

  // Task complete
  bot.chat("Crafted an iron pickaxe!");
}

// Call the main function