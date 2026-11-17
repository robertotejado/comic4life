const fs = require('node:fs');
const path = require('node:path');

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'linux') {
    return;
  }

  const exeName = (context.packager && context.packager.executableName) || 'comic4life';
  const exePath = path.join(context.appOutDir, exeName);
  const binPath = path.join(context.appOutDir, `${exeName}.bin`);

  if (!fs.existsSync(exePath)) {
    return;
  }

  fs.renameSync(exePath, binPath);
  fs.chmodSync(binPath, 0o755);

  const launcher = `#!/bin/sh
SELF="$(readlink -f "$0" 2>/dev/null || printf '%s' "$0")"
DIR="$(dirname "$SELF")"
if [ -n "$APPIMAGE" ] || [ ! -u "$DIR/chrome-sandbox" ] || [ "$(stat -c '%u' "$DIR/chrome-sandbox" 2>/dev/null)" != "0" ]; then
  exec "$DIR/${exeName}.bin" --no-sandbox "$@"
else
  exec "$DIR/${exeName}.bin" "$@"
fi
`;

  fs.writeFileSync(exePath, launcher, { mode: 0o755 });
  fs.chmodSync(exePath, 0o755);
};
