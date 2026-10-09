"""Delivery-copy checks without network access or production writes."""
import importlib.util
import json
from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch
from PIL import Image

spec=importlib.util.spec_from_file_location("portrait_sync",Path(__file__).with_name("sync-portraits.py"))
sync=importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)

class PortraitCopies(unittest.TestCase):
    def run_copy(self,size):
        image=Image.new("RGBA",size,(40,100,200,255))
        image.paste((0,0,0,0),(0,0,16,16))
        encoded=BytesIO()
        image.save(encoded,format="PNG")
        with TemporaryDirectory() as folder:
            root=Path(folder)
            output=root/"public/hero-portraits"
            output.mkdir(parents=True)
            with patch.object(sync,"ROOT",root),patch.object(sync,"OUTPUT",output),patch.object(sync,"existing",{}),patch.object(sync,"read",return_value=encoded.getvalue()) as download:
                name,copies,downloaded=sync.render("qa.png")
                self.assertEqual(name,"qa.png")
                self.assertEqual(downloaded,len(encoded.getvalue()))
                sizes={}
                for kind,path in copies.items():
                    with Image.open(root/"public"/path) as result:
                        sizes[kind]=result.size
                        self.assertEqual(result.mode,"RGBA")
                        self.assertEqual(result.getpixel((0,0))[3],0)
                with patch.object(sync,"existing",{name:copies}):
                    download.reset_mock()
                    self.assertEqual(sync.render(name)[2],0)
                    download.assert_not_called()
                return sizes

    def test_small_original_is_not_enlarged_and_alpha_survives(self):
        sizes=self.run_copy((64,96))
        self.assertEqual(sizes,{"thumb":(64,96),"detail":(64,96)})

    def test_thumbnail_detail_sizes_keep_aspect_ratio(self):
        sizes=self.run_copy((1024,512))
        self.assertEqual(sizes,{"thumb":(256,128),"detail":(768,384)})

    def test_failed_copy_removes_broken_local_manifest_entry(self):
        old={"missing.png":{"thumb":"hero-portraits/missing-256.webp","detail":"hero-portraits/missing-768.webp"}}
        with TemporaryDirectory() as folder:
            root=Path(folder)
            manifest=root/"manifest.json"
            manifest.write_text(json.dumps(old))
            responses=[json.dumps([{"portrait":"missing.png"}]).encode(),OSError("test offline")]
            with patch.object(sync,"ROOT",root),patch.object(sync,"MANIFEST",manifest),patch.object(sync,"existing",old),patch.object(sync,"read",side_effect=responses):
                sync.main()
            self.assertEqual(json.loads(manifest.read_text()),{})

    def test_custom_icons_are_copied_without_profile_media_or_traversal(self):
        with TemporaryDirectory() as folder:
            manifest=Path(folder)/"manifest.json"
            responses=[json.dumps([{"portrait":"hero.webp"}]).encode(),json.dumps([
                {"icon_path":"mods-icons/type.webp"},
                {"icon_path":"profile-avatars/user/avatar.webp"},
                {"icon_path":"mods-icons/../private.webp"}
            ]).encode()]
            with patch.object(sync,"MANIFEST",manifest),patch.object(sync,"existing",{}),patch.object(sync,"read",side_effect=responses),patch.object(sync,"render",side_effect=lambda path:(path,None,0)) as render:
                sync.main()
            self.assertEqual({call.args[0] for call in render.call_args_list},{"hero.webp","mods-icons/type.webp"})

if __name__=="__main__":
    unittest.main()
