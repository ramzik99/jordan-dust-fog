import importlib.util
from pathlib import Path
import unittest
from datetime import datetime, timezone, timedelta
spec = importlib.util.spec_from_file_location('ingest', Path(__file__).parents[1] / 'scripts' / 'ingest_geos.py')
ingest = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ingest)

class IngestionTests(unittest.TestCase):
    def test_cycle_selection_refuses_old_future_and_invalid_cycles(self):
        now = datetime(2026, 10, 17, 9, tzinfo=timezone.utc)
        html = ' '.join('tavg3_2d_aer_Nx.' + token for token in
            ['20261017_06', '20261017_00', '20261017_12', '20261001_00', '20261017_05'])
        self.assertEqual([c[1] for c in ingest.find_cycles(html, now)], ['20261017_06', '20261017_00'])

    def test_units_and_missing_data(self):
        self.assertEqual(ingest.clean_value(1e-7, 1e9), 100)
        self.assertEqual(ingest.clean_value(0, 1e9), 0)
        for value in [float('nan'), float('inf'), -1, 1e15]:
            self.assertIsNone(ingest.clean_value(value, 1e9))

    def test_averaging_intervals_are_bounded(self):
        run = datetime(2026, 10, 17, 6, tzinfo=timezone.utc)
        times = [run + timedelta(hours=4.5), run + timedelta(hours=7.5)]
        bounds = ingest.make_intervals(times, run)
        self.assertEqual(bounds[0][1], bounds[1][0])
        with self.assertRaises(ValueError):
            ingest.make_intervals([times[0], times[1] + timedelta(hours=1)], run)

if __name__ == '__main__':
    unittest.main()
