async function craftStonePickaxe(bot) {
  const cobblestoneCount = 3;
  const stickCount = 2;
  const pickaxeName = "stone_pickaxe";
  const craftingTableName = "crafting_table";

  // Check if we already have a stone pickaxe
  const stonePickaxe = bot.inventory.findInventoryItem(mcData.itemsByName[pickaxeName].id);
  if (stonePickaxe) {
    bot.chat("Already have a stone pickaxe!");
    return;
  }

  // Check if we have enough cobblestones
  const cobblestones = bot.inventory.findInventoryItem(mcData.itemsByName["cobblestone"].id);
  if (!cobblestones || cobblestones.count < cobblestoneCount) {
    // We don't have enough cobblestones, so we need to collect them
    await mineBlock(bot, "stone", cobblestoneCount);
  }

  // Check if we have enough sticks
  const sticks = bot.inventory.findInventoryItem(mcData.itemsByName["stick"].id);
  if (!sticks || sticks.count < stickCount) {
    // We don't have enough sticks, so we need to collect them
    await mineBlock(bot, "oak_log", 1);
    await craftItem(bot, "stick", stickCount);
  }

  // Check if we have a crafting table nearby
  const craftingTable = bot.findBlock({
    matching: mcData.blocksByName[craftingTableName].id,
    maxDistance: 32
  });
  if (!craftingTable) {
    // Place a crafting table near the player
    await placeItem(bot, craftingTableName, bot.entity.position.offset(1, 0, 0));
  }

  // Craft the stone pickaxe
  await craftItem(bot, pickaxeName);

  // Task complete
  bot.chat("Crafted a stone pickaxe!");
}