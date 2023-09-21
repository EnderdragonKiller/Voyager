async function mineCobblestone(bot) {
  const cobblestoneName = "cobblestone";
  const cobblestoneCount = 3;
  const pickaxeName = "wooden_pickaxe";

  // Check if you have cobblestone in your inventory
  const cobblestone = bot.inventory.findInventoryItem(mcData.itemsByName[cobblestoneName].id);
  if (!cobblestone) {
    // Mine stone blocks until you have at least 3 cobblestone
    await mineBlock(bot, "stone", cobblestoneCount);
  }

  // Task complete
  bot.chat("Mined 3 cobblestone!");
}