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

class GlobalForecast(unittest.TestCase):
    def test_sampling_coordinates_wrap_and_missing_values(self):
        from ingest_gfs import sample_grid
        source=np.broadcast_to(np.linspace(90,-90,181)[:,None],(181,360)).copy()
        actual=sample_grid(source)
        self.assertEqual(actual.shape,(145,288))
        np.testing.assert_allclose(actual[:,0],np.linspace(-90,90,145))
        source[0,180]=np.nan
        self.assertTrue(np.isnan(sample_grid(source)[-1,0]))

    def test_index_requires_every_level_and_surface_pressure(self):
        from ingest_gfs import selected_ranges
        records=[(name,f'{lev} mb') for name in ('HGT','TMP') for lev in (925,850,700,500,300)]+[('PRES','surface')]
        index='\n'.join(f'{i+1}:{i*100}:d=2026101812:{name}:{lev}:384 hour fcst:' for i,(name,lev) in enumerate(records))
        ranges=selected_ranges(index)
        self.assertEqual(len(ranges),11)
        self.assertEqual(ranges[0][2:],(0,99))
        self.assertIsNone(ranges[-1][3])
        with self.assertRaises(ValueError):selected_ranges('\n'.join(index.splitlines()[:-1]))
