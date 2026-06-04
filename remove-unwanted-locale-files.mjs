import { readdir, unlink } from "node:fs/promises";
import { join, basename } from "node:path";

const PROJECT_ROOT = process.cwd();
const LOCALES_DIR = join(PROJECT_ROOT, "src", "data", "locales");
const REFERENCE_DIR = join(LOCALES_DIR, "en");

const TARGET_LOCALES = ["da", "de", "en", "es", "et", "fr", "it", "ja", "ko", "pt", "th"];

const KEEP_BASENAMES = [
  "AccountSearch.json",
  "AccountSelect.json",
  "AssetDropDownCard.json",
  "Activity.json",
  "MyOpenOrders.json",
  "About.json",
  "CurrentUser.json",
  "DeepLinkDialog.json",
  "ExternalLink.json",
  "Featured.json",
  "CreateSmartcoin.json",
  "Home.json",
  "CreatePrediction.json",
  "LimitOrderCard.json",
  "LTM.json",
  "Market.json",
  "MarketAssetCard.json",
  "MarketOrder.json",
  "MarketOrderCard.json",
  "MarketPlaceholder.json",
  "MarketSummaryTabs.json",
  "MarketTradeContents.json",
  "MyCompletedTrades.json",
  "MyOpenOrders.json",
  "MyOrderSummary.json",
  "MyTradeSummary.json",
  "PageHeader.json",
  "PageFooter.json",
  "Settlement.json",
  "Nodes.json",
  "Predictions.json",
  "IssuedAssets.json",
  "AssetCommon.json",
  "Operations.json",
  "CreateAccount.json",
  "LimitOrderWizard.json",
  "Favourites.json",
  "InstantTrade.json",
  "PortfolioTabs.json",
  "Visuals.json",
  "Transfer.json",
  "Smartcoin.json"
];

const keepSet = new Set(KEEP_BASENAMES);

function listJsonFiles(dir) {
  return readdir(dir, { withFileTypes: true }).then((entries) =>
    entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".json"))
      .map((entry) => entry.name)
  );
}

async function resolveFilesToDelete() {
  const referenceFiles = await listJsonFiles(REFERENCE_DIR);
  const unknownKeeps = KEEP_BASENAMES.filter(
    (name) => !referenceFiles.includes(name)
  );
  if (unknownKeeps.length > 0) {
    console.warn(
      `Warning: the following keep entries were not found in ${REFERENCE_DIR}:` +
        `\n  - ${unknownKeeps.join("\n  - ")}`
    );
  }

  const plan = [];
  for (const locale of TARGET_LOCALES) {
    const localeDir = join(LOCALES_DIR, locale);
    const files = await listJsonFiles(localeDir);
    for (const file of files) {
      if (keepSet.has(file)) continue;
      plan.push({
        locale,
        path: join(localeDir, file),
        size: 0,
      });
    }
  }
  return plan;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = !args.has("--apply");

  const plan = await resolveFilesToDelete();

  if (plan.length === 0) {
    console.log("No files to delete. Nothing to do.");
    return;
  }

  const byLocale = plan.reduce((acc, item) => {
    (acc[item.locale] ??= []).push(item.path);
    return acc;
  }, {});

  console.log(
    `Mode: ${dryRun ? "DRY RUN (no files will be deleted)" : "APPLY (files will be deleted)"}`
  );
  console.log(`Plan: delete ${plan.length} file(s) across ${Object.keys(byLocale).length} locale folder(s).`);
  console.log("");

  for (const [locale, paths] of Object.entries(byLocale)) {
    console.log(`[${locale}] ${paths.length} file(s):`);
    for (const p of paths) console.log(`  - ${p}`);
    console.log("");
  }

  if (dryRun) {
    console.log("Re-run with --apply to actually delete these files.");
    return;
  }

  let deleted = 0;
  for (const item of plan) {
    try {
      await unlink(item.path);
      deleted += 1;
      console.log(`deleted: ${item.path}`);
    } catch (err) {
      console.error(`failed:  ${item.path} (${err.message})`);
    }
  }

  console.log(`\nDone. ${deleted}/${plan.length} file(s) deleted.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
