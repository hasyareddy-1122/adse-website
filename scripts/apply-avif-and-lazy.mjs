import fs from "node:fs/promises";
import path from "node:path";

const SRC_DIR = path.resolve("src");

// 1. Update CSS background-image url('/assets/...') to use image-set() with AVIF first + fallback
async function updateCssFiles() {
  const entries = await fs.readdir(SRC_DIR, { withFileTypes: true, recursive: true });
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".css")) continue;
    const filePath = path.join(entry.parentPath || entry.path, entry.name);
    let css = await fs.readFile(filePath, "utf8");
    const original = css;

    css = css.replace(
      /url\(\s*(['"]?)(\/assets\/[^'"\)]+)\.(png|jpe?g|webp)\1\s*\)/gi,
      (_, quote, base, ext) =>
        `image-set(url("${base}.avif") type("image/avif"), url("${base}.${ext}") type("image/${ext.toLowerCase() === "jpg" ? "jpeg" : ext.toLowerCase()}"))`
    );

    if (css !== original) {
      await fs.writeFile(filePath, css, "utf8");
      console.log(`✓ CSS updated: ${path.relative(process.cwd(), filePath)}`);
    }
  }
}

// 2. Update JSX files to use <OptimizedImage> (with .avif imports for static ES imports)
async function updateJsxFiles() {
  const entries = await fs.readdir(SRC_DIR, { withFileTypes: true, recursive: true });

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".jsx")) continue;
    if (entry.name === "OptimizedImage.jsx") continue;

    const filePath = path.join(entry.parentPath || entry.path, entry.name);
    let code = await fs.readFile(filePath, "utf8");
    const original = code;

    // Track static asset imports: import fooImg from "../assets/bar.png";
    const assetImports = new Map();
    code = code.replace(
      /^import\s+([A-Za-z0-9_$]+)\s+from\s+["'](\.\.\/assets\/[^"']+)\.(png|jpe?g|webp)["'];?\s*$/gm,
      (match, varName, basePath, ext) => {
        const avifVar = `${varName}Avif`;
        assetImports.set(varName, avifVar);
        return `import ${varName} from "${basePath}.${ext}";\nimport ${avifVar} from "${basePath}.avif";`;
      }
    );

    // Replace inline string "/assets/kuriakose_chavara.png" inside arrays if present
    code = code.replace(
      /["']\/assets\/([^"']+)\.(png|jpe?g|webp)["']/gi,
      (_, base, ext) => `"/assets/${base}.${ext}"`
    );

    // Replace <img ... /> with <OptimizedImage ... />
    const isNavbar = entry.name === "Navbar.jsx";
    let imgIndex = 0;

    code = code.replace(/<img\b([\s\S]*?)\/?>/g, (fullMatch, attrs) => {
      imgIndex += 1;
      let nextAttrs = attrs;

      // Remove existing loading= attribute so OptimizedImage controls it
      nextAttrs = nextAttrs.replace(/\s+loading=(["'][^"']*["']|\{[^}]*\})/g, "");

      // If src={someVar} matches a static asset import, inject avifSrc={someVarAvif}
      const srcVarMatch = nextAttrs.match(/\bsrc=\{([A-Za-z0-9_$]+)\}/);
      if (srcVarMatch && assetImports.has(srcVarMatch[1])) {
        const avifVar = assetImports.get(srcVarMatch[1]);
        if (!/\bavifSrc=/.test(nextAttrs)) {
          nextAttrs += ` avifSrc={${avifVar}}`;
        }
      }

      // Mark Navbar logo or first hero image as priority (eager + fetchPriority="high")
      const isPriority = isNavbar && imgIndex === 1;
      if (isPriority && !/\bpriority\b/.test(nextAttrs)) {
        nextAttrs += " priority";
      }

      return `<OptimizedImage${nextAttrs} />`;
    });

    // Inject OptimizedImage import if <OptimizedImage was added
    if (code.includes("<OptimizedImage") && !code.includes("OptimizedImage.jsx")) {
      const relDepth = path.relative(path.dirname(filePath), path.join(SRC_DIR, "components")).replace(/\\/g, "/");
      const importPath = `${relDepth.startsWith(".") ? relDepth : `./${relDepth}`}/OptimizedImage.jsx`;
      code = `import OptimizedImage from "${importPath}";\n${code}`;
    }

    if (code !== original) {
      await fs.writeFile(filePath, code, "utf8");
      console.log(`✓ JSX updated: ${path.relative(process.cwd(), filePath)}`);
    }
  }
}

await updateCssFiles();
await updateJsxFiles();
console.log("\nAll CSS and JSX files updated with AVIF + lazy loading.");