async function smeltIron(bot) {
  const rawIronCount = 3;
  const coalCount = 1;
  const furnaceName = "furnace";
  const coalName = "coal";
  const ironIngotName = "iron_ingot";

  // Check if you have a furnace in your inventory
  const furnace = bot.inventory.findInventoryItem(mcData.itemsByName[furnaceName].id);
  if (!furnace) {
    // Craft a furnace using the crafting table
    await craftItem(bot, furnaceName);
  }

  // Check if you have a stone pickaxe equipped
  const pickaxe = bot.inventory.findInventoryItem(mcData.itemsByName["stone_pickaxe"].id);
  if (!pickaxe) {
    // Equip a stone pickaxe from your inventory
    const stonePickaxe = bot.inventory.findInventoryItem(mcData.itemsByName["stone_pickaxe"].id);
    if (stonePickaxe) {
      await bot.equip(stonePickaxe, "hand");
    }
  }

  // Place the furnace down near your current position
  const furnacePosition = bot.entity.position.offset(1, 0, 0);
  await placeItem(bot, furnaceName, furnacePosition);

  // Use the furnace to smelt the raw iron
  await smeltItem(bot, "raw_iron", coalName, rawIronCount);

  // Task complete
  bot.chat("Smelted 3 raw iron!");
}

// Call the main function