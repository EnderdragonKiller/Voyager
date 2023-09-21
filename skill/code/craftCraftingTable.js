async function craftCraftingTable(bot) {
  const plankName = "spruce_planks";
  const plankCount = 4;
  const craftingTableName = "crafting_table";

  // Check if we have enough spruce planks
  const sprucePlanks = bot.inventory.findInventoryItem(mcData.itemsByName[plankName].id);
  if (!sprucePlanks || sprucePlanks.count < plankCount) {
    // We don't have enough spruce planks, so we need to collect more spruce logs and craft them
    await mineBlock(bot, "spruce_log", 1);
    await craftItem(bot, plankName, plankCount);
  }

  // Craft a crafting table
  await craftItem(bot, craftingTableName);

  // Task complete
  bot.chat("Crafted a crafting table!");
}