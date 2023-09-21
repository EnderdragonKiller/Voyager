async function craftFurnace(bot) {
  const furnaceName = "furnace";
  const cobblestoneName = "cobblestone";
  const cobblestoneCount = 8;

  // Check if we already have a furnace in our inventory
  const furnace = bot.inventory.findInventoryItem(mcData.itemsByName[furnaceName].id);
  if (furnace) {
    bot.chat("Already have a furnace!");
    return;
  }

  // Check if we have enough cobblestone blocks in our inventory
  const cobblestones = bot.inventory.findInventoryItem(mcData.itemsByName[cobblestoneName].id);
  if (!cobblestones || cobblestones.count < cobblestoneCount) {
    // We don't have enough cobblestone blocks, so we need to collect them
    await mineBlock(bot, "stone", cobblestoneCount);
  }

  // Craft the furnace
  await craftItem(bot, furnaceName);

  // Task complete
  bot.chat("Crafted a furnace!");
}

// Call the main function