import sys
from pathlib import Path
import unittest
import numpy as np
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from ingest_synoptic import convert_field

class SynopticFields(unittest.TestCase):
    def test_units_and_negative_temperature(self):
        np.testing.assert_allclose(convert_field([273.15, 263.15], 'temp'), [0, -10])
        np.testing.assert_allclose(convert_field([5600, 5700], 'gh'), [560, 570])

    def test_missing_values_do_not_become_contours(self):
        self.assertTrue(np.isnan(convert_field([1e15, np.inf, -10], 'temp')).all())
        self.assertTrue(np.isnan(convert_field([1e15, np.nan, 80], 'temp')).all())

    def test_pressure_surfaces_below_terrain_are_masked(self):
        values = convert_field([280, 280, 280, 280], 'temp', [90000, 80000, np.nan, 1e15], 850)
        self.assertAlmostEqual(values[0], 6.9)
        self.assertTrue(np.isnan(values[1:]).all())
