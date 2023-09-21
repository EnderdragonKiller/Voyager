async function mineWoodLog(bot) {
  const logName = "spruce_log";
  const logCount = 1;

  // Check if you have a spruce log in your inventory
  const spruceLog = bot.inventory.findInventoryItem(mcData.itemsByName[logName].id);
  if (!spruceLog) {
    // Mine a spruce log
    await mineBlock(bot, logName, logCount);
  }

  // Task complete
  bot.chat("Task complete!");
}