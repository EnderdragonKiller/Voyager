async function craftPlanks(bot) {
  const logName = "spruce_log";
  const logCount = 1;
  const plankName = "spruce_planks";
  const plankCount = 4;

  // Check if we have spruce logs in our inventory
  const spruceLogs = bot.inventory.findInventoryItem(mcData.itemsByName[logName].id);
  if (!spruceLogs) {
    // Mine spruce logs
    await mineBlock(bot, logName, logCount);
  }

  // Craft planks
  await craftItem(bot, plankName, plankCount);

  // Task complete
  bot.chat("Crafted spruce planks!");
}

// Call the main function