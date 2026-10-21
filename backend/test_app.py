import unittest
from backend.app import (
    CaptionWord, ChaptersRequest, ProfanityRequest, SRTRequest,
    export_chapters, export_srt, filter_profanity, health,
)

class ApiFunctionTests(unittest.TestCase):
    def test_health_contract(self):
        result = health()
        self.assertTrue(result["ok"])
        self.assertEqual(result["name"], "OpenCut Studio API")

    def test_srt_timestamps(self):
        response = export_srt(SRTRequest(words=[
            CaptionWord(start=1.25, end=1.7, word=" hello", probability=0.9),
            CaptionWord(start=2.0, end=2.2, word="world", probability=0.8),
        ]))
        text = response.body.decode()
        self.assertIn("00:00:01,250 --> 00:00:01,700", text)
        self.assertIn("world", text)

    def test_profanity_intervals(self):
        response = filter_profanity(ProfanityRequest(
            words=[CaptionWord(start=2, end=2.4, word="BAD!", probability=.9)],
            blocked_terms=["bad"], replacement="bleep",
        ))
        self.assertEqual(response["count"], 1)
        self.assertEqual(response["matches"][0]["tone_hz"], 1000)

    def test_chapter_export(self):
        response = export_chapters(ChaptersRequest(chapters=[
            {"start": 61, "title": "Part Two"}, {"start": 0, "title": "Intro"}
        ]))
        self.assertIn("00:00:00 Intro", response.body.decode())
        self.assertLess(response.body.decode().index("Intro"), response.body.decode().index("Part Two"))

if __name__ == "__main__":
    unittest.main()
