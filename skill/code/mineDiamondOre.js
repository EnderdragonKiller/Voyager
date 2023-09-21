async function mineDiamondOre(bot) {
  const diamondOreName = "diamond_ore";
  const diamondOreCount = 3;
  const pickaxeNames = ["iron_pickaxe", "diamond_pickaxe"];

  // Check if we already have enough diamond ore
  const diamondOre = bot.inventory.findInventoryItem(mcData.itemsByName[diamondOreName].id);
  if (diamondOre && diamondOre.count >= diamondOreCount) {
    bot.chat("Already have enough diamond ore!");
    return;
  }

  // Check if we have an iron or diamond pickaxe
  const pickaxe = pickaxeNames.find(name => bot.inventory.findInventoryItem(mcData.itemsByName[name].id));
  if (!pickaxe) {
    bot.chat("Need an iron or diamond pickaxe to mine diamond ore!");
    return;
  }

  // Use exploreUntil to find diamond ore blocks
  await exploreUntil(bot, new Vec3(0, -1, 0), 60, () => {
    const diamondOre = bot.findBlock({
      matching: mcData.blocksByName[diamondOreName].id,
      maxDistance: 32
    });
    return diamondOre;
  });

  // Mine diamond ore blocks until we have enough
  await mineBlock(bot, diamondOreName, diamondOreCount);

  // Task complete
  bot.chat("Mined 3 diamond ore!");
}

// Call the main function