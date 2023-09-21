async function mineIronOre(bot) {
  const ironOreName = "iron_ore";
  const ironOreCount = 3;

  // Check if you have enough iron ore in your inventory
  const ironOre = bot.inventory.findInventoryItem(mcData.itemsByName[ironOreName].id);
  if (ironOre && ironOre.count >= ironOreCount) {
    bot.chat("Already have enough iron ore!");
    return;
  }

  // Check if you have torches in your inventory
  const torches = bot.inventory.findInventoryItem(mcData.itemsByName["torch"].id);
  if (!torches) {
    // Craft torches using coal and sticks
    await craftItem(bot, "torch", 16);
  }

  // Use exploreUntil to find an iron ore vein
  await exploreUntil(bot, new Vec3(0, -1, 0), 60, () => {
    const ironOre = bot.findBlock({
      matching: mcData.blocksByName[ironOreName].id,
      maxDistance: 32
    });
    return ironOre;
  });

  // Mine iron ore blocks until you have enough
  await mineBlock(bot, ironOreName, ironOreCount);

  // Task complete
  bot.chat("Mined 3 iron ore!");
}

// Call the main function