import sys
from pathlib import Path
import unittest
import numpy as np
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from native_dust import pack_field

class NativePacking(unittest.TestCase):
    def test_zero_missing_and_small_positive_are_distinct(self):
        codes, scale = pack_field([0, 1e-9, np.nan, -1, np.inf, 1e15])
        self.assertEqual(codes.tolist(), [0, 1, 65535, 65535, 65535, 65535])
        self.assertGreater(scale, 0)

    def test_quantization_bound(self):
        values = np.geomspace(1e-4, 5000, 10000)
        codes, scale = pack_field(values)
        decoded = np.expm1(codes.astype(float) * scale)
        self.assertTrue(np.all(np.abs(np.log1p(decoded) - np.log1p(values)) <= scale * 1.001))
        self.assertTrue(np.all(codes < 65535))

    def test_all_missing(self):
        codes, scale = pack_field(np.full((3, 4), np.nan))
        self.assertTrue(np.all(codes == 65535))
        self.assertTrue(np.isfinite(scale))
