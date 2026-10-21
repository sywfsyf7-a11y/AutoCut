import math,tempfile,unittest,wave
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import opencut_core as core

def make_wav(path):
    rate=16000; chunks=[]
    for start,duration in ((0,1),(1,1),(2,1)):
        for i in range(rate*duration):
            sample=0 if start==1 else int(8000*math.sin(2*math.pi*440*(i/rate)))
            chunks.append(sample.to_bytes(2,"little",signed=True))
    with wave.open(str(path),"wb") as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate);w.writeframes(b"".join(chunks))

class CoreTests(unittest.TestCase):
    def test_detects_silence(self):
        with tempfile.TemporaryDirectory() as tmp:
            p=Path(tmp)/"in.wav";make_wav(p)
            cuts,d=core.detect_silence(p,threshold_db=-35,min_silence_sec=.3,min_talk_sec=.1,padding_before=.1,padding_after=.1)
            self.assertAlmostEqual(d,3,places=2);self.assertEqual(len(cuts),1)
            self.assertEqual(len(core.keep_intervals(d,cuts)),2)
    def test_render_wav(self):
        with tempfile.TemporaryDirectory() as tmp:
            p=Path(tmp)/"in.wav";o=Path(tmp)/"out.wav";make_wav(p)
            core.render_wav(p,o,[(0,1),(2,3)])
            with wave.open(str(o),"rb") as w:self.assertAlmostEqual(w.getnframes()/w.getframerate(),2,places=2)
    def test_exports(self):
        with tempfile.TemporaryDirectory() as tmp:
            p=Path(tmp)/"x.edl";core.export_edl(p,"input.wav",[(0,1),(2,3)],30)
            self.assertIn("TITLE: OPENCUT STUDIO",p.read_text())
if __name__=="__main__":unittest.main()
