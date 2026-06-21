import asyncio
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools" / "pydeps"))

import edge_tts

SCRIPT = ROOT / "demo" / "tamil-voiceover-script.txt"
OUTPUT = ROOT / "demo" / "tamil-voiceover-neural.mp3"


async def main():
    text = SCRIPT.read_text(encoding="utf-8-sig")
    voice = "ta-IN-PallaviNeural"
    communicate = edge_tts.Communicate(
        text=text,
        voice=voice,
        rate="-4%",
        pitch="-2Hz",
    )
    await communicate.save(str(OUTPUT))
    print(OUTPUT)


if __name__ == "__main__":
    asyncio.run(main())
