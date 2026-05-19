import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { deflateSync } from "node:zlib";

const appIconPath = "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png";
const splashPaths = [
  "ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png",
  "ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-1.png",
  "ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-2.png",
];

const font = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01110"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
};

class Raster {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = Buffer.alloc(width * height * 3);
  }

  setPixel(x, y, color) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return;
    }

    const offset = (Math.floor(y) * this.width + Math.floor(x)) * 3;
    this.data[offset] = color[0];
    this.data[offset + 1] = color[1];
    this.data[offset + 2] = color[2];
  }

  fillGradient(top, bottom) {
    for (let y = 0; y < this.height; y += 1) {
      const ratio = y / (this.height - 1);
      const color = mix(top, bottom, ratio);

      for (let x = 0; x < this.width; x += 1) {
        this.setPixel(x, y, color);
      }
    }
  }

  fillEllipse(cx, cy, rx, ry, color, shade = false) {
    const minX = Math.max(0, Math.floor(cx - rx));
    const maxX = Math.min(this.width - 1, Math.ceil(cx + rx));
    const minY = Math.max(0, Math.floor(cy - ry));
    const maxY = Math.min(this.height - 1, Math.ceil(cy + ry));

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;

        if (dx * dx + dy * dy <= 1) {
          const shadow = shade ? Math.max(0, (dx + dy) * 0.18) : 0;
          this.setPixel(x, y, darken(color, shadow));
        }
      }
    }
  }

  fillCircle(cx, cy, radius, color) {
    this.fillEllipse(cx, cy, radius, radius, color);
  }

  fillRect(x, y, width, height, color) {
    for (let yy = y; yy < y + height; yy += 1) {
      for (let xx = x; xx < x + width; xx += 1) {
        this.setPixel(xx, yy, color);
      }
    }
  }

  fillTriangle(ax, ay, bx, by, cx, cy, color) {
    const minX = Math.floor(Math.min(ax, bx, cx));
    const maxX = Math.ceil(Math.max(ax, bx, cx));
    const minY = Math.floor(Math.min(ay, by, cy));
    const maxY = Math.ceil(Math.max(ay, by, cy));
    const area = edge(ax, ay, bx, by, cx, cy);

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const w0 = edge(bx, by, cx, cy, x, y);
        const w1 = edge(cx, cy, ax, ay, x, y);
        const w2 = edge(ax, ay, bx, by, x, y);

        if ((area >= 0 && w0 >= 0 && w1 >= 0 && w2 >= 0) || (area < 0 && w0 <= 0 && w1 <= 0 && w2 <= 0)) {
          this.setPixel(x, y, color);
        }
      }
    }
  }

  drawString(text, x, y, scale, color) {
    let cursorX = x;

    for (const character of text) {
      if (character === " ") {
        cursorX += scale * 3;
        continue;
      }

      const glyph = font[character];

      if (!glyph) {
        continue;
      }

      glyph.forEach((row, rowIndex) => {
        [...row].forEach((pixel, columnIndex) => {
          if (pixel === "1") {
            this.fillRect(cursorX + columnIndex * scale, y + rowIndex * scale, scale, scale, color);
          }
        });
      });

      cursorX += scale * 6;
    }
  }
}

await writePng(appIconPath, createIcon());

for (const splashPath of splashPaths) {
  await writePng(splashPath, createSplash());
}

console.log("Generated iOS app icon and splash assets.");

function createIcon() {
  const image = new Raster(1024, 1024);
  image.fillGradient([157, 230, 255], [248, 251, 255]);
  image.fillCircle(166, 180, 80, [255, 255, 255]);
  image.fillCircle(245, 164, 62, [255, 255, 255]);
  image.fillCircle(830, 156, 90, [255, 255, 255]);
  image.fillCircle(742, 176, 68, [255, 255, 255]);
  image.fillEllipse(512, 438, 260, 310, [244, 91, 105], true);
  image.fillCircle(420, 308, 42, [255, 218, 224]);
  image.fillTriangle(468, 733, 556, 733, 512, 808, [210, 67, 84]);
  image.fillRect(503, 798, 18, 150, [92, 92, 92]);
  image.fillEllipse(512, 1010, 620, 230, [139, 211, 95]);
  image.drawString("POP", 236, 418, 42, [255, 255, 255]);
  return image;
}

function createSplash() {
  const image = new Raster(2732, 2732);
  image.fillGradient([157, 230, 255], [248, 251, 255]);
  image.fillCircle(470, 430, 185, [255, 255, 255]);
  image.fillCircle(650, 400, 140, [255, 255, 255]);
  image.fillCircle(2180, 360, 220, [255, 255, 255]);
  image.fillCircle(1970, 390, 150, [255, 255, 255]);
  image.fillEllipse(1366, 1110, 430, 520, [244, 91, 105], true);
  image.fillCircle(1210, 880, 76, [255, 218, 224]);
  image.fillTriangle(1284, 1618, 1448, 1618, 1366, 1750, [210, 67, 84]);
  image.fillRect(1351, 1740, 30, 330, [92, 92, 92]);
  image.fillEllipse(1366, 2770, 1720, 620, [139, 211, 95]);
  image.drawString("SIGHT WORD POP", 422, 2020, 54, [16, 45, 73]);
  image.drawString("TAP THE WORD YOU HEAR", 350, 2380, 34, [47, 141, 69]);
  return image;
}

async function writePng(path, raster) {
  await mkdir(dirname(path), { recursive: true });
  const raw = Buffer.alloc((raster.width * 3 + 1) * raster.height);

  for (let y = 0; y < raster.height; y += 1) {
    const sourceStart = y * raster.width * 3;
    const destinationStart = y * (raster.width * 3 + 1);
    raw[destinationStart] = 0;
    raster.data.copy(raw, destinationStart + 1, sourceStart, sourceStart + raster.width * 3);
  }

  await writeFile(
    path,
    Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      chunk("IHDR", createIhdr(raster.width, raster.height)),
      chunk("IDAT", deflateSync(raw, { level: 9 })),
      chunk("IEND", Buffer.alloc(0)),
    ]),
  );
}

function createIhdr(width, height) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return ihdr;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;

    for (let index = 0; index < 8; index += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function edge(ax, ay, bx, by, cx, cy) {
  return (cx - ax) * (by - ay) - (cy - ay) * (bx - ax);
}

function mix(start, end, ratio) {
  return start.map((value, index) => Math.round(value + (end[index] - value) * ratio));
}

function darken(color, amount) {
  return color.map((value) => Math.max(0, Math.round(value * (1 - amount))));
}
