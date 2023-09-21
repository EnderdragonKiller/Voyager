async function mineCoalOre(bot) {
  const coalName = "coal";
  const coalCount = 3;

  // Check if the bot already has enough coal
  const coal = bot.inventory.findInventoryItem(mcData.itemsByName[coalName].id);
  if (coal && coal.count >= coalCount) {
    bot.chat("Already have enough coal!");
    return;
  }

  // Mine coal ore blocks until enough coal is obtained
  await mineBlock(bot, "coal_ore", coalCount);

  // Task complete
  bot.chat("Mined 3 coal ore!");
}