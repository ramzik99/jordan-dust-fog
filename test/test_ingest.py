import importlib.util
from pathlib import Path
import unittest
import gzip
import json
import tempfile
from datetime import datetime, timezone, timedelta
spec = importlib.util.spec_from_file_location('ingest', Path(__file__).parents[1] / 'scripts' / 'ingest_geos.py')
ingest = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ingest)

class IngestionTests(unittest.TestCase):
    def test_global_export_splits_frames_and_preserves_source_values(self):
        grid = [[0.0] * 288 for _ in range(145)]
        grid[72][0] = None
        data = {'schemaVersion': 1, 'source': 'NASA GEOS-FP', 'coverage': 'global',
            'runTime': '2026-10-17T06:00:00Z', 'retrievedAt': '2026-10-17T09:00:00Z',
            'latitudes': [-90 + i * 1.25 for i in range(145)],
            'longitudes': [-180 + i * 1.25 for i in range(288)],
            'frames': [{'start': '2026-10-17T09:00:00Z', 'end': '2026-10-17T12:00:00Z',
                'validTime': '2026-10-17T10:30:00Z', 'dustSurface': grid, 'dustFine': grid, 'dustAod': grid}]}
        with tempfile.TemporaryDirectory(prefix='test-global-', dir=Path(__file__).resolve().parents[1]) as temp:
            output = Path(temp) / 'latest.json'
            ingest.write_global(data, output)
            manifest = json.loads(output.read_text())
            self.assertNotIn('dustSurface', manifest['frames'][0])
            target = output.parent / manifest['frames'][0]['path']
            decoded = json.loads(gzip.decompress(target.read_bytes()))
            self.assertIsNone(decoded['dustSurface'][72][0])
            self.assertEqual(decoded['dustSurface'][0][0], 0)
            original = target.read_bytes()
            ingest.write_global(data, output)
            self.assertEqual(target.read_bytes(), original)
            data['runTime'] = '2026-10-17T00:00:00Z'
            with self.assertRaises(ValueError):
                ingest.write_global(data, output)

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

    def test_initial_mean_before_run_does_not_shift_forecast_times(self):
        run = datetime(2026, 10, 17, 6, tzinfo=timezone.utc)
        times = [run - timedelta(minutes=90), run + timedelta(minutes=90)]
        bounds = ingest.make_intervals(times, run)
        self.assertEqual(bounds[0], (run - timedelta(hours=3), run))
        self.assertEqual(bounds[1], (run, run + timedelta(hours=3)))

if __name__ == '__main__':
    unittest.main()
